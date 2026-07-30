import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { navItems } from "./navItems";

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const current = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/5 bg-white/80 px-4 py-3.5 backdrop-blur md:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
      >
        <Menu size={20} />
      </button>
      <h2 className="text-base font-semibold text-slate-800">
        {current?.label ?? "AgroSamridhi"}
      </h2>
    </header>
  );
}
