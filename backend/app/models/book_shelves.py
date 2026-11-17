from sqlalchemy import BigInteger, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class sections_table(Base):
    __tablename__ = "sections"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    section_name: Mapped[str] = mapped_column(String)
    is_borrowable: Mapped[bool] = mapped_column(Boolean)
    loan_days: Mapped[int | None] = mapped_column(Integer)

class book_shelves_table(Base):
    __tablename__ = "book_shelves"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    shelf_code: Mapped[str] = mapped_column(String, unique=True)
    section_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("sections.id"))
    location: Mapped[str | None] = mapped_column(String)
    ddc_start: Mapped[int | None] = mapped_column(Integer)
    ddc_end: Mapped[int | None] = mapped_column(Integer)
    max_capacity: Mapped[int | None] = mapped_column(Integer)

