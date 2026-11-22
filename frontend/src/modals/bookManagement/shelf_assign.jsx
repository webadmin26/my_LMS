import { useEffect, useState } from "react";

function ShelfAssign({ onClose, assignShelf, onSaved }) {
  const [selectBooks, setSelectBooks] = useState([]);
  const [error, setError] = useState(null);
  const [selectedShelfBooks, setSelectedShelfBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("barcode");
  const [showSelected, setShowSelected] = useState(false);

  useEffect(() => {
    fetch("/shelves/unassigned")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load books");
        }
        return response.json();
      })
      .then((data) => setSelectBooks(data))
      .catch(() => setError("Could not load books server down!"))
      .finally(() => setLoading(false));
  }, []);

  /* Send the selected barcodes to the backend: PATCH /shelves/{code}/assign */
  const handleSave = () => {
    setSaving(true);
    setError(null);
    fetch(`/shelves/${encodeURIComponent(assignShelf.shelf_code)}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected_books: selectedShelfBooks }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to assign books");
        }
        return response.json();
      })
      .then((data) => {
        onSaved(
          `${data.assigned} copies successfully assigned to shelf ${assignShelf.shelf_code}`,
        );
        onClose();
      })
      .catch(() => setError("Could not save. Please try again."))
      .finally(() => setSaving(false));
  };

  /* Search Filter */
  const searchedBooks = selectBooks.filter((item) =>
    item[searchBy].toLowerCase().includes(searchText.toLowerCase()),
  );

  /* "Show selected" view: keep only the ticked books */
  const visibleBooks = showSelected
    ? searchedBooks.filter((item) => selectedShelfBooks.includes(item.barcode))
    : searchedBooks;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* MODAL STRUCTURE */}
      <div className="bg-[#E5E5E5] rounded-lg w-full max-w-7xl h-[90dvh] overflow-hidden flex flex-col">
        {/* Modal Header Design */}
        <div className="bg-[#A963D0] py-2 text-center text-[15px] font-bold text-white">
          ASSIGN BOOKS TO SHELF "{assignShelf.shelf_code}"
        </div>

        {/* Search Bar */}
        <div className="mx-4 mt-4 flex flex-wrap items-center gap-2">
          <label
            htmlFor="search-copy"
            className="text-sm font-semibold text-stone-600"
          >
            Search Books:
          </label>
          <input
            type="search"
            placeholder="Search..."
            id="search-copy"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64 border-0 border-b border-gray-500 bg-transparent px-2 py-0.5 text-sm transition-all focus:rounded focus:border focus:border-emerald-500 focus:bg-white focus:outline-none"
          />
          <select
            aria-label="Search books"
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="bg-stone-300 px-2 py-0.5 text-sm"
          >
            <option value="barcode">Barcode</option>
            <option value="book_title">Title</option>
            <option value="author">Author</option>
          </select>

          {/* Toggle: all books / only the selected books */}
          <button
            type="button"
            aria-pressed={showSelected}
            onClick={() => setShowSelected(!showSelected)}
            disabled={selectedShelfBooks.length === 0 && !showSelected}
            className={`cursor-pointer rounded-full border border-emerald-600 px-3 py-0.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              showSelected
                ? "bg-emerald-600 text-white"
                : "text-emerald-600 hover:bg-emerald-100"
            }`}
          >
            {showSelected
              ? "SHOW ALL BOOKS"
              : `SHOW SELECTED (${selectedShelfBooks.length})`}
          </button>

          {saving && (
            <div role="status" className="ml-auto flex items-center gap-2 pr-2">
              <span className="size-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <span className="text-lg font-semibold text-stone-600">
                Saving...
              </span>
            </div>
          )}
        </div>

        {/* Table Layout */}
        <div className="max-h-[70dvh] overflow-auto mx-4 mt-4">
          <table className="w-full min-w-248 table-fixed text-center">
            <thead className="bg-[#3FB584] text-white sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  className="w-15 px-3.5 py-1 font-normal text-sm"
                >
                  SELECT
                </th>
                <th scope="col" className="px-2 py-1 font-normal text-sm">
                  BOOK ID
                </th>
                <th scope="col" className="px-2 py-1 w-[30%] font-normal text-sm">
                  TITLE
                </th>
                <th scope="col" className="px-2 py-1 font-normal text-sm">
                  AUTHOR
                </th>
                <th scope="col" className="px-2 py-1 font-normal text-sm">
                  CATEGORY
                </th>
                <th scope="col" className="px-2 py-1 font-normal text-sm">
                  ISBN
                </th>
                <th scope="col" className="px-2 py-1 font-normal text-sm text-nowrap">
                  YEAR PUBLISHED
                </th>
                <th scope="col" className="px-2 py-1 font-normal text-sm">
                  PAGES
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleBooks.map((books) => (
                <tr
                  key={books.barcode}
                  className="border-b border-stone-300 font-semibold transition-colors hover:bg-emerald-100"
                >
                  <td className="px-3.5 py-1.5">
                    <input
                      type="checkbox"
                      checked={selectedShelfBooks.includes(books.barcode)}
                      onChange={() =>
                        setSelectedShelfBooks(
                          selectedShelfBooks.includes(books.barcode)
                            ? selectedShelfBooks.filter(
                                (temp_code) => temp_code !== books.barcode,
                              )
                            : [...selectedShelfBooks, books.barcode],
                        )
                      }
                      className="size-4 cursor-pointer align-middle accent-emerald-600"
                    />
                  </td>
                  <td className="px-1 py-1.5 text-sm">{books.barcode}</td>
                  <td className="px-1 py-1.5 text-sm whitespace-normal wrap-anywhere">
                    {/* Main title (before ": ") semibold, subtitle on its own line */}
                    <span className="font-semibold">{books.book_title.split(": ")[0]}</span>
                    {books.book_title.includes(": ") && (
                      <span className="block font-light">
                        {books.book_title.split(": ").slice(1).join(": ")}
                      </span>
                    )}
                  </td>
                  <td className="px-1 py-1.5 text-sm whitespace-normal wrap-anywhere">
                    {books.author}
                  </td>
                  <td className="px-1 py-1.5 text-sm">{books.category}</td>
                  <td className="px-1 py-1.5 text-sm">
                    <div>{books.isbn_10}</div>
                    <div>{books.isbn_13}</div>
                  </td>
                  <td className="px-1 py-1.5 text-sm">
                    {books.publication_year}
                  </td>
                  <td className="px-1 py-1.5 text-sm">{books.pages ?? "—"}</td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td colSpan={8} role="status" className="py-6">
                    <p className="loader mt-3 text-sm font-semibold text-stone-600">
                      Loading books...
                    </p>
                  </td>
                </tr>
              )}

              {/* Search Result when no books match */}
              {visibleBooks.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={8} className="py-6 text-sm text-stone-500">
                    {showSelected ? "No books selected." : "No books found."}
                  </td>
                </tr>
              )}

              {/* Error Message if Endpoint Crushs */}
              {error && (
                <tr>
                  <td
                    colSpan={8}
                    role="alert"
                    className="py-6 text-sm text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-8 px-6 py-4">
          {/* Selected books counter */}
          <p
            aria-live="polite"
            className="mr-auto text-sm font-semibold text-stone-600"
          >
            Selected:{" "}
            <span className="text-emerald-600">{selectedShelfBooks.length}</span>{" "}
            {selectedShelfBooks.length === 1 ? "book" : "books"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-sm font-bold text-stone-600 hover:underline"
          >
            CLOSE
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedShelfBooks.length === 0 || saving}
            className="cursor-pointer text-sm font-bold text-emerald-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
          >
            {saving ? "SAVING..." : "SAVE"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ShelfAssign;
