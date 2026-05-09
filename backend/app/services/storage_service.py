import os
import shutil
from fastapi import UploadFile
from pathlib import Path

# This service mocks Cloudinary/Supabase Storage for the MVP.
# In a production environment, this would use the respective Python SDKs.

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class StorageService:
    @staticmethod
    async def upload_image(file: UploadFile) -> str:
        # Generate a unique filename
        filename = f"{os.urandom(8).hex()}_{file.filename}"
        file_path = UPLOAD_DIR / filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return the public URL. In production, this would be a Cloudinary URL.
        # For local dev, we'll serve the uploads directory statically.
        return f"http://localhost:8000/uploads/{filename}"
