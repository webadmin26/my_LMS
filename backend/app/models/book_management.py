from datetime import date, datetime
from sqlalchemy import BigInteger, SmallInteger, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class books_table(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    book_title: Mapped[str] = mapped_column(String)
    author: Mapped[str] = mapped_column(String)
    isbn: Mapped[str] = mapped_column(String)
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("categories.id"))
    publisher: Mapped[str] = mapped_column(String)
    publication_year: Mapped[int] = mapped_column(SmallInteger)
    ddc_number: Mapped[str | None] = mapped_column(String)
    author_number: Mapped[str | None] = mapped_column(String)
    subject_heading: Mapped[str | None] = mapped_column(String)
    book_cover_image: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)


class categories_table(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    category: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)

class book_copies_table(Base):
    __tablename__ = "book_copies"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    book_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("books.id"))
    barcode: Mapped[str] = mapped_column(String, unique=True)
    accession_number: Mapped[str] = mapped_column(String)
    shelf_location: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    acquired_at: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))