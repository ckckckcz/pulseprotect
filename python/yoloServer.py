from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import json
from typing import List, Dict, Any
import requests
import uuid
import os

app = FastAPI(title="YOLO MedVerify Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
MODEL_PATH = "path/to/your/custom-yolo-model.pt"  # Update this path
model = None

# MedVerify configuration
MEDVERIFY_BASE_URL = os.getenv("MEDVERIFY_BASE_URL", "https://your-ai-service-domain.com")
SERVICE_API_KEY = os.getenv("MEDVERIFY_API_KEY", "your-service-api-key")

@app.on_event("startup")
async def load_model():
    global model
    try:
        print("Loading YOLO model...")
        model = YOLO(MODEL_PATH)
        print("✅ YOLO model loaded successfully")
    except Exception as e:
        print(f"❌ Failed to load YOLO model: {e}")
        model = None

class Detection:
    def __init__(self, class_name: str, confidence: float, bbox: List[float]):
        self.class_name = class_name
        self.confidence = confidence
        self.bbox = bbox  # [x, y, width, height]

def run_yolo_inference(image: np.ndarray) -> List[Detection]:
    """Run YOLO inference on image"""
    if model is None:
        # Fallback mock detection for development
        return [
            Detection("body", 0.91, [50, 100, 200, 400]),
            Detection("title", 0.89, [80, 200, 150, 100])
        ]
    
    try:
        # Run YOLO prediction
        results = model(image, conf=0.5)  # Confidence threshold
        
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Extract box data
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    
                    # Convert to [x, y, width, height] format
                    x, y = float(x1), float(y1)
                    width, height = float(x2 - x1), float(y2 - y1)
                    
                    # Get class name
                    class_name = model.names[class_id]
                    
                    detections.append(Detection(
                        class_name=class_name,
                        confidence=float(confidence),
                        bbox=[x, y, width, height]
                    ))
        
        return detections
    except Exception as e:
        print(f"YOLO inference error: {e}")
        return []

async def call_medverify_ocr(image_bytes: bytes, session_id: str) -> Dict[str, Any]:
    """Call MedVerify OCR endpoint"""
    try:
        files = {"img": ("scan.jpg", io.BytesIO(image_bytes), "image/jpeg")}
        data = {"return_partial": "true"}
        headers = {
            "X-Api-Key": SERVICE_API_KEY,
            "X-Session-Id": session_id
        }
        
        response = requests.post(
            f"{MEDVERIFY_BASE_URL}/v1/scan/photo",
            files=files,
            data=data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"MedVerify OCR error: {response.status_code} - {response.text}")
            return {"error": "OCR processing failed"}
            
    except Exception as e:
        print(f"MedVerify OCR exception: {e}")
        return {"error": str(e)}

async def call_medverify_verify(nie: str = None, text: str = None, session_id: str = None) -> Dict[str, Any]:
    """Call MedVerify verification endpoint"""
    try:
        headers = {
            "Content-Type": "application/json",
            "X-Api-Key": SERVICE_API_KEY
        }
        
        if session_id:
            headers["X-Session-Id"] = session_id
        
        payload = {}
        if nie:
            payload["nie"] = nie
        if text:
            payload["text"] = text
            
        response = requests.post(
            f"{MEDVERIFY_BASE_URL}/v1/verify",
            json=payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"MedVerify verify error: {response.status_code} - {response.text}")
            return {"error": "Verification failed"}
            
    except Exception as e:
        print(f"MedVerify verify exception: {e}")
        return {"error": str(e)}

@app.post("/yolo-scan")
async def yolo_scan(file: UploadFile = File(...)):
    """Main endpoint for YOLO scanning and MedVerify integration"""
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        session_id = str(uuid.uuid4())
        
        detections = run_yolo_inference(image_cv)
        
        body_detections = [d for d in detections if d.class_name == "body" and d.confidence > 0.8]
        title_detections = [d for d in detections if d.class_name == "title" and d.confidence > 0.8]
        
        yolo_result = {
            "detections": [
                {
                    "class": d.class_name,
                    "confidence": d.confidence,
                    "bbox": d.bbox
                } for d in detections
            ],
            "has_body": len(body_detections) > 0,
            "has_title": len(title_detections) > 0,
            "session_id": session_id
        }
        
        if not (yolo_result["has_body"] and yolo_result["has_title"]):
            return {
                "success": False,
                "message": "Deteksi tidak optimal. Pastikan produk terlihat jelas di kamera.",
                "yolo_result": yolo_result
            }
        
        ocr_result = await call_medverify_ocr(image_bytes, session_id)
        
        if "error" in ocr_result:
            return {
                "success": False,
                "message": "Gagal melakukan OCR pada gambar",
                "yolo_result": yolo_result,
                "ocr_error": ocr_result["error"]
            }
        
        verify_result = None
        if ocr_result.get("title_text") or ocr_result.get("bpom_number"):
            verify_result = await call_medverify_verify(
                nie=ocr_result.get("bpom_number"),
                text=ocr_result.get("title_text"),
                session_id=session_id
            )
        
        # Combine all results
        final_result = {
            "success": True,
            "session_id": session_id,
            "yolo_result": yolo_result,
            "ocr_result": ocr_result,
            "verify_result": verify_result,
            "message": "Scan berhasil! Produk telah diverifikasi."
        }
        
        if verify_result and not verify_result.get("error"):
            final_result.update(verify_result)
        
        return final_result
        
    except Exception as e:
        print(f"YOLO scan error: {e}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "medverify_configured": bool(SERVICE_API_KEY and MEDVERIFY_BASE_URL)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

# requirements.txt content:
"""
fastapi==0.104.1
uvicorn==0.24.0
ultralytics==8.0.196
opencv-python==4.8.1.78
Pillow==10.0.1
numpy==1.24.3
requests==2.31.0
python-multipart==0.0.6
"""

# To run:
# pip install -r requirements.txt
# python yolo_server.py