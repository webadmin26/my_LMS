from pydantic import BaseModel, Field, ConfigDict

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
    
# Category Drop down for Add book form
class CategoryItem(BaseModel):
    id: int
    category: str

# Add Book Form
class BookCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True) #Trim space: " Harry Potter " = "Harry Potter"
    
    #Required fields (NOT NULL)
    book_title: str = Field(min_length=1)
    author: str = Field(min_length=1)
    category_id: int
    publisher: str = Field(min_length=1)
    publication_year: int = Field(ge=1000, le=2100)
    
    #Optional fields (Nullable)
    isbn: str | None = None #The ISBN box, will be split in the route
    pages: int | None = Field(default=None, ge=1)
    ddc_number: str | None = None
    author_number: str | None = None
    subject_heading: str | None = None
    description: str | None = None
    book_cover_image: str | None = None #the cover URL from Open Library
    
    #Number of physical copies to create
    copies: int = Field(ge=1, le=500)

# Reply after a book is saved (POST /books)
class BookCreated(BaseModel):
    id: int
    book_title: str
    barcodes: list[str] #The QR code of every new copy
    