from pydantic import BaseModel

# Book Lists for Book Management Page Table
class BookListItem(BaseModel):
    barcode: str
    book_title: str
    author: str
    status: str


# Book Info Modal
class BookCopyItem(BaseModel):
    barcode: str
    shelf_code: str | None
    status: str

class BookInfo(BaseModel):
    book_title: str
    author: str
    category: str
    publisher: str
    publication_year: int
    pages: int | None
    ddc_number: str | None
    author_number: str | None
    subject_heading: str | None
    description: str | None
    book_cover_image: str | None
    total_copies: int
    available: int
    borrowed: int
    barcode: str
    shelf_code: str | None
    status: str
    isbn_10: str | None
    isbn_13: str | None
    copies: list[BookCopyItem]

