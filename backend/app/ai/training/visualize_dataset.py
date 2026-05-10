import os
import random
import cv2
from pathlib import Path
import matplotlib.pyplot as plt

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "datasets" / "processed"

TARGET_CLASSES = {
    0: "plastic_bottle",
    1: "plastic",
    2: "metal",
    3: "paper_cardboard",
    4: "glass",
    5: "garbage_bag",
    6: "cigarette",
    7: "mixed_trash"
}

# Define distinct colors for each class (B, G, R)
COLORS = [
    (255, 0, 0),     # Blue
    (0, 255, 0),     # Green
    (0, 0, 255),     # Red
    (255, 255, 0),   # Cyan
    (255, 0, 255),   # Magenta
    (0, 255, 255),   # Yellow
    (128, 0, 128),   # Purple
    (255, 165, 0)    # Orange
]

def visualize_random_image(split="train"):
    img_dir = PROCESSED_DIR / "images" / split
    lbl_dir = PROCESSED_DIR / "labels" / split
    
    if not img_dir.exists() or not any(img_dir.iterdir()):
        print(f"Error: No images found in {img_dir}")
        return

    images = list(img_dir.glob("*.jpg"))
    if not images:
        print(f"No JPG images found in {img_dir}")
        return

    img_path = random.choice(images)
    lbl_path = lbl_dir / f"{img_path.stem}.txt"

    print(f"Visualizing: {img_path.name}")
    
    img = cv2.imread(str(img_path))
    if img is None:
        print("Failed to load image.")
        return
        
    h, w, _ = img.shape

    if lbl_path.exists():
        with open(lbl_path, "r") as f:
            lines = f.readlines()
            
        for line in lines:
            parts = line.strip().split()
            if len(parts) == 5:
                class_id = int(parts[0])
                x_center, y_center, bw, bh = map(float, parts[1:])
                
                # Convert back to pixel coordinates
                x1 = int((x_center - bw / 2) * w)
                y1 = int((y_center - bh / 2) * h)
                x2 = int((x_center + bw / 2) * w)
                y2 = int((y_center + bh / 2) * h)
                
                color = COLORS[class_id % len(COLORS)]
                label = TARGET_CLASSES.get(class_id, "Unknown")
                
                cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                
                # Add label text
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.6
                thickness = 2
                (text_width, text_height), _ = cv2.getTextSize(label, font, font_scale, thickness)
                
                cv2.rectangle(img, (x1, y1 - text_height - 5), (x1 + text_width, y1), color, -1)
                cv2.putText(img, label, (x1, y1 - 5), font, font_scale, (255, 255, 255), thickness)

    # Convert BGR to RGB for matplotlib
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    plt.figure(figsize=(10, 8))
    plt.imshow(img_rgb)
    plt.title(f"Split: {split} | Image: {img_path.name}")
    plt.axis("off")
    plt.savefig(PROCESSED_DIR / f"{split}_visualized.jpg")

def main():
    print("CleanSight AI Dataset Visualization Tool")
    print("========================================")
    
    # Try to visualize a training image
    print("Visualizing random Training image...")
    visualize_random_image("train")
    
    # Try to visualize a validation image
    print("Visualizing random Validation image...")
    visualize_random_image("val")

if __name__ == "__main__":
    main()
