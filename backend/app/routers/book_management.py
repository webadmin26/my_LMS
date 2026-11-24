from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select, func, cast, Integer
from sqlalchemy.orm import Session
from datetime import date, datetime, timezone
from sqlalchemy.exc import IntegrityError # an error Postgresql use to raise error
from pathlib import Path
import uuid

from app.database import get_db
from app.models.book_management import books_table, book_copies_table, categories_table, isbn_table
from app.models.book_shelves import book_shelves_table
from app.schemas.book_management import BookListItem, BookInfo, CategoryItem, BookCreate, BookCreated

router = APIRouter(prefix="/books", tags=["Books"])

COVER_FOLDER = Path(__file__).resolve().parents[2] / "uploads" / "covers"
COVER_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_COVER_SIZE = 10 * 1024 * 1024

# Endpoint para sa Book Management table
@router.get("", response_model=list[BookListItem])
def book_lists(db: Session = Depends(get_db)):

    query = (
        select(
               book_copies_table.barcode,
               books_table.book_title,
               books_table.author,
               book_copies_table.status,
        )

    # Itong code na ito ay para pagsamahin ang books at book_copies na table gamit ang foreign key
    .join(books_table, book_copies_table.book_id == books_table.id)

    )

    return db.execute(query).mappings().all()

#Endpoint para sa Category dropdown ng Add Book form
@router.get("/categories", response_model=list[CategoryItem])
def category_list(db: Session = Depends(get_db)):
    
    query = (
        select (
            categories_table.id,
            categories_table.category,
        )
        .order_by(categories_table.id)
    )
    return db.execute(query).mappings().all()

# Endpoint para sa Add Book form (save a new book + its copies)
# FLOW: React form = POST > /books > check input > stage book + ISBN + copies > commit once > reply
# Before this function runs, Pydantic (BookCreate) already checked the JSON. Bad input > 422 automatically
@router.post("", status_code=201, response_model=BookCreated)
def add_book(new_book: BookCreate, db: Session = Depends(get_db)):
    
    # STEP 1: Split and clean the inputs from the ISBN box
    # The form sends ONE box, e.g. "1234567890, 1234567890123" > sort it to isbn_10, and isbn_13
    isbn_10 = None
    isbn_13 = None
    
    if new_book.isbn:
        for part in new_book.isbn.split(","): # split every isbn/text with "," int to two seperate pieces (e.g. 0345356432, 04553345655 becomes "0345356432" and "04553345655")
            clean = "".join(char for char in part if char.isdigit() or char in "Xx").upper() # use to clean the seperated text into a clean format (e.g. 904-34054-4044 becomes 904340544044)
            
            if not clean:
                continue # skip an empty string and proceed to the next operation
            if len(clean) == 10: # counts the cleaned text/string and save as isbn_10 if count is 10
                isbn_10 = clean 
            elif len(clean) == 13: # counts the cleaned text/string and save as isbn_13 if count is 13
                isbn_13 = clean
            else:
                raise HTTPException(status_code=400, detail=f"Invalid ISBN: {part.strip()}")
      
    # STEP 2: Check that the category exists    
    if db.get(categories_table, new_book.category_id) is None: # check if the category input is the same as on the categories_table
        raise HTTPException(status_code=400, detail="Category not found, Please select category from the dropdown menu.") # if not valid it will raise an error code 400
    
    # STEP 3: Check and stop the process if the ISBN is already exists in the catalog
    if isbn_10 and db.execute(select(isbn_table.id).where(isbn_table.isbn_10 == isbn_10)).first(): # check if the isbn_10 being inserted already exists from db or not
        raise HTTPException(status_code=409, detail=f"ISBN {isbn_10} is already in the catalog. Add copies to the existing book instead.") # if already exist an error code 409 will raised
    if isbn_13 and db.execute(select(isbn_table.id).where(isbn_table.isbn_13 == isbn_13)).first(): # check if the isbn_13 being inserted already exists from db or not
        raise HTTPException(status_code=409, detail=f"ISBN {isbn_13} is already in the catalog. Add copies to the existing book instead.") # if already exist an error code 409 will raised
   
   # STEP 4: Stage the book
   # prepare the user inputs before saving to db 
    book = books_table(
        book_title=new_book.book_title,
        author=new_book.author,
        category_id=new_book.category_id,
        publisher=new_book.publisher,
        publication_year=new_book.publication_year,
        pages=new_book.pages,
        ddc_number=new_book.ddc_number or None,
        author_number=new_book.author_number or None,
        subject_heading=new_book.subject_heading or None,
        description=new_book.description or None,
        book_cover_image=new_book.book_cover_image or None,
    )
    
    db.add(book) # staging the inputs on saving
    db.flush() # sent to postgreSQL but not commit saving
    
    # STEP 5: Stage the ISBN row
    # Save the two different isbn formats on its designated location
    if isbn_10 or isbn_13:
        db.add(isbn_table(book_id=book.id, isbn_10=isbn_10, isbn_13=isbn_13))
    
    # STEP 6: Find the biggest accession number so counting will continue where it ends
    highest = db.execute(select(func.max(cast(book_copies_table.accession_number, Integer)))).scalar() or 0
    
    # STEP 7: Prepare the pieces for the copies
    prefix = date.today().strftime("BK%y-%d%m-") # Builds the front part of the QR Number from todays date
    now = datetime.now(timezone.utc) # use to get the exact date & time when saving using UTC
    barcodes = [] # empty barcodes list for the loop
    
    # STEP 8: Create one copy per number typed in NO. OF COPIES
    for n in range(1, new_book.copies +1):
        accession = f"{highest + n:05d}"
        barcode = prefix + accession
        db.add(book_copies_table(
            book_id=book.id,
            barcode=barcode,
            accession_number=accession,
            status="available",
            acquired_at=date.today(),
            created_at=now,
            updated_at=now,
        ))
        barcodes.append(barcode)
     
    # STEP 9: Save Everything at once (all or nothing)    
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A barcode already exists. Please try saving again.")
    
    return {"id": book.id, "book_title": book.book_title, "barcodes": barcodes}

