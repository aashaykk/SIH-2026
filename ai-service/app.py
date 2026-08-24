"""NAGAR-X local vision service.

Uses zero-shot CLIP so no hand-labelled civic dataset is required to get a
working baseline. Set MODEL_ID to a fine-tuned checkpoint when one is ready.
"""
from io import BytesIO
from typing import Annotated

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from PIL import Image, ImageChops, ImageStat
from transformers import CLIPModel, CLIPProcessor, pipeline

app = FastAPI(title="NAGAR-X AI service", version="1.0.0")

LABELS = {
    "POTHOLE": "a pothole or damaged road",
    "GARBAGE": "garbage, litter, or uncollected waste",
    "WATER_LEAKAGE": "a leaking or burst water pipe",
    "DRAINAGE": "a blocked storm drain or drainage issue",
    "SEWAGE": "sewage overflow or an open sewer",
    "STREETLIGHT": "a broken street light",
    "ILLEGAL_DUMPING": "illegal dumping of construction or household waste",
    "OTHER": "another civic issue",
}
DEPARTMENTS = {
    "POTHOLE": "ROADS", "GARBAGE": "SANITATION", "ILLEGAL_DUMPING": "SANITATION",
    "WATER_LEAKAGE": "WATER", "DRAINAGE": "SEWAGE_AND_DRAINAGE",
    "SEWAGE": "SEWAGE_AND_DRAINAGE", "STREETLIGHT": "ELECTRICAL", "OTHER": "GENERAL",
}
classifier = None
embedding_model = None
embedding_processor = None

def get_classifier():
    global classifier
    if classifier is None:
        classifier = pipeline("zero-shot-image-classification", model="openai/clip-vit-base-patch32")
    return classifier

def image_embedding(image: Image.Image) -> np.ndarray:
    global embedding_model, embedding_processor
    if embedding_model is None:
        embedding_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        embedding_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    values = embedding_processor(images=image, return_tensors="pt")
    vector = embedding_model.get_image_features(**values).detach().numpy()[0]
    return vector / np.linalg.norm(vector)

async def image_from_upload(upload: UploadFile) -> Image.Image:
    if not upload.content_type or not upload.content_type.startswith("image/"):
        raise HTTPException(400, "Only image uploads are accepted")
    try:
        return Image.open(BytesIO(await upload.read())).convert("RGB")
    except Exception as exc:
        raise HTTPException(400, "Invalid image") from exc

def severity(category: str, confidence: float, description: str) -> tuple[str, int, list[str]]:
    text = description.lower()
    critical_words = ("burst", "flood", "fire", "accident", "danger", "hospital", "school", "injury")
    high_categories = {"SEWAGE", "WATER_LEAKAGE", "POTHOLE", "DRAINAGE"}
    if any(word in text for word in critical_words):
        return "CRITICAL", 90, ["Description contains a public-safety or flood-risk signal."]
    if category in high_categories:
        return "HIGH", 72, [f"{category.replace('_', ' ').title()} can create a health or road-safety risk."]
    if category in {"GARBAGE", "ILLEGAL_DUMPING"}:
        return "MEDIUM", 48, ["Waste needs timely sanitation action but has no immediate hazard signal."]
    return "LOW", 25, ["No immediate safety or health-risk signal was detected."]

@app.get("/health")
def health():
    return {"success": True, "model": "CLIP zero-shot (loaded on first request)"}

@app.post("/ai/analyze-image")
async def analyze_image(image: Annotated[UploadFile, File()], description: Annotated[str, Form()] = ""):
    photo = await image_from_upload(image)
    predictions = get_classifier()(photo, candidate_labels=list(LABELS.values()))
    best = predictions[0]
    category = next(key for key, label in LABELS.items() if label == best["label"])
    confidence = round(float(best["score"]), 4)
    level, score, reasons = severity(category, confidence, description)
    return {"success": True, "data": {
        "category": category, "confidence": confidence, "severity": level,
        "severity_score": score, "department": DEPARTMENTS[category], "reasons": reasons,
        "detected_features": {"model": "openai/clip-vit-base-patch32", "top_predictions": predictions[:3]},
    }}

@app.post("/ai/verify-resolution")
async def verify_resolution(before_image: Annotated[UploadFile, File()], after_image: Annotated[UploadFile, File()]):
    before, after = await image_from_upload(before_image), await image_from_upload(after_image)
    after = after.resize(before.size)
    # A meaningful before/after change is evidence, not a resolution by itself.
    diff = ImageChops.difference(before, after)
    change = min(float(np.mean(np.asarray(ImageStat.Stat(diff).mean))) / 85.0, 1.0)
    resolved = change >= 0.12
    return {"success": True, "data": {
        "resolved": resolved, "confidence": round(0.5 + change / 2, 3),
        "evidence_valid": change >= 0.04, "location_match": None,
        "reasons": ["Before/after visual-change score computed; citizen confirmation and worker GPS are required for final verification."],
        "metrics": {"visual_change": round(change, 3), "hist_similarity": round(1 - change, 3)},
    }}

@app.post("/ai/image-similarity")
async def image_similarity(reference_image: Annotated[UploadFile, File()], candidate_image: Annotated[UploadFile, File()]):
    reference, candidate = await image_from_upload(reference_image), await image_from_upload(candidate_image)
    similarity = float(np.dot(image_embedding(reference), image_embedding(candidate)))
    return {"success": True, "data": {"similarity": round(max(0.0, min(1.0, similarity)), 4), "model": "CLIP image embeddings"}}
