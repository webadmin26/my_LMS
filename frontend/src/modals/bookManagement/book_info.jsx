import { useEffect, useState } from "react";

function BookInfo({ onClose, libro }) {
  const [ bookDetails, setBookDetails ] = useState(null);
  const [ error, setError ] = useState(null);

  /* Fetch full details of the clicked copy: GET /books/{barcode} */
  useEffect(() => {
    fetch(`http://localhost:8000/books/${encodeURIComponent(libro.barcode)}`)
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

          {/* Loading / error message */}
          {!bookDetails && !error && (
            <p className="mb-4 text-center text-sm text-stone-500">Loading book details…</p>
          )}
          {error && (
            <p role="alert" className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}

          {/* COVER + BOOK DETAILS */}
          <div className="grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">
            {bookDetails?.book_cover_image ? (
              <img
                src={bookDetails.book_cover_image}
                alt={`Cover of ${bookDetails.book_title}`}
                className="mx-auto h-40 w-28 border border-stone-400 object-cover"
              />
            ) : (
              <div className="mx-auto flex h-40 w-28 items-center justify-center border border-stone-400 bg-stone-100 text-xs text-stone-500">
                Book Cover
              </div>
            )}

            <div className="flex flex-col gap-4 text-sm">
              <dl className="grid grid-cols-[150px_minmax(0,1fr)] gap-x-3">
                <dt>Book ID</dt>
                <dd>{bookDetails?.id ?? "—"}</dd>
                <dt>Title</dt>
                <dd>{bookDetails?.book_title ?? libro.book_title}</dd>
                <dt>Author</dt>
                <dd>{bookDetails?.author ?? libro.author}</dd>
              </dl>

              <dl className="grid grid-cols-[150px_minmax(0,1fr)] gap-x-3">
                <dt>ISBN</dt>
                <dd>{bookDetails?.isbn ?? "—"}</dd>
                <dt>Category</dt>
                <dd>{bookDetails?.category ?? "—"}</dd>
                <dt>Publisher</dt>
                <dd>{bookDetails?.publisher ?? "—"}</dd>
                <dt>Publication Year</dt>
                <dd>{bookDetails?.publication_year ?? "—"}</dd>
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
          <h3 className="mt-6 bg-[#5B9BD5] py-0.5 text-center font-bold text-white">
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

            <dl className="grid grid-cols-[130px_minmax(0,1fr)] gap-x-3">
              <dt>Barcode</dt>
              <dd>{bookDetails?.barcode ?? libro.barcode}</dd>
              <dt>Shelf Location</dt>
              <dd>{bookDetails?.shelf_location ?? "—"}</dd>
              <dt>Status</dt>
              <dd className="capitalize">{bookDetails?.status ?? libro.status}</dd>
            </dl>
          </div>

          {/* COPIES */}
          <h3 className="mt-2 bg-[#5B9BD5] py-0.5 text-center font-bold text-white">
            COPIES
          </h3>

          {/* Copies list scrolls on its own; its header stays visible */}
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full table-fixed text-center text-sm">
              <thead>
                <tr>
                  <th scope="col" className="sticky top-0 bg-stone-200 py-2 font-normal">BARCODE</th>
                  <th scope="col" className="sticky top-0 bg-stone-200 py-2 font-normal">SHELF LOCATION</th>
                  <th scope="col" className="sticky top-0 bg-stone-200 py-2 font-normal">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {/* One row per copy of this title; the clicked copy is first and bold */}
                {sortedCopies.map((copy) => (
                  <tr
                    key={copy.barcode}
                    className={copy.barcode === libro.barcode ? "font-semibold" : ""}
                  >
                    <td className="py-1">{copy.barcode}</td>
                    <td className="py-1">{copy.shelf_location}</td>
                    <td className="py-1 capitalize">{copy.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER (fixed) */}
        <footer className="shrink-0 px-4 py-3 text-center">
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#5C5C5C] cursor-pointer hover:scale-105 transition duration-150"
          >
            CLOSE
          </button>
        </footer>
      </div>
    </div>
  );
}
export default BookInfo;
