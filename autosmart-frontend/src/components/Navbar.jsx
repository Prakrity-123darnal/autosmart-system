export function Navbar({ title = "AutoSmart" }) {
  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between shadow">
      <h1 className="text-xl font-bold">{title}</h1>
    </nav>
  );
}