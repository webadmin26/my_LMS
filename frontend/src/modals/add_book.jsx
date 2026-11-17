function AddBook(){
    const labelStyle = "block text-sm text-[#3D3C3A]";
    const inputStyle = "w-full bg-white px-2 py-1 text-sm focus:outline-2 focus:outline-emerald-500";
    const headingStyle = "mb-4 text-xl text-[#3D3C3A] underline underline-offset-4";
    const fieldGap = "mb-3";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            {/* Main Form */}
            <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-[#E5E5E5]">

                {/* Header */}
                <div className="flex shrink-0 justify-center bg-[#AE5DCC] py-1.5 text-[15px] font-bold text-white">
                    ADD BOOK
                </div>

                {/* Scroll area */}
                <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-2">

                    {/* ===== BOOK INFORMATION =====
                        3 rows x 2 cells. Each row is as tall as its tallest cell,
                        so the left and right sides always line up. */}
                    <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">

                        {/* Row 1 LEFT: heading + ISBN + Title */}
                        <div className="flex flex-col">
                            <h2 className={headingStyle}>BOOK INFORMATION</h2>

                            <div className={fieldGap}>
                                <label htmlFor="isbn" className={labelStyle}>ISBN</label>
                                <input id="isbn" type="text" placeholder="ISBN-10, ISBN-13" className={inputStyle}/>
                            </div>

                            {/* flex-1: Title grows to fill the space left, so its bottom lines up with UPLOAD COVER */}
                            <div className={`${fieldGap} flex flex-1 flex-col`}>
                                <label htmlFor="book-title" className={labelStyle}>Title</label>
                                <textarea id="book-title" rows="3" className={`${inputStyle} flex-1 resize-none`}/>
                            </div>
                        </div>

                        {/* Row 1 RIGHT: Book Cover */}
                        <div className="mb-3 flex flex-col items-center">
                            <p className={labelStyle}>Book Cover</p>
                            <div className="mt-1 h-48 w-36 border border-gray-400 bg-white"></div>
                            <button
                                type="button"
                                className="mt-1 cursor-pointer text-sm font-bold text-[#3D3C3A] hover:underline"
                            >
                                UPLOAD COVER
                            </button>
                        </div>

                        {/* Row 2 LEFT: Author */}
                        <div className={fieldGap}>
                            <label htmlFor="author" className={labelStyle}>Author</label>
                            <input id="author" type="text" className={inputStyle}/>
                        </div>

                        {/* Row 2 RIGHT: Publisher */}
                        <div className={fieldGap}>
                            <label htmlFor="publisher" className={labelStyle}>Publisher</label>
                            <input id="publisher" type="text" className={inputStyle}/>
                        </div>

                        {/* Row 3 LEFT: Category */}
                        <div className={fieldGap}>
                            <label htmlFor="category" className={labelStyle}>Category</label>
                            <select id="category" className={`${inputStyle} cursor-pointer`}>
                                <option value=""></option>
                            </select>
                        </div>

                        {/* Row 3 RIGHT: Year + Pages */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className={fieldGap}>
                                <label htmlFor="publication_year" className={labelStyle}>Publication Year</label>
                                <input id="publication_year" type="number" className={inputStyle}/>
                            </div>
                            <div className={fieldGap}>
                                <label htmlFor="page_number" className={labelStyle}>Number of Pages</label>
                                <input id="page_number" type="number" min="1" className={inputStyle}/>
                            </div>
                        </div>
                    </div>

                    {/* Description: full width */}
                    <div className={fieldGap}>
                        <label htmlFor="description" className={labelStyle}>Description</label>
                        <textarea id="description" rows="5" className={`${inputStyle} resize-y`}/>
                    </div>

                    {/* No. of copies: small box */}
                    <div className="mb-6">
                        <label htmlFor="copies_number" className="block text-sm font-bold text-[#3D3C3A]">NO. OF COPIES</label>
                        <input id="copies_number" type="number" min="1" className={`${inputStyle} max-w-36`}/>
                    </div>

                    {/* ===== CLASSIFICATION ===== */}
                    <h2 className={headingStyle}>CLASSIFICATION</h2>
                    <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                        <div className={fieldGap}>
                            <label htmlFor="ddc_no" className={labelStyle}>DDC No.</label>
                            <input id="ddc_no" type="text" className={inputStyle}/>
                        </div>
                        <div className={fieldGap}>
                            <label htmlFor="author_number" className={labelStyle}>Author No.</label>
                            <input id="author_number" type="text" className={inputStyle}/>
                        </div>
                        <div className={fieldGap}>
                            <label htmlFor="subject_heading" className={labelStyle}>Subject heading</label>
                            <input id="subject_heading" type="text" className={inputStyle}/>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="flex shrink-0 justify-end gap-8 px-12 py-3">
                    <button
                        type="button"
                        className="cursor-pointer font-bold text-[#3D3C3A] hover:underline"
                    >
                        CANCEL
                    </button>
                    <button
                        type="button"
                        className="cursor-pointer font-bold text-emerald-600 hover:underline"
                    >
                        ADD BOOK
                    </button>
                </footer>

            </div>
        </div>
    );
}
export default AddBook;
