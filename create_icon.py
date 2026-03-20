#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

# Create a simple parrot icon (512x512)
size = 512
img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# Colors
green = (34, 177, 76)  # Body green
red = (255, 0, 0)      # Cheek red
yellow = (255, 255, 0) # Wing yellow
black = (0, 0, 0)      # Eye/beak
orange = (255, 165, 0) # Feet

# Draw parrot body (ellipse)
body_bbox = [100, 150, 400, 450]
draw.ellipse(body_bbox, fill=green, outline=black, width=3)

# Draw head (circle)
head_radius = 80
head_center_x = 250
head_center_y = 150
draw.ellipse([head_center_x - head_radius, head_center_y - head_radius,
              head_center_x + head_radius, head_center_y + head_radius],
             fill=green, outline=black, width=3)

# Draw wing (arc-like shape)
draw.ellipse([150, 200, 280, 360], fill=yellow, outline=black, width=2)

# Draw red cheek patch
cheek_radius = 30
draw.ellipse([head_center_x + 50 - cheek_radius, head_center_y - cheek_radius + 10,
              head_center_x + 50 + cheek_radius, head_center_y + cheek_radius + 10],
             fill=red, outline=red)

# Draw eye
eye_radius = 12
draw.ellipse([head_center_x + 20 - eye_radius, head_center_y - 15 - eye_radius,
              head_center_x + 20 + eye_radius, head_center_y - 15 + eye_radius],
             fill=black)

# Draw beak (triangle-like)
beak_points = [(head_center_x + 60, head_center_y), 
               (head_center_x + 100, head_center_y - 10),
               (head_center_x + 100, head_center_y + 10)]
draw.polygon(beak_points, fill=orange, outline=black)

# Draw tail feathers
tail_points = [(280, 450), (320, 480), (240, 480)]
draw.polygon(tail_points, fill=red, outline=black)

# Save as PNG
os.makedirs('/Users/mariammanukyan/Desktop/petsy-app/assets', exist_ok=True)
img.save('/Users/mariammanukyan/Desktop/petsy-app/assets/icon.png')
print("✅ Created icon.png (512x512)")

# Convert to ICO (Windows)
icon_size = (256, 256)
img_ico = img.resize(icon_size, Image.Resampling.LANCZOS)
img_ico.save('/Users/mariammanukyan/Desktop/petsy-app/assets/icon.ico')
print("✅ Created icon.ico (Windows)")

# For macOS ICNS - create a PNG that will be converted
img_mac = img.resize((512, 512), Image.Resampling.LANCZOS)
img_mac.save('/Users/mariammanukyan/Desktop/petsy-app/assets/icon-mac.png')
print("✅ Created icon-mac.png")

print("\n📁 Icon files created in assets/")
