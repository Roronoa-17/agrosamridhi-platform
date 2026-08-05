import { useState, useEffect } from "react";
import { Menu, ChevronDown, CloudSun, User, Edit3, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { navItems } from "./navItems";
import { useAuth } from "../../context/AuthContext";
import { getCurrentWeather } from "../../api/weather";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [liveTemp, setLiveTemp]         = useState(32);

  const current = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  const userName  = (user?.name || "RAMESH PATIL").toUpperCase();
  const userInit  = userName.split(" ").map((n) => n[0]).join("").slice(0, 2) || "RP";
  const userCity  = user?.district || user?.state || "Dhule";

  useEffect(() => {
    getCurrentWeather(userCity).then((w) => {
      if (w?.temp != null) {
        setLiveTemp(w.temp);
      }
    });
  }, [userCity]);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-black/5 bg-white px-4 py-3.5 md:px-8 shadow-2xs select-none">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {current?.label ?? "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
        {/* Language selector */}
        <div className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 cursor-pointer hover:bg-slate-100 transition-colors">
          <span>🌐 English</span>
          <ChevronDown size={13} className="text-slate-400" />
        </div>

        {/* Weather widget (Dynamic District Temp) */}
        <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
          <CloudSun size={15} className="text-amber-500" />
          <span>Weather {liveTemp}°C — {userCity}</span>
        </div>

        {/* User Profile Avatar Badge with Hover/Click Dropdown */}
        <div className="relative group">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onMouseEnter={() => setDropdownOpen(true)}
            className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white p-1 pr-3 cursor-pointer hover:bg-slate-50 hover:border-emerald-500 transition-all shadow-2xs"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0e4d2f] text-white font-extrabold text-[11px]">
              {userInit}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Farmer Account</span>
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                {userName}
              </span>
            </div>
            <ChevronDown size={13} className="text-slate-400 group-hover:rotate-180 transition-transform" />
          </button>

          {/* Hover / Click Profile Dropdown Menu */}
          <div
            onMouseLeave={() => setDropdownOpen(false)}
            className={`absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl transition-all duration-200 z-50 ${
              dropdownOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"
            }`}
          >
            <div className="px-3 py-2.5 border-b border-slate-100">
              <p className="font-extrabold text-xs text-slate-900">{userName}</p>
              <p className="text-[10px] text-slate-400 font-semibold">{user?.email || "farmer@example.com"}</p>
              <span className="mt-1 inline-block rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-[9px] font-extrabold uppercase">
                {user?.casteCategory || "GEN"} • {user?.landSizeAcres || 2.5} Acres
              </span>
            </div>

            <div className="py-1 space-y-0.5">
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-green-50 hover:text-green-900 transition-colors"
              >
                <User size={15} className="text-emerald-700" />
                View Farmer Profile
              </Link>

              <Link
                to="/profile?edit=true"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 transition-colors"
              >
                <Edit3 size={15} className="text-emerald-700" />
                Edit Profile &amp; Settings
              </Link>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                  navigate("/login");
                }}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
