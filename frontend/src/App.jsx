import { useState } from "react";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    { label: "Dashboard", icon: "🟦" },
    { label: "Book Management", icon: "📚" },
    { label: "User Management", icon: "👥" },
    { label: "Fine Management", icon: "🧾" },
    { label: "Reports", icon: "📊" },
    { label: "Settings", icon: "⚙️" },
    { label: "Profile", icon: "👤" },
  ];

  return (
    /* MAIN CONTAINER */
    <div className="grid min-h-dvh grid-cols-1 grid-rows-[48px_1fr] bg-gray-100 font-sans lg:grid-cols-[240px_minmax(0,1fr)] lg:grid-rows-[48px_1fr]">

      {/* SIDEBAR */}
      <button
        type="button"
        aria-label="Close Navigation"
        onClick={() => setIsSidebarOpen(false)}
        tabIndex={isSidebarOpen ? 0 : -1}
        aria-hidden={!isSidebarOpen}
        className={`sidebar-backdrop fixed inset-0 z-30 bg-black/40 lg:hidden ${isSidebarOpen ? "is-open" : ""}`}
        />

      <aside
        id="sidebar"
        className={`sidebar ${isSidebarOpen ? "is-open" : ""} fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col overflow-y-auto bg-[#9384c4] p-4 text-white lg:static lg:row-span-2 lg:w-auto`}
      >
        
        <div className="mb-6 text-center text-3xl leading-tight">
          COMPANY <br /> LOGO
        </div>

        {/* SIDEBAR NAV */}
        <nav aria-label="Main navigation">
          <ul className="flex flex-col">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-base transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span aria-hidden="true" className="shrink-0">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* LOG OUT BUTTON */}
        <button
          type="button"
          className="mt-8 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-base transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span aria-hidden="true">🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN HEADER */}
      <header className="flex items-center gap-3 bg-[#9384c4] px-4 text-white">
        <button
        type="button"
        aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isSidebarOpen}
        aria-controls="sidebar"
        onClick={() => setIsSidebarOpen((previous) => !previous)}
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white lg:hidden"
        >
          <span aria-hidden="true" className="text-2xl">☰</span>
        </button>

      <h1 className="flex-1 text-center text-sm lg:text-base">LIBRARY MANAGEMENT SYSTEM</h1>
      </header>

      {/* PAGE CONTENT */}
      <main className="min-w-0 min-h-0 bg-white"></main>
    </div>
  );
}

export default App;
