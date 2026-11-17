import { useEffect, useState } from "react";
import ShelfAssign from "../../modals/bookManagement/shelf_assign";
import ShelfView from "../../modals/bookManagement/shelf_view";

function BookShelves({ onStartAssign, assignMode }) {
  const [shelves, setShelves] = useState([]);
  const [error, setError] = useState(null);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [isShelfAssignOpen, setIsShelfAssignOpen] = useState(false);
  const [isShelfViewOpen, setIsShelfViewOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadshelves = () => {
    fetch("/shelves")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load shelves");
        }
        return response.json();
      })
      .then((data) => setShelves(data))
      .catch(() => setError("Cannot load shelves"))
      .finally(() => setLoading(false));
  };

  /* Load once when the page opens */
  useEffect(() => {
    loadshelves();
  }, []);


/* Reset the Message Box after 5 sec */
useEffect(() => {
  if (!saveSuccess) return;

  const timer = setTimeout(() => {
    setSaveSuccess(null);
  }, 5000);

  return () => clearTimeout(timer);
}, [saveSuccess]);

  return (
    <section className="mt-6 min-w-0">
      {/* Toolbars */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        {/* Left Group */}

        {/* Wrapper for SHELVES OPTIONS */}
        {assignMode ? (
          <h3 className="text-base font-bold">
            SELECT A SHELF AND ASSIGN BOOKS
          </h3>
        ) : (
          /* Normal default page for book shelves */
          <div>
            <p className="text-sm font-bold">Shelves Options:</p>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                disabled={!selectedShelf}
                onClick={() => {
                  setIsShelfViewOpen(true);
                  setSaveSuccess(null);
                }}
                className="cursor-pointer w-15 rounded-full bg-[#3FB584] py-0.5 text-xs font-bold text-white flex items-center justify-center duration-150 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100"
              >
                VIEW
              </button>
              <button
                type="button"
                disabled={!selectedShelf}
                className="cursor-pointer w-15 rounded-full bg-[#FF8000] py-0.5 text-xs font-bold text-white flex items-center justify-center duration-150 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100"
              >
                EDIT
              </button>
              <button
                type="button"
                disabled={!selectedShelf}
                className="cursor-pointer w-15 rounded-full bg-[#FF0A1F] py-0.5 text-xs font-bold text-white flex items-center justify-center duration-150 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100"
              >
                DELETE
              </button>
            </div>
          </div>
        )}

        {/* Right Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* wrapper for ADD, ASSIGN buttons */}
          {!assignMode && (
            <>
              {/* Normal page layout */}
              <button
                type="button"
                className="cursor-pointer w-15 rounded-full bg-[#3FB584] py-0.5 text-xs font-bold text-white flex items-center justify-center duration-150 hover:scale-105 active:scale-95"
              >
                ADD
              </button>
              <button
                type="button"
                /* Button operation that hides shelves option buttons and assign button */
                onClick={() => {
                  onStartAssign();
                  setSelectedShelf(null);
                }}
                className="cursor-pointer w-15 rounded-full bg-[#D60AFF] py-0.5 text-xs font-bold text-white flex items-center justify-center duration-150 hover:scale-105 active:scale-95"
              >
                ASSIGN
              </button>
            </>
          )}

          <div>
          <label htmlFor="search-shelf" className="ml-2 text-sm">
            Search Shelf:
          </label>
          <input
            id="search-shelf"
            type="search"
            placeholder="Shelf code..."
            className="w-48 border-0 border-b border-gray-500 text-sm transition-all focus:rounded focus:border focus:border-emerald-500 focus:outline-none px-2 py-0.5"
          />
          </div>
        </div>
      </div>

      {saveSuccess && (
        <p
          role="status"
          className="mt-4 rounded bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 motion-safe:animate-toast"
        >
          {saveSuccess}
        </p>
      )}

      {/* Shelves Table */}
      <div className="mt-4 max-h-[70dvh] overflow-auto">
        <table className="w-full min-w-3xl table-fixed text-center">
          <thead className="bg-[#3FB584] text-white sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-2 py-1 font-normal">
                Book Shelf
              </th>
              <th scope="col" className="px-2 py-1 font-normal">
                Location
              </th>
              <th scope="col" className="px-2 py-1 font-normal">
                Section
              </th>
              <th scope="col" className="px-2 py-1 font-normal">
                DDC Range
              </th>
              <th scope="col" className="px-2 py-1 font-normal">
                Used/Max
              </th>

              {/* ("ITO AY CONDITION WRAPPER")/ASSIGN Column when ASSIGN MODE IS ACTIVATED, SHOW THIS  */}
              {assignMode && (
                <th scope="col" className="px-2 py-1 font-normal">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {shelves.map((shelf) => {
              const isSelected =
                !assignMode && selectedShelf?.shelf_code === shelf.shelf_code;

              return (
                <tr
                  key={shelf.shelf_code}
                  onClick={
                    assignMode
                      ? undefined
                      : () => setSelectedShelf(isSelected ? null : shelf)
                  }
                  aria-selected={isSelected}
                  className={`border-b border-stone-300 font-semibold transition-colors ${
                    assignMode ? "" : "cursor-pointer"
                  } ${isSelected ? "bg-emerald-200" : "hover:bg-emerald-100"}`}
                >
                  <td className="px-1 py-1 text-xs">{shelf.shelf_code}</td>
                  <td className="px-1 py-1 text-xs">{shelf.location}</td>
                  <td className="px-1 py-1 text-xs">{shelf.section_name}</td>
                  <td className="px-1 py-1 text-xs">
                    {shelf.ddc_start === null
                      ? "—"
                      : `${shelf.ddc_start} - ${shelf.ddc_end}`}
                  </td>
                  <td className="px-1 py-1 text-xs">
                    {shelf.used}/{shelf.max_capacity ?? "—"}
                  </td>

                  {/* CONDITION LINE for Action tab */}
                  {assignMode && (
                    <td className="px-1 py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsShelfAssignOpen(true);
                          setSelectedShelf(shelf);
                          setSaveSuccess(null)
                        }}
                        className="cursor-pointer rounded-full justify-center bg-[#4A62E8] px-2 py-0.5 text-[11px] font-semibold text-white duration-150 hover:scale-105 active:scale-95"
                      >
                        ASSIGN
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}

            {loading && (
                <tr>
                  <td colSpan={assignMode ? 6 : 5} role="status" className="py-6">
                    <p className="loader mt-3 text-sm font-semibold text-[#3D3C3A]">Loading shelves...</p>
                  </td>
                </tr>
              )}

            {error && (
              <tr>
                <td
                  colSpan={assignMode ? 6 : 5}
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

      {/* shelf_assign.jsx Renders */}
      {isShelfAssignOpen && (
        <ShelfAssign
          assignShelf={selectedShelf}
          onClose={() => setIsShelfAssignOpen(false)}
          /* Refresh the page when Save button on Assing Book Shelf is clicked */
          onSaved={(message) => {
          loadshelves();
          setSaveSuccess(message)
          }}
        />
      )}

      {/* shelf_view.jsx Renders */}
      {isShelfViewOpen && (
        <ShelfView
          viewShelf={selectedShelf}
          onClose={() => setIsShelfViewOpen(false)}
          /* Refresh the table (Used count) after books are removed */
          onRemoved={(message) => {
            loadshelves();
            setSaveSuccess(message);
          }}
        />
      )}
    </section>
  );
}
export default BookShelves;
