import os
import sys
import torch
import cv2
import numpy as np
import pydicom
import io
import torch.nn as nn
import torch.nn.functional as F
from flask import jsonify
import json

# ✅ Read binary data from stdin
binary_data = sys.stdin.buffer.read()

# ✅ Convert binary data back into a file-like object
dicom_file = io.BytesIO(binary_data)

# ✅ Read the DICOM file
try:
    data = pydicom.dcmread(dicom_file, force=True)
except Exception as e:
    print(f"Error processing DICOM file: {str(e)}", file=sys.stderr)
    sys.exit(1)  # Exit with error code 1

# ✅ Extract pixel array
image = data.pixel_array.astype(np.float32)  # Convert uint16 → float32
image = (image - np.min(image)) / (np.max(image) - np.min(image))  # Normalize (0-1)

# ✅ Save for debugging
cv2.imwrite("inputimage.png", (image * 255).astype(np.uint8))

# Define Model Classes
class MLP(nn.Module):
    def __init__(self, in_features, hidden_features=None, dropout=0.):
        super().__init__()
        hidden_features = hidden_features or in_features
        self.fc1 = nn.Linear(in_features, hidden_features)
        self.act = nn.GELU()
        self.fc2 = nn.Linear(hidden_features, in_features)
        self.drop = nn.Dropout(dropout)

    def forward(self, x):
        x = self.fc1(x)
        x = self.act(x)
        x = self.drop(x)
        x = self.fc2(x)
        x = self.drop(x)
        return x

class SEBlock(nn.Module):
    def __init__(self, dim, reduction=16):
        super().__init__()
        self.fc1 = nn.Linear(dim, dim // reduction)
        self.relu = nn.ReLU(inplace=True)
        self.fc2 = nn.Linear(dim // reduction, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        w = self.fc1(x)
        w = self.relu(w)
        w = self.fc2(w)
        w = self.sigmoid(w)
        return x * w

class SEViTBlock(nn.Module):
    def __init__(self, dim, num_heads, mlp_ratio=4., dropout=0., reduction=16):
        super().__init__()
        self.norm1 = nn.LayerNorm(dim)
        self.se = SEBlock(dim, reduction)
        self.attn = nn.MultiheadAttention(embed_dim=dim, num_heads=num_heads, dropout=dropout)
        self.norm2 = nn.LayerNorm(dim)
        self.mlp = MLP(in_features=dim, hidden_features=int(dim * mlp_ratio), dropout=dropout)

    def forward(self, x):
        cls_token = x[:, :1, :]
        img_tokens = x[:, 1:, :]
        img_tokens = self.se(img_tokens)
        x = torch.cat([cls_token, img_tokens], dim=1)
        x_res = x
        x = self.norm1(x)
        x = x.transpose(0, 1)
        attn_out, _ = self.attn(x, x, x)
        x = attn_out.transpose(0, 1)
        x = x_res + x
        x = x + self.mlp(self.norm2(x))
        return x

class PatchEmbed(nn.Module):
    def __init__(self, img_size=224, patch_size=16, in_chans=1, embed_dim=256):
        super().__init__()
        self.img_size = img_size
        self.patch_size = patch_size
        self.num_patches = (img_size // patch_size) ** 2
        self.proj = nn.Conv2d(in_chans, embed_dim, kernel_size=patch_size, stride=patch_size)

    def forward(self, x):
        x = self.proj(x)
        x = x.flatten(2)
        x = x.transpose(1, 2)
        return x

class SE_ViT(nn.Module):
    def __init__(self, img_size=224, patch_size=16, in_chans=1, num_classes=2,
                 embed_dim=256, depth=2, num_heads=8, mlp_ratio=4., dropout=0., reduction=16):
        super().__init__()
        self.patch_embed = PatchEmbed(img_size, patch_size, in_chans, embed_dim)
        num_patches = self.patch_embed.num_patches
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
        self.pos_embed = nn.Parameter(torch.zeros(1, num_patches + 1, embed_dim))
        self.pos_drop = nn.Dropout(dropout)
        self.blocks = nn.ModuleList([
            SEViTBlock(embed_dim, num_heads, mlp_ratio, dropout, reduction)
            for _ in range(depth)
        ])
        self.norm = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, num_classes)
        self._init_weights()

    def _init_weights(self):
        nn.init.trunc_normal_(self.pos_embed, std=0.02)
        nn.init.trunc_normal_(self.cls_token, std=0.02)
        nn.init.trunc_normal_(self.head.weight, std=0.02)
        if self.head.bias is not None:
            nn.init.zeros_(self.head.bias)

    def forward(self, x):
        B = x.shape[0]
        x = self.patch_embed(x)
        cls_tokens = self.cls_token.expand(B, -1, -1)
        x = torch.cat((cls_tokens, x), dim=1)
        x = x + self.pos_embed
        x = self.pos_drop(x)
        for blk in self.blocks:
            x = blk(x)
        x = self.norm(x)
        cls_final = x[:, 0]
        logits = self.head(cls_final)
        return logits

# ✅ Load Model
if __name__ == "__main__":

    model_path = os.path.join(os.path.dirname(__file__), "best_sevit_model.pth")
    device = torch.device("cpu")
    model = SE_ViT()
    try:
        model.load_state_dict(torch.load(model_path, map_location=device))
    except FileNotFoundError:
        print("Error: Model file 'best_sevit_model.pth' not found.", file=sys.stderr)
        sys.exit(1)

    model.to(device)
    model.eval()

    # ✅ Resize & Normalize Image
    image = cv2.resize(image, (224, 224), interpolation=cv2.INTER_CUBIC)
    image = np.expand_dims(image, axis=0)  # Add channel dimension
    image_tensor = torch.tensor(image, dtype=torch.float32).unsqueeze(0).to(device)

    # ✅ Inference
    threshold = 0.6
    with torch.no_grad():
        output = model(image_tensor)
        probs = torch.softmax(output, dim=1)
        pred_class = torch.argmax(probs, dim=1).item()
        confidence = probs.max().item()
        result = pred_class if confidence > threshold else (1 if pred_class == 0 else 0)

    # ✅ Print Final Prediction
    print(json.dumps({"result": result, "confidence": confidence}))
    sys.stdout.flush()
    # print(f"Prediction: {pred_class} Output: {result} (Confidence: {confidence:.4f})")
