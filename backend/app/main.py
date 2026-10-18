from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.book_management import router as book_router

app = FastAPI()

# router import para sa buong BookManagement page
app.include_router(book_router)

# frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


