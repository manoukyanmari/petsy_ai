#!/usr/bin/env python3
from PIL import Image
import os
import subprocess

# Create iconset
iconset_path = '/Users/mariammanukyan/Desktop/petsy-app/assets/Parrot.iconset'
os.makedirs(iconset_path, exist_ok=True)

# Load the base image
img = Image.open('/Users/mariammanukyan/Desktop/petsy-app/assets/icon.png')

# Create different sizes needed for ICNS
sizes = [16, 32, 64, 128, 256, 512]

for size in sizes:
    # Create both 1x and 2x versions
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(f'{iconset_path}/icon_{size}x{size}.png')
    
    resized_2x = img.resize((size*2, size*2), Image.Resampling.LANCZOS)
    resized_2x.save(f'{iconset_path}/icon_{size}x{size}@2x.png')
    print(f"✅ Created {size}x{size} and {size*2}x{size*2}")

# Convert iconset to ICNS
subprocess.run(['iconutil', '-c', 'icns', '-o', 
                '/Users/mariammanukyan/Desktop/petsy-app/assets/icon.icns',
                iconset_path], check=True)
print("✅ Created icon.icns (macOS)")

# Cleanup iconset folder
subprocess.run(['rm', '-rf', iconset_path])
print("✅ Cleaned up iconset folder")
