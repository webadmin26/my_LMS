from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.book_management import books_table, book_copies_table, categories_table
from app.schemas.book_management import BookListItem, BookInfo

router = APIRouter(prefix="/books", tags=["Books"])


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



# Endpoint para sa book_info modal
@router.get("/{barcode}", response_model=BookInfo)
def book_info(barcode: str, db: Session = Depends(get_db)):
    query = (
        select(
            books_table.id,
            books_table.book_title,
            books_table.author,
            books_table.isbn,
            categories_table.category,
            books_table.publisher,
            books_table.publication_year,
            books_table.ddc_number,
            books_table.author_number,
            books_table.subject_heading,
            books_table.book_cover_image,
            books_table.description,

            book_copies_table.barcode,
            book_copies_table.shelf_location,
            book_copies_table.status,
        )

        .join(books_table, book_copies_table.book_id == books_table.id)
        .join(categories_table, books_table.category_id == categories_table.id)
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
        select(book_copies_table.barcode, book_copies_table.shelf_location, book_copies_table.status)
        .where(book_copies_table.book_id == book_id)
        .order_by(book_copies_table.barcode)
    )
    result = db.execute(status).mappings().all()

    return {**book_row, **counts, "copies":result}


