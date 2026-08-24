import argparse
import os
import sys
from ultralytics import YOLO

def main() -> None:
    parser = argparse.ArgumentParser(description="NAGAR-X: Validate trained YOLO model performance.")
    parser.add_argument("--weights", type=str, default="runs/train/nagarx_yolo/weights/best.pt", help="Path to best.pt weights file")
    parser.add_argument("--data", type=str, default="datasets/nagarx/data.yaml", help="Path to dataset config yaml")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.weights):
        # Fallback to local pretrained if trained model does not exist
        print(f"Warning: Trained weights not found at '{args.weights}'. Checking local checkpoint...")
        if os.path.exists("yolo26n.pt"):
            args.weights = "yolo26n.pt"
            print("Using 'yolo26n.pt' for verification.")
        else:
            print("Error: No weights found. Run train_yolo.py first or ensure yolo26n.pt is present.")
            sys.exit(1)
            
    if not os.path.exists(args.data):
        print(f"Error: Dataset config file not found at '{args.data}'.")
        sys.exit(1)
        
    print(f"=================================================")
    print(f"🔍 Validating NAGAR-X Model")
    print(f"📦 Weights Path:   {args.weights}")
    print(f"📂 Dataset Config:  {args.data}")
    print(f"=================================================")
    
    try:
        model = YOLO(args.weights)
        metrics = model.val(
            data=args.data,
            imgsz=args.imgsz,
            device="cpu"
        )
        
        # Access evaluation metrics
        print("\n=================================================")
        print("📊 Validation Performance Metrics Summary:")
        print(f"  - mAP50:      {metrics.box.map50:.4f}")
        print(f"  - mAP50-95:   {metrics.box.map:.4f}")
        print(f"  - Precision:  {metrics.box.mp:.4f}")
        print(f"  - Recall:     {metrics.box.mr:.4f}")
        print("=================================================")
        
    except Exception as e:
        print(f"✘ Error during model validation: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
