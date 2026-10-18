import { useEffect, useState } from 'react'

import BookInfo from '../modals/bookManagement/book_info';

function BookManagement() {

  const [ isBookInfoOpen, setIsBookInfoOpen ] = useState(false);
  const [ books, setBooks ] = useState([]);
  const [ error, setError ] = useState(null);
  const [ statusFilter, setStatusFilter ] = useState("all");
  const [ searchText, setSearchText ] = useState("");
  const [ searchBy, setSearchBy ] = useState("book_title");
  const [ selectedBook, setSelectedBook ] = useState(null);

  /* Backend connection */
  useEffect(() => {
    fetch("http://localhost:8000/books")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load books");
      }
      return response.json();
    })
    .then((data) => setBooks(data))

    /* catch error for backend server failure */
    .catch(() => setError("Cannot load books"))
  }, []);

  /* Filter books by status */
  const filteredBooks = statusFilter === "all"
  ? books
  : books.filter((book) => book.status  === statusFilter);

  /* Search Filter */
  const searchedBooks = filteredBooks.filter((item) => item[searchBy].toLowerCase().includes(searchText.toLowerCase()));

  /* Sort rows by book title (A-Z, numbers in natural order), then by barcode */
  const sortedBooks = [...searchedBooks].sort((a, b) =>
    a.book_title.localeCompare(b.book_title, undefined, { numeric: true, sensitivity: "base" })
    || a.barcode.localeCompare(b.barcode, undefined, { numeric: true })
  );

  return (
    <section className="mt-1 min-w-0 min-h-0 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="inline-block bg-emerald-500 text-white font-bold px-3 py-1 text-xs">
        📙BOOK MANAGEMENT
      </h2>

      <div className="flex items-center gap-2">
        <button 
        type="button"
        className="cursor-pointer px-3 py-1 font-semibold text-[#3D3C3A] text-sm hover:text-emerald-600 transition-colors duration-150">
          ADD BOOK
        </button>
        <button
        type="button"
        className="cursor-pointer px-3 py-1 font-semibold text-sm text-[#3D3C3A] hover:text-emerald-600 transition-colors duration-150">
          BORROWED BOOKS
        </button>
      </div>
      </div> 

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
          className="w-100 border-b border-black px-2 py-1"
        />

        <select 
        value={searchBy}
        onChange={(e) => setSearchBy(e.target.value)}
        aria-label="Search books by"
        className="bg-stone-300 px-2 py-0.5 text-sm">
          <option value="barcode">Barcode</option>
          <option value="book_title">Title</option>
          <option value="author">Author</option>
          </select>       
      </div>


      <div className="mt-6 max-h-[70dvh] overflow-auto">
      <table className="table-fixed w-full min-w-160 text-center">
        <thead className="bg-emerald-500 text-white">
          <tr >
          <th scope="col" className="px-4 py-1 font-normal sticky top-0 z-10 bg-emerald-500">Barcode</th>
          <th scope="col" className="px-4 py-1 font-normal sticky top-0 z-10 bg-emerald-500">Title</th>
          <th scope="col" className="px-4 py-1 font-normal sticky top-0 z-10 bg-emerald-500">Author</th>
          <th scope="col" className="px-4 py-1 font-normal sticky top-0 z-10 bg-emerald-500">
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
          <th scope="col" className="px-4 py-1 font-normal sticky top-0 z-10 bg-emerald-500">Action</th>
          </tr>
        </thead>

        <tbody>
          {sortedBooks.map((item) => (
          <tr key={item.barcode} className="border-b border-stone-300 font-semibold hover:bg-emerald-100 transition-colors">
            <td className="px-1 py-1.5 text-xs">{item.barcode}</td>
            <td className="px-1 py-1.5 text-xs whitespace-normal wrap-anywhere">{item.book_title}</td>
            <td className="px-1 py-1.5 text-xs whitespace-normal wrap-anywhere">{item.author}</td>
            <td className="px-1 py-1.5 text-xs capitalize">{item.status}</td>
            <td>
              <button 
              type="button"
              onClick={() => {setIsBookInfoOpen(true); setSelectedBook(item);}}
              className="cursor-pointer px-1 py-0.5 text-stone-600 hover:scale-105 transition duration-150 text-xs font-semibold">View</button>
              <button type="button" className="cursor-pointer px-1 py-0.5 text-stone-600 hover:scale-105 transition duration-150 text-xs font-semibold">Edit</button>
              <button type="button" className="cursor-pointer px-1 py-0.5 text-stone-600 hover:scale-105 transition duration-150 text-xs">Delete</button>
            </td>
          </tr>
          ))}

          {/* Search Result when no books found it Returns "No Books Found" */}
          {searchedBooks.length === 0 && !error && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-sm text-stone-500">
                No book record found in the database.
              </td>
            </tr>
          )}

          {/* If backend fails show this conditional error message from "setError useState"*/}
          {error && (
          <tr>
            <td colSpan={5}>
            <p role="alert" className="mt-6 text-sm text-red-600">
            {error}
            </p>
          </td>
          </tr>
          )}
        </tbody>
      </table>
      </div>

      {isBookInfoOpen && (
        <BookInfo libro={selectedBook} onClose={() => setIsBookInfoOpen(false)} />
      )}
    
    </section>
  );
}
export default BookManagement;
