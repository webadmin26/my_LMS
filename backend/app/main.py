from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.book_management import router as book_router
from app.routers.book_shelves import router as shelves_router
from app.routers.open_library_search import router as open_library_search_router
from pathlib import Path
from fastapi.staticfiles import StaticFiles

# Uploaded files (book covers) are served at /uploads/...
UPLOAD_FOLDERS = Path(__file__).resolve().parents[1] / "uploads"
(UPLOAD_FOLDERS / "covers").mkdir(parents=True, exist_ok=True)

app = FastAPI()

# folder location for uploaded file
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDERS), name="uploads")

# router import para sa buong BookManagement page
app.include_router(book_router)
app.include_router(shelves_router)
app.include_router(open_library_search_router)

# frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://10.254.159.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


