from pydantic import BaseModel

# Books information from Open Library Search
class OpenLibraryBooks(BaseModel):
    book_title: str
    sub_title: str | None
    author: str | None
    publisher: str | None
    isbn_10: str | None
    isbn_13: str | None
    publication_year: int | None
    pages: int | None
    cover_url: str | None
    work_key: str # Book Description
    category: str | None

# Book Description from Open Library
class OpenLibraryBookDescription(BaseModel):
    description: str | None