import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { navItems } from "./navItems";
import { useAuth } from "../../context/AuthContext";
import AgroLogo from "../ui/AgroLogo";

const SIDEBAR_BG = "#0e4d2f";
const ACTIVE_BG  = "#15803d";
const HOVER_BG   = "rgba(255,255,255,0.08)";

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 select-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: SIDEBAR_BG }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center gap-3.5 px-5 py-5 border-b border-white/10">
          <AgroLogo size={40} />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold text-white tracking-tight">
              AgroSamridhi
            </span>
            <span className="text-[10px] font-extrabold text-green-300 tracking-widest uppercase">
              FARMER PLATFORM
            </span>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className="block"
            >
              {({ isActive }) => (
                <div
                  className={clsx(
                    "flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all cursor-pointer",
                    isActive
                      ? "text-white shadow-sm border border-emerald-500/30"
                      : "text-white/85 hover:text-white"
                  )}
                  style={{
                    background: isActive ? ACTIVE_BG : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = HOVER_BG;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span className="flex items-center gap-3">
                    <item.icon
                      size={18}
                      className="shrink-0 text-white/90"
                    />
                    <span>{item.label}</span>
                  </span>
                  {isActive && (
                    <ChevronRight size={16} className="text-white shrink-0" />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Logout ── */}
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/85 transition-all hover:bg-rose-600/20 hover:text-rose-200"
          >
            <LogOut size={18} className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
