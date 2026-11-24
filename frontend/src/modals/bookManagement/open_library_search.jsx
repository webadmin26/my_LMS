import { useState } from "react";

import AddBook from "./add_book";

function SearchOpenLibrary({ onClose, onBookAdded }) {
  const [searchBy, setSearchBy] = useState("isbn");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1)
  const [moreBooks, setMoreBooks] = useState(false)
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [searchedBooks, setSearchedBooks] = useState("");
  const [textSearched, setTextSearched] = useState("");
  const [addBook, setAddBook] = useState(null);


  const handleSearch = (evnt) => {
    evnt.preventDefault();
    if (!searchText.trim()) return;

    setSearching(true);
    setError(null);
    fetch(
      `/openlibrarysearch/search_books?search_by=${searchBy}&search_text=${encodeURIComponent(searchText.trim())}`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Search failed");
        }
        return response.json();
      })
      .then((data) => {
        setResults(data);
        setPage(1)
        setMoreBooks(data.length === 50)
        setHasSearched(true);
        setSearchedBooks(searchBy);
        setTextSearched(searchText.trim());
      })
      .catch(() => setError("Could not search Open Library. Please try again."))
      .finally(() => setSearching(false));
  };


{/* This function is to handle the loading for more books on search result */}
const handleLoadMore = () => {
  const nextPage = page + 1;

  setLoadingBooks(true);
  setError(null);
  fetch(
      `/openlibrarysearch/search_books?search_by=${searchedBooks}&search_text=${encodeURIComponent(textSearched.trim())}&page=${nextPage}`,
    )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Load more failed!");
      }
      return response.json();
    })
    .then((data) => {
      setResults((previousBooks) => [...previousBooks, ...data]);
      setPage(nextPage);
      setMoreBooks(data.length === 50);
    })
    .catch(() => setError("Could not load more books. Please try again."))
    .finally(() => setLoadingBooks(false));
}

  return (
    /* Modal Background */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Main form */}
      <div className="bg-[#E5E5E5] rounded-lg w-full max-w-7xl h-[90dvh] overflow-hidden flex flex-col">
        {/* Header and title */}
        <div className="flex justify-center text-white text-[15px] font-bold py-1.5 shrink-0 bg-[#AE5DCC]">
          SEARCH OPEN LIBRARY
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="mx-6 mt-6 flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3"
        >
          <div className="flex items-center gap-2">
            <label
              htmlFor="ol-search-by"
              className="text-sm font-semibold text-stone-600"
            >
              Search by:
            </label>
            <select
              value={searchBy}
              onChange={(evnt) => setSearchBy(evnt.target.value)}
              id="ol-search-by"
              className="cursor-pointer bg-white px-2 py-0.5 text-sm"
            >
              <option value="isbn">ISBN</option>
              <option value="title">TITLE</option>
              <option value="author">AUTHOR</option>
            </select>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <label
              htmlFor="search-text"
              className="text-sm font-semibold text-stone-600"
            >
              Search books:
            </label>
            <input
              type="search"
              value={searchText}
              onChange={(evnt) => setSearchText(evnt.target.value)}
              id="search-text"
              placeholder="Type or scan ISBN"
              className="min-w-0 flex-1 sm:w-80 sm:flex-none border-0 border-b border-gray-500 bg-transparent px-2 py-0.5 text-sm transition-all focus:rounded focus:border focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="cursor-pointer text-[13px] rounded-md bg-[#AE5DCC] px-4 py-0.5 font-bold text-white duration-150 hover:scale-105 active:scale-95"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Search Results */}
        <h3 className="mt-6 self-start shrink-0 bg-[#3FB584] px-5 py-1 text-sm font-bold text-white">
          SEARCH RESULTS
        </h3>

        {/* Main table for Search Result */}
        <div className="mt-6 mx-8 min-h-0 flex-1 overflow-auto ">
          <table className="w-full min-w-300 table-fixed text-left">
            <thead className="sticky top-0 z-10 bg-[#3FB584] text-white">
              <tr>
                <th scope="col" className="w-30 text-center px-2 py-1 text-sm font-normal">
                  COVER
                </th>
                <th scope="col" className="px-4 py-1 text-sm font-normal">
                  TITLE
                </th>
                <th scope="col" className="px-4 py-1 text-sm font-normal">
                  AUTHOR
                </th>
                <th scope="col" className="px-4 py-1 text-sm font-normal">
                  PUBLISHER
                </th>
                <th scope="col" className="px-4 py-1 text-sm font-normal">
                  ISBN
                </th>
                <th scope="col" className="px-4 py-1 text-sm text-nowrap font-normal">
                  PUBLICATION YEAR
                </th>
                <th scope="col" className="px-4 py-1 text-sm font-normal">
                  NO. OF PAGES
                </th>
                <th scope="col" className="w-32 text-center px-2 py-1 text-sm font-normal">
                  ADD
                  <span className="sr-only">Add book</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {/* SEARCHING */}
              {searching && (
                <tr>
                  <td colSpan={8} role="status" className="px-4 py-6 text-center">
                    <p className="loader text-sm text-stone-500">
                      Searching Open Library...
                    </p>
                  </td>
                </tr>
              )}

              {/* ERROR SEARCHING */}
              {error && !searching && (
                <tr>
                  <td colSpan={8} className="text-center">
                    <p role="alert" className="mt-6 text-sm text-red-600">
                      {error}
                    </p>
                  </td>
                </tr>
              )}

              {/* NO SEARCH MATCH */}
              {hasSearched && !searching && !error && results.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-stone-500">
                    No Books found on Open Library. Try another search or use
                    Manual Add.
                  </td>
                </tr>
              )}

              {/* SEARCHED RESULT */}
              {!searching &&
                results.map((book, index) => (
                  <tr
                    key={index}
                    className="border-b border-stone-400 text-sm text-stone-600 transition-colors hover:bg-emerald-100"
                  >
                    <td className="px-2 py-1 text-center">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={`Cover of ${book.book_title}`}
                          loading="lazy"
                          className="mx-auto h-30 w-22 object-cover"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-1">
                      <div className="font-semibold">{book.book_title}</div>
                      {book.sub_title && (
                        <div className="text-sm text-stone-500">
                          {book.sub_title}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-1">{book.author ?? "—"}</td>
                    <td className="px-4 py-1">{book.publisher ?? "—"}</td>
                    <td className="px-4 py-1">
                      <div>{book.isbn_10 ?? "—"}</div>
                      <div>{book.isbn_13 ?? "—"}</div>
                    </td>
                    <td className="px-4 py-1">
                      {book.publication_year ?? "—"}
                    </td>
                    <td className="px-4 py-1">{book.pages ?? "—"}</td>

                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => setAddBook(book)}
                        className="cursor-pointer text-sm font-bold text-emerald-600 hover:underline"
                      >
                        Add Book
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          
          {/* LOAD MORE BUTTON */}
                {moreBooks && !searching && (
                  <div className="py-4 text-center">
                    <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingBooks}
                    className="cursor-pointer rounded-md bg-[#3FB584] px-4 py-1 text-[13px] font-bold text-white duration-150 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingBooks ? "Loading..." : "Load more"}
                    </button>
                  </div>
                )}

        </div>

        {/* CLOSE Button */}
        <footer className="shrink-0 px-4 py-3 text-center">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer font-bold text-stone-600 hover:underline"
          >
            CLOSE
          </button>
        </footer>
      </div>

      {/* Add Book form (the BOOK SAVED popup now lives inside AddBook) */}
      {addBook && (
        <AddBook
        book={addBook}
        onClose={() => setAddBook(null)}
        onSaved={() => onBookAdded()} // reload the book table (loadBooks in booklist_table)
        />
      )}

      


    </div>
  );
}
export default SearchOpenLibrary;
