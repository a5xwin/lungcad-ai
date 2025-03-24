import sys
import pydicom
import io
import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.nn.functional as F

# ✅ Read binary data from stdin
binary_data = sys.stdin.buffer.read()

# ✅ Convert binary data back into a file-like object
dicom_file = io.BytesIO(binary_data)

# ✅ Read the DICOM file
try:
    dicom_data = pydicom.dcmread(dicom_file)
    print("DICOM file successfully loaded!")
    
    # ✅ Print basic DICOM metadata
    print(f"Patient Name: {dicom_data.PatientName}")
    print(f"Modality: {dicom_data.Modality}")

except Exception as e:
    print(f"Error processing DICOM file: {str(e)}", file=sys.stderr)
    sys.exit(1)  # Exit with error code 1
