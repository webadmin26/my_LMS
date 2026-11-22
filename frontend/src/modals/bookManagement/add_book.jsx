import { useEffect, useState } from "react";

function AddBook( {book, onClose, onSaved} ){
    const labelStyle = "block text-sm text-stone-600";
    const inputStyle = "w-full bg-white px-2 py-1 text-sm focus:outline-2 focus:outline-emerald-500";
    const headingStyle = "mb-4 text-xl text-stone-600 underline underline-offset-4";
    const fieldGap = "mb-3";

    // USESTATE FOR FETCHING THE BOOK INFORMATION FROM OPEN LIBRARY TO ADD FORM, THE ADD FORM WILL BE AUTOMATICALLY FILLED UP
    const fullTitle = book?.sub_title ? `${book.book_title}: ${book.sub_title}` : book?.book_title ?? "";
    const [title, setTitle] = useState(fullTitle);
    const [isbn, setIsbn] = useState([book?.isbn_10, book?.isbn_13].filter(Boolean).join(", "));
    const [author, setAuthor] = useState(book?.author ?? "");
    const [publisher, setPublisher] = useState(book?.publisher ?? "");
    const [publicationYear, setPublicationYear] = useState(book?.publication_year ?? "");
    const [pages, setPages] = useState(book?.pages ?? "");
    
    // CATEGORY DROPDOWN 
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState("");

    // Book Description (filled from Open Library)
    const [description, setDescription] = useState("");
    const [loadingDescription, setLoadingDescription] = useState(Boolean(book?.work_key));

    //Copies + Classification
    const [copies, setCopies] = useState(1);
    const [ddcNumber, setDdcNumber] = useState("");
    const [authorNumber, setAuthorNumber] = useState("");
    const [subjectHeading, setSubjectHeading] = useState("");

    // Saving the Book (ADD Book button)
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);


    // Load the categories once, when the form opens
    useEffect(() => {
        fetch("/books/categories")
        .then((response) => {
            if(!response.ok) {
                throw new Error("Failed to load categories");
            }
            return response.json();
        })
        .then((data) => {
            setCategories(data); // save list for the dropdown

            // find the category whose name matches the one from Open Library
            const matchedCategory = data.find((item) => item.category === book?.category);
            if (matchedCategory) {
                setCategoryId(matchedCategory.id); // select categogry from the dropdown
            }
        })
        .catch((error) => console.error(error));
    }, []);

    // Load the book description once, when the form opens
    useEffect(() => {
        if (!book?.work_key) return; // no work key (e.g. manual add) → nothing to load

        fetch(`/openlibrarysearch/description?work_key=${book.work_key}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to load description");
            }
            return response.json();
        })
        .then((data) => setDescription(data.description ?? "")) // null → empty box
        .catch((error) => console.error(error))
        .finally(() => setLoadingDescription(false)); // done loading, worked or failed
    }, []);

    // handle for saving book (this arrow function operates when add button is clicked)
    const handleAddBook = () => {
        setSaving(true);
        setError(null);

        fetch("/books", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                book_title: title,
                author: author,
                category_id: Number(categoryId),
                publisher: publisher,
                publication_year: Number(publicationYear),
                isbn: isbn,
                pages: pages ? Number(pages) : null,
                description: description,
                ddc_number: ddcNumber,
                author_number: authorNumber,
                subject_heading: subjectHeading,
                book_cover_image: book?.cover_url ?? null,
                copies: Number(copies),              
            }),
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(typeof data.detail === "string" ? data.detail : "Please check the required fields.");
                }
                return data;
            })

            .then((data) => {
                onSaved(data);
                onClose();
            })
            .catch((error) => setError(error.message))
            .finally(() => setSaving(false));
    };

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
                                <input 
                                id="isbn" 
                                type="text"
                                value={isbn}
                                onChange={(e) => setIsbn(e.target.value)} 
                                className={inputStyle}/>
                            </div>

                            {/* flex-1: Title grows to fill the space left, so its bottom lines up with UPLOAD COVER */}
                            <div className={`${fieldGap} flex flex-1 flex-col`}>
                                <label htmlFor="book-title" className={labelStyle}>Title</label>
                                <textarea 
                                id="book-title" 
                                rows="3" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`${inputStyle} flex-1 resize-none`}/>
                            </div>
                        </div>

                        {/* Row 1 RIGHT: Book Cover */}
                        <div className="mb-3 flex flex-col items-center">
                            <p className={labelStyle}>Book Cover</p>
                            <div className="mt-1 h-48 w-36 border border-gray-400 bg-white">
                                {book?.cover_url && (
                                    <img src={book.cover_url} alt={`Cover of ${title}`}
                                    className="h-full w-full object-cover" />
                                )}
                            </div>
                            <button
                                type="button"
                                className="mt-1 cursor-pointer text-sm font-bold text-stone-600 hover:underline"
                            >
                                UPLOAD COVER
                            </button>
                        </div>

                        {/* Row 2 LEFT: Author */}
                        <div className={fieldGap}>
                            <label htmlFor="author" className={labelStyle}>Author</label>
                            <input 
                            id="author" 
                            type="text" 
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)} 
                            className={inputStyle}/>
                        </div>

                        {/* Row 2 RIGHT: Publisher */}
                        <div className={fieldGap}>
                            <label htmlFor="publisher" className={labelStyle}>Publisher</label>
                            <input 
                            id="publisher" 
                            type="text" 
                            value={publisher}
                            onChange={(e) => setPublisher(e.target.value)} 
                            className={inputStyle}/>
                        </div>

                        {/* Row 3 LEFT: Category */}
                        <div className={fieldGap}>
                            <label htmlFor="category" className={labelStyle}>Category</label>
                            <select 
                            id="category" 
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className={`${inputStyle} cursor-pointer`}>
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option 
                                    key={category.id} 
                                    value={category.id}>
                                        {category.category}
                                    </option>

                                ))}
                            </select>
                        </div>

                        {/* Row 3 RIGHT: Year + Pages */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className={fieldGap}>
                                <label htmlFor="publication_year" className={labelStyle}>Publication Year</label>
                                <input 
                                id="publication_year" 
                                type="number" 
                                value={publicationYear}
                                onChange={(e) => setPublicationYear(e.target.value)} 
                                className={inputStyle}/>
                            </div>
                            <div className={fieldGap}>
                                <label htmlFor="page_number" className={labelStyle}>Number of Pages</label>
                                <input 
                                id="page_number"
                                type="number" min="1" 
                                value={pages}
                                onChange={(e) => setPages(e.target.value)} 
                                className={inputStyle}/>
                            </div>
                        </div>
                    </div>

                    {/* Description: full width */}
                    <div className={fieldGap}>
                        <label htmlFor="description" className={labelStyle}>Description</label>
                        <textarea 
                        id="description" 
                        rows="5" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={loadingDescription ? "Loading description..." : book?.work_key ? "The book has no description found on Open Library. Try adding it yourself.": ""}
                        className={`${inputStyle} resize-y`}/>
                    </div>

                    {/* No. of copies: small box */}
                    <div className="mb-6">
                        <label htmlFor="copies_number" className="block text-sm font-bold text-stone-600">NO. OF COPIES</label>
                        <input 
                        id="copies_number" 
                        type="number" 
                        min="1" 
                        value={copies}
                        onChange={(e) => setCopies(e.target.value)}
                        className={`${inputStyle} max-w-36`}/>
                    </div>

                    {/* ===== CLASSIFICATION ===== */}
                    <h2 className={headingStyle}>CLASSIFICATION</h2>
                    <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                        <div className={fieldGap}>
                            <label htmlFor="ddc_no" className={labelStyle}>DDC No.</label>
                            <input 
                            id="ddc_no" 
                            type="text" 
                            value={ddcNumber}
                            onChange={(e) => setDdcNumber(e.target.value)}
                            className={inputStyle}/>
                        </div>
                        <div className={fieldGap}>
                            <label htmlFor="author_number" className={labelStyle}>Author No.</label>
                            <input 
                            id="author_number" 
                            type="text" 
                            value={authorNumber}
                            onChange={(e) => setAuthorNumber(e.target.value)}
                            className={inputStyle}/>
                        </div>
                        <div className={fieldGap}>
                            <label htmlFor="subject_heading" className={labelStyle}>Subject heading</label>
                            <input 
                            id="subject_heading" 
                            type="text" 
                            value={subjectHeading}
                            onChange={(e) => setSubjectHeading(e.target.value)}
                            className={inputStyle}/>
                        </div>
                    </div>
                </div>


                {/* Error message from the backend (only when saving failed) */}
                {error && (
                    <p className="px-6 pt-2 text-sm text-red-600">{error}</p>
                )}

                {/* Footer */}
                <footer className="flex shrink-0 justify-end gap-8 px-12 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer font-bold text-stone-600 hover:underline"
                    >
                        CANCEL
                    </button>
                    <button
                        type="button"
                        onClick={handleAddBook}
                        disabled={saving}
                        className="cursor-pointer font-bold text-emerald-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {saving ? "SAVING..." : "ADD BOOK"}
                    </button>
                </footer>

            </div>
        </div>
    );
}
export default AddBook;
