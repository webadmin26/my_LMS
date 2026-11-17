from pydantic import BaseModel

# For Book Shelves Table
class BookShelvesTable(BaseModel):
    shelf_code: str
    location: str | None
    section_name: str
    ddc_start: int | None
    ddc_end: int | None
    used: int
    max_capacity: int | None

# Book Selection for Shelf Assign
class BookShelfAssign(BaseModel):
    barcode: str
    book_title: str
    author: str
    category: str
    isbn_10: str | None
    isbn_13: str | None
    publication_year: int
    pages: int | None

# Selected Books Shelf Assign
class AssignBookShelf(BaseModel):
    selected_books: list[str]