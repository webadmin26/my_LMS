from fastapi import FastAPI

app = FastAPI(title="My LMS API")

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "FASTAPI is READY!",
    }