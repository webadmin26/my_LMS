import { useEffect, useState } from "react";

import BookInfo from "../../modals/bookManagement/book_info";
import AddOption from "../../modals/bookManagement/addbook_option";
import BookShelves from "./book_shelves";
import SearchOpenLibrary from "../../modals/bookManagement/open_library_search";
import AddBook from "../../modals/bookManagement/add_book";

function BookManagement() {
  /* Which tab is showing: "books" (table) or "shelves" */
  const [activeTab, setActiveTab] = useState("books");
  const [isBookInfoOpen, setIsBookInfoOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("book_title");
  const [selectedBook, setSelectedBook] = useState(null);
  const [isAssignMode, setIsAssignMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addOption, setAddOption] = useState(false);
  const [isOpenLibraryOpen, setIsOpenLibraryOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  /* Backend connection: load the book list (also called again after a book is added) */
  const loadBooks = () => {
    fetch("/books")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load books");
        }
        return response.json();
      })
      .then((data) => setBooks(data))

      /* catch error for backend server failure */
      .catch(() => setError("Cannot load books"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  /* Filter books by status */
  const filteredBooks =
    statusFilter === "all"
      ? books
      : books.filter((book) => book.status === statusFilter);

  /* Search Filter */
  const searchedBooks = filteredBooks.filter((item) =>
    item[searchBy].toLowerCase().includes(searchText.toLowerCase()),
  );

  /* Sort rows by book title (A-Z, numbers in natural order), then by barcode */
  const sortedBooks = [...searchedBooks].sort(
    (a, b) =>
      a.book_title.localeCompare(b.book_title, undefined, {
        numeric: true,
        sensitivity: "base",
      }) || a.barcode.localeCompare(b.barcode, undefined, { numeric: true }),
  );

  return (
    <section className="mt-1 min-w-0 min-h-0 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Clicking the title goes back to the books table */}
        <h2 className="inline-block bg-emerald-500 text-white font-bold text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("books")}
            className="cursor-pointer px-3 py-1"
          >
            📙BOOK MANAGEMENT
          </button>
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddOption(true)}
            className="cursor-pointer px-3 py-1 font-semibold text-stone-600 text-sm hover:text-emerald-600 transition-colors duration-150"
          >
            ADD BOOK
          </button>
          <button
            type="button"
            className="cursor-pointer px-3 py-1 font-semibold text-sm text-stone-600 hover:text-emerald-600 transition-colors duration-150"
          >
            PRINT BARCODE
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("shelves");
              setIsAssignMode(false);
            }}
            aria-current={activeTab === "shelves" ? "page" : undefined}
            className={`cursor-pointer px-3 py-1 font-semibold text-sm hover:text-emerald-600 transition-colors duration-150 ${
              activeTab === "shelves"
                ? "text-emerald-600 underline underline-offset-4"
                : "text-stone-600"
            }`}
          >
            BOOK SHELVES
          </button>
        </div>
      </div>

      {/* Memory box for book_shelves with "Assign" mode */}
      {activeTab === "shelves" && (
        <BookShelves
          assignMode={isAssignMode}
          onStartAssign={() => setIsAssignMode(true)}
        />
      )}

      {activeTab === "books" && (
        <>
          <div className="flex items-center gap-2 mt-6">
            <label htmlFor="search-book" className="sr-only">
              Search Books
            </label>

            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              id="search-book"
              type="search"
              placeholder="Search Book"
              className="w-75 border-b border-black px-2 py-1"
            />

            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              aria-label="Search books by"
              className="bg-stone-300 px-2 py-0.5 text-sm"
            >
              <option value="barcode">Book ID</option>
              <option value="book_title">Title</option>
              <option value="author">Author</option>
            </select>
          </div>

          <div className="mt-6 max-h-[70dvh] overflow-auto">
            <table className="table-fixed w-full min-w-160 text-left">
              <thead className="bg-emerald-500 text-white">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-1 font-normal sticky top-0 z-10 bg-emerald-500"
                  >
                    Book ID
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-1 font-normal sticky top-0 z-10 w-[30%] bg-emerald-500"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-1 font-normal sticky top-0 z-10 w-[20%] bg-emerald-500"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-1 font-normal sticky top-0 z-10 bg-emerald-500 text-nowrap"
                  >
                    Status
                    {/* Filter system para ifilter and mga libro sa table base sa status nila  */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      aria-label="Filter by status"
                      className="ml-2 bg-white text-stone-600 text-xs"
                    >
                      <option value="all">All</option>
                      <option value="available">Available</option>
                      <option value="borrowed">Borrowed</option>
                      <option value="reserved">Reserved</option>
                      <option value="lost">Lost</option>
                      <option value="damaged">Damaged</option>
                    </select>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-1 font-normal sticky top-0 z-10 bg-emerald-500"
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedBooks.map((item) => (
                  <tr
                    key={item.barcode}
                    className="border-b border-stone-300 font-semibold text-stone-600 hover:bg-emerald-100 transition-colors"
                  >
                    <td className="px-4 py-1.5 text-sm">{item.barcode}</td>
                    <td className="px-4 py-1.5 text-sm whitespace-normal wrap-anywhere">
                      <span className="font-semibold text-stone-600">
                        {item.book_title.split(": ")[0]}
                      </span>
                      {item.book_title.includes(": ") && (
                        <span className="block font-medium text-stone-600">
                          {item.book_title.split(": ").slice(1).join(": ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-1.5 text-sm text-stone-600 whitespace-normal wrap-anywhere">
                      {item.author}
                    </td>
                    <td className="px-4 py-1.5 text-sm text-stone-600 capitalize">
                      {item.status}
                    </td>
                    <td className="px-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsBookInfoOpen(true);
                          setSelectedBook(item);
                        }}
                        className="cursor-pointer px-1 py-0.5 text-sm font-semibold text-stone-600 hover:underline"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer px-1 py-0.5 text-sm font-semibold text-stone-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer px-1 py-0.5 text-sm font-semibold text-stone-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Loading message while the books are fetched */}
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      role="status"
                      className="px-4 py-6 text-center"
                    >
                      <p className="loader text-sm text-stone-500">
                        Loading books...
                      </p>
                    </td>
                  </tr>
                )}

                {/* Search Result when no books found it Returns "No Books Found" */}
                {searchedBooks.length === 0 && !error && !loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-stone-500"
                    >
                      No book record found in the database.
                    </td>
                  </tr>
                )}

                {/* If backend fails show this conditional error message from "setError useState"*/}
                {error && (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <p role="alert" className="mt-6 text-sm text-red-600">
                        {error}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Book Info Modal */}
          {isBookInfoOpen && (
            <BookInfo
              libro={selectedBook}
              onClose={() => setIsBookInfoOpen(false)}
            />
          )}
        </>
      )}

      {/* Add Book Option Select */}
      {addOption && (
        <AddOption
          onClose={() => setAddOption(false)}
          onConfirm={(pickedOption) => {
            setAddOption(false);
            if (pickedOption === "openlibrary") {
              setIsOpenLibraryOpen(true);
            } else if (pickedOption === "manual") {
              setIsAddFormOpen(true);
            }
          }}
        />
      )}

      {/* Search form for Open Library */}
      {isOpenLibraryOpen && (
        <SearchOpenLibrary
          onClose={() => setIsOpenLibraryOpen(false)}
          onBookAdded={loadBooks}
        />
      )}

      {/* Manual Add Form */}
      {isAddFormOpen && (
        <AddBook
          onClose={() => setIsAddFormOpen(false)}
          onSaved={() => loadBooks()}
        />
      )}
    </section>
  );
}
export default BookManagement;
