import argparse
import os
import sys
from ultralytics import YOLO

def main() -> None:
    parser = argparse.ArgumentParser(description="NAGAR-X: Run YOLO predictions on local test images.")
    parser.add_argument("--image", type=str, required=True, help="Path to input image file")
    parser.add_argument("--weights", type=str, default="yolo26n.pt", help="Path to model weights (.pt)")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.image):
        print(f"Error: Input image not found at '{args.image}'.")
        sys.exit(1)
        
    if not os.path.exists(args.weights):
        print(f"Warning: Weights file not found at '{args.weights}'. Checking fallback 'yolo26n.pt'...")
        if os.path.exists("yolo26n.pt"):
            args.weights = "yolo26n.pt"
        else:
            print("Error: Could not locate weights file.")
            sys.exit(1)
            
    print(f"Loading model: {args.weights}")
    try:
        model = YOLO(args.weights)
        print(f"Running inference on: {args.image} (threshold: {args.conf})")
        
        results = model(args.image, conf=args.conf)
        
        for result in results:
            boxes = result.boxes
            print(f"\n✔ Found {len(boxes)} detection(s):")
            for box in boxes:
                cls_id = int(box.cls[0])
                label = model.names[cls_id]
                conf = float(box.conf[0])
                bbox = box.xyxy[0].tolist() # [xmin, ymin, xmax, ymax]
                bbox = [int(val) for val in bbox]
                
                print(f"  - Class: {label} (ID: {cls_id})")
                print(f"    Confidence: {conf:.2%}")
                print(f"    BBox xyxy:  {bbox}")
                print("-" * 30)
                
    except Exception as e:
        print(f"✘ Inference failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
