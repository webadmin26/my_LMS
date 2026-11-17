from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.book_management import router as book_router
from app.routers.book_shelves import router as shelves_router
from app.routers.open_library_search import router as open_library_search_router

app = FastAPI()

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


