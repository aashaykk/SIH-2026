import argparse
import os
import sys
# pyrefly: ignore [missing-import]
from ultralytics import YOLO

def main() -> None:
    parser = argparse.ArgumentParser(description="NAGAR-X: Fine-tune YOLO model for civic issues detection.")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Input image size")
    parser.add_argument("--batch", type=int, default=8, help="Batch size for training")
    parser.add_argument("--weights", type=str, default="yolo26n.pt", help="Path to initial weights / pretrained model")
    parser.add_argument("--data", type=str, default="datasets/nagarx/data.yaml", help="Path to dataset config yaml")
    parser.add_argument("--project", type=str, default="runs/train", help="Project name to save training runs")
    parser.add_argument("--name", type=str, default="nagarx_yolo", help="Run name inside project folder")
    
    args = parser.parse_args()
    
    # 1. Validate dataset configuration path
    if not os.path.exists(args.data):
        print(f"Error: Dataset config file not found at '{args.data}'.")
        sys.exit(1)
        
    print(f"=================================================")
    print(f"🚀 NAGAR-X Model Fine-Tuning Started")
    print(f"📦 Initial Model:     {args.weights}")
    print(f"📂 Dataset Config:    {args.data}")
    print(f"🔄 Epochs:            {args.epochs}")
    print(f"🖼️ Image Size:        {args.imgsz}")
    print(f"📊 Batch Size:        {args.batch}")
    print(f"=================================================")
    
    try:
        # 2. Load model
        # Pretrained YOLO26n or custom checkpoint
        model = YOLO(args.weights)
        
        # 3. Train
        results = model.train(
            data=args.data,
            epochs=args.epochs,
            imgsz=args.imgsz,
            batch=args.batch,
            project=args.project,
            name=args.name,
            device="cpu", # Force CPU for predictable dev environment running
            workers=2
        )
        
        print("\n✔ Training completed successfully!")
        print(f"💾 Best weights saved to: {results.save_dir}/weights/best.pt")
        
    except Exception as e:
        print(f"\n✘ Error during model training: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