# Endpoint para sa Pag Upload ng Book Cover
@router.post("/cover", status_code=201)
async def book_cover(image: UploadFile = File(...)):
    extension = COVER_TYPES.get(image.content_type)
    if extension is None:
        raise HTTPException(status_code=400, detail="Failed to upload cover picture")
    
    data = await image.read()
    if len(data) > MAX_COVER_SIZE:
        raise HTTPException(status_code=400, detail="Maximum file size of 10MB only")
    
    file_name = f"{uuid.uuid4().hex}{extension}" #Universally unique identifier
    (COVER_FOLDER / file_name).write_bytes(data)
    
    return {"cover_url": f"/uploads/covers/{file_name}"}
                    
# Endpoint para sa book_info modal
@router.get("/{barcode}", response_model=BookInfo)
def book_info(barcode: str, db: Session = Depends(get_db)):
    query = (
        select(
            books_table.id,
            books_table.book_title,
            books_table.author,
            isbn_table.isbn_10,
            isbn_table.isbn_13,
            categories_table.category,
            books_table.publisher,
            books_table.publication_year,
            books_table.pages,
            books_table.ddc_number,
            books_table.author_number,
            books_table.subject_heading,
            books_table.book_cover_image,
            books_table.description,

            book_copies_table.barcode,
            book_shelves_table.shelf_code,
            book_copies_table.status,
        )

        .join(book_copies_table, book_copies_table.book_id == books_table.id)
        .outerjoin(isbn_table, isbn_table.book_id == books_table.id)
        .join(categories_table, books_table.category_id == categories_table.id)
        # outerjoin: a copy with no shelf yet still shows (shelf_code = None)
        .outerjoin(book_shelves_table, book_copies_table.shelf_id == book_shelves_table.id)
        .where(book_copies_table.barcode == barcode)

    )

    book_row = db.execute(query).mappings().first()

    # If no copy has this barcode, answer 404 instead of crashing
    if book_row is None:
        raise HTTPException(status_code=404, detail="Book copy not found")

    book_id = book_row["id"]


    # Query 2: Count the total available and borrowed status
    count_status = (
        select(
            func.count().label("total_copies"),
            func.count().filter(book_copies_table.status == "available").label("available"),
            func.count().filter(book_copies_table.status == "borrowed").label("borrowed"),
        )

        .select_from(book_copies_table)
        .where(book_copies_table.book_id == book_id)
    )
    counts = db.execute(count_status).mappings().one()

    # Query 3: Selected book status and location info
    status = (
        select(book_copies_table.barcode, book_shelves_table.shelf_code, book_copies_table.status)
        .select_from(book_copies_table)
        .outerjoin(book_shelves_table, book_copies_table.shelf_id == book_shelves_table.id)
        .where(book_copies_table.book_id == book_id)
        .order_by(book_copies_table.barcode)
    )
    result = db.execute(status).mappings().all()

    return {**book_row, **counts, "copies":result}


