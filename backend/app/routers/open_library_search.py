import httpx
from functools import lru_cache
from fastapi import APIRouter, HTTPException

from app.schemas.open_library_search import OpenLibraryBooks, OpenLibraryBookDescription

# OPEN LIBRARY SEARCH FORM ENDPOINT ROUTER
router = APIRouter(prefix="/openlibrarysearch", tags=["Open Library Search"])


OPENLIBRARY_SEARCH_URL = "https://openlibrary.org/search.json" # Open Library URL for Search form
OPENLIBRARY_BASE_URL = "https://openlibrary.org" # Open Library URL for book Descriptions
OPENLIBRARY_HEADERS = {"User-Agent": "LMS Version 1"}
OPENLIBRARY_FIELDS = "key,title,author_name,first_publish_year,number_of_pages_median,cover_i,editions,editions.isbn,editions.subtitle,editions.publisher"

# Endpoint para sa Open Library Search By Option
@router.get("/search_books", response_model=list[OpenLibraryBooks])
@lru_cache(maxsize=50) # maximum cache to remember
def openlibrary(search_by: str, search_text: str, page: int = 1):

    # Search Options for Open Library
    if search_by == "isbn":
        params = {"q": f"isbn:{search_text}"}
    elif search_by == "title":
        params = {"title": search_text}
    elif search_by == "author":
        params = {"author": search_text}
    else:
        raise HTTPException(status_code=400, detail="Search by: must be isbn, title or author")
    
    # params = a python dictionary that acts like a container that stores key and values
    # this params is to collect the setted settings from my searh form and send to open library at once
    params["fields"] = OPENLIBRARY_FIELDS
    params["limit"] = 50
    params["page"] = page
    
    # Search books on Open Library API by params:
    try:
        response = httpx.get(OPENLIBRARY_SEARCH_URL, params=params, headers=OPENLIBRARY_HEADERS, timeout=60)
        response.raise_for_status()
        
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Could not reach Open Library")
    
    # THIS LINE IS TO RESHAPE OPEN LIBRARY JSON RAW INTO A CLEAN ROW BASE USED ON TABLE
    books = []
    for doc in response.json()["docs"]: #a loop to make .json response raw file from open library into a row
        
        isbn_10 = None
        isbn_13 = None
        sub_title = None
        publishers = None
        bookedition = doc.get("editions", {}).get("docs", []) #this line pulls all the list of editions in open library api
        if bookedition:
            sub_title = bookedition[0].get("subtitle") #bookedition[0] = first item in the list
            publishers = bookedition[0].get("publisher")
            for isbn in bookedition[0].get("isbn", []):
                if len(isbn) == 10:
                    isbn_10 = isbn
                elif len(isbn) == 13:
                    isbn_13 = isbn
                    
        authors = doc.get("author_name")
        cover_id = doc.get("cover_i")
        
        books.append(OpenLibraryBooks(
            book_title=doc["title"], #this part in open library api is direct read so doc[]("[]" = use it when the key is always there) is used
            sub_title=sub_title, #this part is already prepared as variable
            author=", ".join(authors) if authors else None, #authors in open libary are in list and my schema is string or text so it needs to join
            publisher=", ".join(publishers) if publishers else None, #publisher in open libary are in list and my schema is string or text so it needs to join
            isbn_10=isbn_10, #this part is already prepared as variable
            isbn_13=isbn_13, #this part is already prepared as variable
            publication_year=doc.get("first_publish_year"), #this part in open library api is direct read so doc.get is used
            pages=doc.get("number_of_pages_median"),
            cover_url=f"https://covers.openlibrary.org/b/id/{cover_id}-M.jpg" if cover_id else None,
        ))
        
    return books

#Endpoint para sa book description ng Add Book form
@router.get("/description", response_model=OpenLibraryBookDescription)
def book_description(work_key: str):
    
    # Only accept a work key, e.g. "/works/OL45345llf"
    if not work_key.startswith("/works/"):
        raise HTTPException(status_code=400, detail="work_key must start with /works/")
    
    try:
        response = httpx.get(f"{OPENLIBRARY_BASE_URL}{work_key}.json",headers=OPENLIBRARY_HEADERS, timeout=20)
        response.raise_for_status()
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Could not reach Open Library")
    
    description = response.json().get("description")
    
    # Open Library sometimes sends {"type": ..., "value": "text"} instead of plain text
    if isinstance(description, dict):
        description = description.get("value")
        
    return {"description": description }