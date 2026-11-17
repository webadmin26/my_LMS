from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, literal, update
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.book_shelves import sections_table, book_shelves_table
from app.models.book_management import books_table, book_copies_table, categories_table, isbn_table
from app.schemas.book_shelves import BookShelvesTable, BookShelfAssign, AssignBookShelf

router = APIRouter(prefix="/shelves", tags=["Book shelves"])


# Endpoint para sa Book Shelves Table
@router.get("", response_model=list[BookShelvesTable])
def shelf_list(db: Session = Depends(get_db)):

    query = (
        select(
            book_shelves_table.shelf_code,
            book_shelves_table.location,
            sections_table.section_name,
            book_shelves_table.ddc_start,
            book_shelves_table.ddc_end,
            func.count(book_copies_table.id).label("used"),
            book_shelves_table.max_capacity,
        )

        .join(book_shelves_table, book_shelves_table.section_id == sections_table.id)
        .outerjoin(book_copies_table, book_copies_table.shelf_id == book_shelves_table.id)
        .group_by(book_shelves_table.id, sections_table.section_name)
        .order_by(book_shelves_table.shelf_code)
    )

    return db.execute(query).mappings().all()


#Endpoint para sa pag select ng libro sa shelf assign
@router.get("/unassigned", response_model=list[BookShelfAssign])
def select_book(db: Session = Depends(get_db)):

    query = (
        select(
            book_copies_table.barcode,
            books_table.book_title,
            books_table.author,
            categories_table.category,
            isbn_table.isbn_10,
            isbn_table.isbn_13,
            books_table.publication_year,
            books_table.pages
        )

        .join(book_copies_table, book_copies_table.book_id == books_table.id)
        .outerjoin(isbn_table, isbn_table.book_id == books_table.id)
        .join(categories_table, books_table.category_id == categories_table.id)
        .where(book_copies_table.shelf_id.is_(None))
        .order_by(books_table.book_title)
    )

    return db.execute(query).mappings().all()

# Endpoint para sa pag view ng mga libro na nasa isang shelf
@router.get("/{shelf_view}/books", response_model=list[BookShelfAssign])
def shelf_books(shelf_view: str, db: Session = Depends(get_db)):

    # Find the selected shelf
    selected_shelf = db.execute(
        select(book_shelves_table).where(book_shelves_table.shelf_code == shelf_view)
    ).scalar_one_or_none()

    # Stop if the shelf doesn't exist
    if selected_shelf is None:
        raise HTTPException(status_code=404, detail="No shelf found!")

    # Get the copies that are on this shelf
    query = (
        select(
            book_copies_table.barcode,
            books_table.book_title,
            books_table.author,
            categories_table.category,
            isbn_table.isbn_10,
            isbn_table.isbn_13,
            books_table.publication_year,
            books_table.pages
        )

        .join(book_copies_table, book_copies_table.book_id == books_table.id)
        .outerjoin(isbn_table, isbn_table.book_id == books_table.id)
        .join(categories_table, books_table.category_id == categories_table.id)
        .where(book_copies_table.shelf_id == selected_shelf.id)
        .order_by(books_table.book_title)
    )

    return db.execute(query).mappings().all()

# Endpoint para sa pag assign ng book shelf sa bawat kopya ng mga libro
@router.patch("/{shelf_assign}/assign")
def shelf(shelf_assign: str, data: AssignBookShelf, db: Session = Depends(get_db)):

    # Find the selected shelf
    selected_shelf = db.execute(
        select(book_shelves_table).where(book_shelves_table.shelf_code == shelf_assign)
    ).scalar_one_or_none()

    # Stop if the shelf doesn't exist
    if selected_shelf is None:
        raise HTTPException(status_code=404, detail="No shelf found!")

    # Update the shelf if shelf found
    result = db.execute(
        update(book_copies_table)
        .where(book_copies_table.barcode.in_(data.selected_books))
        .where(book_copies_table.shelf_id.is_(None))
        .values(shelf_id=selected_shelf.id)
    )

    db.commit()
    return {"assigned": result.rowcount}

# Endpoint para sa pag remove ng mga libro sa isang shelf
@router.patch("/{shelf_remove}/remove")
def remove_books(shelf_remove: str, data: AssignBookShelf, db: Session = Depends(get_db)):

    # Find the selected shelf
    selected_shelf = db.execute(
        select(book_shelves_table).where(book_shelves_table.shelf_code == shelf_remove)
    ).scalar_one_or_none()

    # Stop if the shelf doesn't exist
    if selected_shelf is None:
        raise HTTPException(status_code=404, detail="No shelf found!")

    # Take the copies off this shelf (only copies that are really on it)
    result = db.execute(
        update(book_copies_table)
        .where(book_copies_table.barcode.in_(data.selected_books))
        .where(book_copies_table.shelf_id == selected_shelf.id)
        .values(shelf_id=None)
    )

    db.commit()
    return {"removed": result.rowcount}