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
    async def upload_image(file: UploadFile) -> tuple[str, str]:
        filename = f"{os.urandom(8).hex()}_{file.filename}"
        file_path = UPLOAD_DIR / filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return f"http://localhost:8000/uploads/{filename}", str(file_path)
