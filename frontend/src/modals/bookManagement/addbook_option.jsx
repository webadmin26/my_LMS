import { useState } from "react";

function AddOption( {onClose, onConfirm} ) {
  const [pickedOption, setPickedOption] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-[#E5E5E5] p-5 shadow-lg">
        <fieldset>
          <legend className="text-base font-semibold text-stone-600">
            Select how you want to add the book
          </legend>

          <div className="mt-3 space-y-1">
            {/* RADIO BUTTON 1 */}
            <label
            className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-emerald-100 has-checked:bg-emerald-100 has-checked:font-semibold"
            >
              <input
                type="radio"
                name="add-method"
                value="openlibrary"
                checked={pickedOption === "openlibrary"}
                onChange={(e) => setPickedOption(e.target.value)}
                className="size-4 cursor-pointer accent-emerald-600"
              />
              Add from Open Library
            </label>

            {/* RADIO BUTTON 2 */}
            <label
            className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-emerald-100 has-checked:bg-emerald-100 has-checked:font-semibold"
            >
              <input
                type="radio"
                name="add-method"
                value="manual"
                checked={pickedOption === "manual"}
                onChange={(e) => setPickedOption(e.target.value)}
                className="size-4 cursor-pointer accent-emerald-600"
              />
              Manual Add
            </label>
          </div>
        </fieldset>


        <div className="mt-5 flex justify-end gap-8">
            <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-sm font-bold text-stone-600 hover:underline"
            >
                CANCEL
            </button>

            <button
            type="button"
            disabled={pickedOption === ""}
            onClick={() => onConfirm(pickedOption)}
            className="cursor-pointer text-sm font-bold text-emerald-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
            >
                CONFIRM
            </button>
        </div>
      </div>
    </div>
  );
}
export default AddOption;