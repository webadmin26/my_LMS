import { useEffect, useState } from "react";

function BookInfo({ onClose, libro }) {
  const [ bookDetails, setBookDetails ] = useState(null);
  const [ error, setError ] = useState(null);

  /* Fetch full details of the clicked copy: GET /books/{barcode} */
  useEffect(() => {
    fetch(`/books/${encodeURIComponent(libro.barcode)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load book details");
        }
        return response.json();
      })
      .then((data) => setBookDetails(data))
      .catch(() => setError("Cannot load book details"));
  }, [libro.barcode]);

  /* Copies list with the clicked copy always on the first row */
  const copies = bookDetails?.copies ?? [];
  const sortedCopies = [
    ...copies.filter((copy) => copy.barcode === libro.barcode),
    ...copies.filter((copy) => copy.barcode !== libro.barcode),
  ];
  
  //Full title: details from the backend, or the table row while loading
  const fullTitle = bookDetails?.book_title ?? libro.book_title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex flex-col w-full max-w-2xl h-[90dvh] overflow-hidden rounded-lg bg-stone-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-info-title"
      >
        {/* HEADER (fixed) */}
        <div className="shrink-0 bg-[#AE5DCC] px-4 py-2 text-center text-white">
          <h2
          id="book-info-title"
          className="font-bold">BOOK DETAILS</h2>
        </div>

        {/* BODY (scrollable) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 scrollbar-none [&::-webkit-scrollbar]:hidden">

          {/* Error message */}
          {error && (
            <p role="alert" className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}

          {/* COVER + BOOK DETAILS */}
          <div className="grid gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
            {bookDetails?.book_cover_image ? (
              <img
                src={bookDetails.book_cover_image}
                alt={`Cover of ${bookDetails.book_title}`}
                className="mx-auto h-65 w-50 mt-5 mr-2 object-contain"
              />
            ) : (
              <div className="mx-auto flex h-40 w-28 items-center justify-center border border-stone-400 bg-stone-100 text-xs text-stone-500">
                Book Cover
              </div>
            )}

            <div className="flex flex-col gap-4 text-sm">
              <dl className="grid grid-cols-[150px_minmax(0,1fr)] gap-x-3 gap-y-2">
                <dt>Book ID</dt>
                <dd>{bookDetails?.barcode ?? "—"}</dd>
                <dt>Title</dt>
                                <dd>
                  <span className="font-semibold">{fullTitle.split(": ")[0]}</span>
                  {fullTitle.includes(": ") && (
                    <span className="block font-medium">
                      {fullTitle.split(": ").slice(1).join(": ")}
                    </span>
                  )}
                </dd>
                <dt>Author</dt>
                <dd>{bookDetails?.author ?? libro.author}</dd>
              </dl>

              <dl className="grid grid-cols-[150px_minmax(0,1fr)] gap-x-3 gap-y-1">
                <dt>ISBN</dt>
                <dd>
                  <div>ISBN-10: {bookDetails?.isbn_10 ?? "—"}</div>
                  <div>ISBN-13: {bookDetails?.isbn_13 ?? "—"}</div>
                </dd>
                <dt>Category</dt>
                <dd>{bookDetails?.category ?? "—"}</dd>
                <dt>Publisher</dt>
                <dd>{bookDetails?.publisher ?? "—"}</dd>
                <dt>Publication Year</dt>
                <dd>{bookDetails?.publication_year ?? "—"}</dd>
              </dl>

              <dl className="grid grid-cols-[150px_minmax(0,1fr)] gap-x-3">
                <dt>No. of Pages</dt>
                <dd>{bookDetails?.pages ?? "—"}</dd>
              </dl>

              <dl className="grid grid-cols-[150px_minmax(0,1fr)] gap-x-3">
                <dt>DDC Number</dt>
                <dd>{bookDetails?.ddc_number ?? "—"}</dd>
                <dt>Author's Number</dt>
                <dd>{bookDetails?.author_number ?? "—"}</dd>
                <dt>Subject Heading</dt>
                <dd>{bookDetails?.subject_heading ?? "—"}</dd>
              </dl>
            </div>
          </div>

          {/* DESCRIPTION */}
          <h3 className="mt-6 text-sm">BOOK DESCRIPTION</h3>
          <p className="mt-3 text-sm text-justify">
            {bookDetails?.description ?? "—"}
          </p>

          {/* INVENTORY */}
          <h3 className="mt-6 bg-[#3FB584] py-0.5 text-center font-bold text-white">
            INVENTORY
          </h3>

          {/* Two columns: counts on the left, copy info on the right (stacked on small screens) */}
          <div className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <dl className="grid grid-cols-[130px_minmax(0,1fr)] gap-x-3">
              <dt>Total Copies</dt>
              <dd>{bookDetails?.total_copies ?? "—"}</dd>
              <dt>Available</dt>
              <dd>{bookDetails?.available ?? "—"}</dd>
              <dt>Borrowed</dt>
              <dd>{bookDetails?.borrowed ?? "—"}</dd>
            </dl>

            <dl className="grid grid-cols-[130px_minmax(0,1fr)] gap-x-3 content-start">
              <dt>Shelf Location</dt>
              <dd>{bookDetails?.shelf_code ?? "—"}</dd>
              <dt>Status</dt>
              <dd className="capitalize">{bookDetails?.status ?? libro.status}</dd>
            </dl>
          </div>

          {/* COPIES */}
          <h3 className="mt-2 bg-[#3FB584] py-0.5 text-center font-bold text-white">
            COPIES
          </h3>

          {/* Copies list scrolls on its own; its header stays visible */}
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr>
                  <th scope="col" className="sticky top-0 px-4 bg-stone-200 py-2 font-normal">BARCODE</th>
                  <th scope="col" className="sticky top-0 px-4 bg-stone-200 py-2 font-normal">SHELF LOCATION</th>
                  <th scope="col" className="sticky top-0 px-4 bg-stone-200 py-2 font-normal">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {/* One row per copy of this title; the clicked copy is first and bold */}
                {sortedCopies.map((copy) => (
                  <tr
                    key={copy.barcode}
                    className={copy.barcode === libro.barcode ? "font-semibold" : ""}
                  >
                    <td className="px-4 py-1">{copy.barcode}</td>
                    <td className="px-4 py-1">{copy.shelf_code ?? "—"}</td>
                    <td className="px-4 py-1 capitalize">{copy.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER (fixed) */}
        <footer className="shrink-0 px-4 py-3 text-center">
          {/* Loading message (bottom of the modal, always visible) */}
          {!bookDetails && !error && (
            <div className="mb-5">
              <p role="status" className="loader text-sm font-semibold text-stone-600">
                Loading book information...
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer font-bold text-stone-600 hover:underline"
          >
            CLOSE
          </button>
        </footer>
      </div>
    </div>
  );
}
export default BookInfo;
