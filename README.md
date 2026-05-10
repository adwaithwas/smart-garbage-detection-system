# 🌍 CleanSight AI: Smart Garbage Detection System

CleanSight AI is a production-grade smart-city prototype designed to monitor and manage urban waste. Using a custom-trained **YOLOv8** model, **FastAPI**, and **React**, it provides real-time detection, severity analysis, and municipal reporting for city waste management.

---

## 🚀 Quick Start Guide

Follow these steps to get the system running on your local machine.

### 📋 Prerequisites
Before you begin, ensure you have the following installed:
- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/adwaithwas/smart-garbage-detection-system.git
cd smart-garbage-detection-system
```

### 2. Setup the AI Model (Critical)
The AI weights are hosted on Hugging Face to keep the repository lightweight.
1. Visit the [CleanSight Model Registry](https://huggingface.co/adwaithwas/garbage_best_v4/tree/main).
2. Download **`garbage_best_v4.pt`**.
3. Create the following folder structure in your project: `backend/app/ai/weights/`
4. Place the downloaded `.pt` file inside that folder.

> **Path:** `backend/app/ai/weights/garbage_best_v4.pt`

---

### 3. Setup the Backend (FastAPI)
```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```
*The backend will be live at `http://localhost:8000`.*

---

### 4. Setup the Frontend (React + Vite)
Open a **new terminal window** and run:
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
*The dashboard will be live at `http://localhost:5173`.*

---

## 🛠 Features
- **AI-Powered Detection**: Identifies 8 classes of waste (bottles, metal, glass, etc.).
- **Severity Scoring**: Calculates waste coverage percentage and prioritizes high-risk areas.
- **Smart Routing**: Recommends the specific vehicle type (Truck, Van, etc.) needed for cleanup.
- **GPS Integration**: Automatically tags the location of the detected waste.
- **Live Dashboard**: Interactive map and statistical charts for municipal overview.

## 📂 Project Structure
- `/backend`: FastAPI application and YOLOv8 inference logic.
- `/frontend`: React dashboard with Framer Motion animations and Lucide icons.
- `/backend/app/ai/weights`: Where your `.pt` model files live.

---

## 📝 License
This project is for educational and smart-city prototype purposes.
