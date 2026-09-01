import subprocess
import sys
import os
import time

def start_backend():
    print("Starting FinPilot AI FastAPI Backend on http://localhost:8000...")
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    return subprocess.Popen([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"], cwd=backend_dir)

def start_frontend():
    print("Starting FinPilot AI Vite Frontend on http://localhost:3000...")
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    return subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir, shell=True)

if __name__ == "__main__":
    print("=" * 60)
    print("FINPILOT AI — AUTONOMOUS FINANCE CONTROLLER")
    print("=" * 60)
    
    p_backend = start_backend()
    time.sleep(2)
    p_frontend = start_frontend()
    
    try:
        p_backend.wait()
        p_frontend.wait()
    except KeyboardInterrupt:
        print("\nShutting down FinPilot AI...")
        p_backend.terminate()
        p_frontend.terminate()
