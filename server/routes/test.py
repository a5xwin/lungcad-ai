import sys
import io
import pydicom
import json
binary_data = sys.stdin.buffer.read()
dicom_file = io.BytesIO(binary_data)

try:
    dicom_data = pydicom.dcmread(dicom_file)
    image = dicom_data.pixel_array
except Exception as e:
    print("dude")
    print(f"Error: {str(e)}", file=sys.stderr)

import cv2
import numpy as np
from skimage.segmentation import clear_border
from skimage import measure
from skimage.measure import label,regionprops
from scipy import ndimage as ndi
from scipy.ndimage import measurements, center_of_mass, binary_dilation

# -----Mask Functions----
def remove_trachea(slc, c=0.0069):
    new_slc = slc.copy()
    labels = label(slc,connectivity=1,background=0)
    rps = regionprops(labels)
    areas = np.array([r.area for r in rps])
    idxs = np.where(areas/512**2 < c)[0]
    for i in idxs:
        new_slc[tuple(rps[i].coords.T)] = 0
    return new_slc

def delete_table(slc):
    new_slc = slc.copy()
    labels = label(slc, background=0)
    idxs = np.unique(labels)[1:]
    COM_ys = np.array([center_of_mass(labels==i)[0] for i in idxs])
    for idx, COM_y in zip(idxs, COM_ys):
        if (COM_y < 0.3*slc.shape[0]):
            new_slc[labels==idx] = 0
        elif (COM_y > 0.6*slc.shape[0]):
            new_slc[labels==idx] = 0
    return new_slc

def get_mask(image):
    mask = image < 700
    mask = np.vectorize(clear_border, signature='(n,m)->(n,m)')(mask)
    mask = np.vectorize(label,signature='(n,m)->(n,m)')(mask)
    rps = regionprops(mask)
    areas = [r.area for r in rps]
    areas = np.argsort(areas)[::-1]
    new_slc = np.zeros_like(mask)
    for i in areas[:3]:
        new_slc[tuple(rps[i].coords.T)] = i+1
    mask = new_slc>0
    mask = np.vectorize(ndi.binary_fill_holes,signature='(n,m)->(n,m)')(mask)
    mask = np.vectorize(remove_trachea, signature='(n,m)->(n,m)')(mask)
    mask = np.vectorize(delete_table, signature='(n,m)->(n,m)')(mask)
    new_mask = binary_dilation(mask,iterations=2)
    return new_mask

import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.nn.functional as F

# --- MODEL CLASSES ---
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
        B, N, D = x.shape
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
    def __init__(self,
                 img_size=224,
                 patch_size=16,
                 in_chans=1,
                 num_classes=2,
                 embed_dim=256,
                 depth=2,
                 num_heads=8,
                 mlp_ratio=4.,
                 dropout=0.,
                 reduction=16):
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

# Load trained SE-ViT model architecture
device = torch.device("cpu")
model = SE_ViT(
    img_size=224,
    patch_size=16,
    in_chans=1,
    num_classes=2,
    embed_dim=256,
    depth=2,
    num_heads=8,
    mlp_ratio=4.,
    dropout=0.1,
    reduction=16
)

# Load model weights
import os
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "best_sevit_model.pth")

model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

masked_ct = image * get_mask(image)  # Apply the lung mask for classification
 
# Sliding Window Parameters
PATCH_SIZE = 48
STEP_SIZE = 24
RESIZE_SIZE = 224

# Create an empty heatmap & counter map
heatmap = np.zeros_like(image, dtype=np.float32)
counter = np.zeros_like(image, dtype=np.float32)

# Scan through the masked lung region
for y in range(0, masked_ct.shape[0] - PATCH_SIZE, STEP_SIZE):
    for x in range(0, masked_ct.shape[1] - PATCH_SIZE, STEP_SIZE):
        patch = masked_ct[y:y+PATCH_SIZE, x:x+PATCH_SIZE]

        # Resize to 224x224 for model input
        patch_resized = cv2.resize(patch, (RESIZE_SIZE, RESIZE_SIZE), interpolation=cv2.INTER_CUBIC)

        # Convert to tensor (1, 1, 224, 224)
        patch_tensor = torch.tensor(patch_resized, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
        patch_tensor = patch_tensor.to(device)

        # Run inference
        with torch.no_grad():
            output = model(patch_tensor)
            probs = torch.softmax(output, dim=1)
            pred_class = torch.argmax(probs, dim=1).item()
            confidence = probs.max().item()

        # Update heatmap and counter
        if pred_class == 1:
            heatmap[y:y+PATCH_SIZE, x:x+PATCH_SIZE] += confidence
            counter[y:y+PATCH_SIZE, x:x+PATCH_SIZE] += 1

# Normalize heatmap
heatmap[counter > 0] /= counter[counter > 0]

# 🔹 **Resize Heatmap to Match Full Image** (For Projection)
heatmap_resized = cv2.resize(heatmap, (image.shape[1], image.shape[0]), interpolation=cv2.INTER_CUBIC)
if np.sum(counter) > 0:
    overall_confidence_avg = np.sum(heatmap * counter) / np.sum(counter)
else:
    overall_confidence_avg = 0

threshold_confidence = 0.7  # Example threshold
# Here, we say that if the maximum confidence is above threshold, classify as cancerous
overall_prediction = 1 if overall_confidence_avg > threshold_confidence else 0
metadata = {
        "name": str(dicom_data.PatientName) if hasattr(dicom_data, 'PatientName') else "",
        "id": str(dicom_data.PatientID) if hasattr(dicom_data, 'PatientID') else "",
        "seriesUID": str(dicom_data.SeriesInstanceUID) if hasattr(dicom_data, 'SeriesInstanceUID') else "",
        "prediction": str(overall_prediction),
        "confidence": str(overall_confidence_avg)
}
metadata_bytes = (json.dumps(metadata) + '\n').encode('utf-8')
sys.stderr.buffer.write(metadata_bytes)


# 🔹 **Overlay the Resized Heatmap on the Original CT Image**
plt.figure(figsize=(10, 10))
plt.imshow(image, cmap='gray')  # Show full original image
plt.imshow(heatmap_resized, cmap='jet', alpha=0.5)  # Overlay heatmap
plt.colorbar(label="Cancer Probability")
plt.title("Lung Cancer Detection Heatmap")
buf = io.BytesIO()
plt.savefig(buf, format='png',bbox_inches='tight')
buf.seek(0)
sys.stdout.buffer.write(buf.getvalue())
sys.stdout.buffer.flush()
plt.close()


