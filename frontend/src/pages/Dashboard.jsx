import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Sprout,
  Thermometer,
  CloudSun,
  LineChart,
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUnifiedDashboard } from "../api/dashboard";
import { PageSpinner } from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { extractErrorMessage } from "../api/client";

const quickLinks = [
  { to: "/weather", label: "Weather Advisory", icon: CloudSun, tone: "bg-sky-50 text-sky-600" },
  { to: "/mandi", label: "Mandi Prices", icon: LineChart, tone: "bg-brand-50 text-brand-600" },
  { to: "/schemes", label: "Govt Schemes", icon: FileText, tone: "bg-earth-50 text-earth-700" },
  { to: "/ai", label: "AI Tools", icon: Sparkles, tone: "bg-violet-50 text-violet-600" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = () => {
    if (!user?.farmerId) return;
    setLoading(true);
    setError(null);
    getUnifiedDashboard(user.farmerId)
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err, "Could not load your dashboard right now")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.farmerId]);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Farmer"} 👋`}
        description="Here's what's happening on your farm today."
        action={
          <button onClick={loadDashboard} className="btn-secondary">
            <RefreshCcw size={16} />
            Refresh
          </button>
        }
      />

      {loading && <PageSpinner label="Loading your dashboard..." />}

      {!loading && error && (
        <EmptyState
          icon={Sprout}
          title="Dashboard temporarily unavailable"
          description={error}
          action={
            <button onClick={loadDashboard} className="btn-primary mt-2">
              Try again
            </button>
          }
        />
      )}

      {!loading && !error && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Location</p>
                  <p className="font-semibold text-slate-900">
                    {data.profile?.location || data.profile?.district || "—"}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Primary crop:{" "}
                <span className="font-medium text-slate-700">
                  {data.profile?.primaryCrop || "Not set yet"}
                </span>
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Thermometer size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Weather</p>
                  <p className="font-semibold text-slate-900">
                    {data.weather?.temperature ? `${data.weather.temperature}` : "—"}{" "}
                    <span className="text-sm font-normal text-slate-400">
                      {data.weather?.condition}
                    </span>
                  </p>
                </div>
              </div>
              <p className="mt-4 line-clamp-2 text-sm text-slate-500">
                {data.weather?.advisoryMessage || "No advisory available right now."}
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-earth-50 text-earth-700">
                  <LineChart size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Mandi Trend</p>
                  <p className="font-semibold text-slate-900">
                    {data.mandiTrends?.cropName || "—"}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Average price:{" "}
                <span className="font-medium text-slate-700">
                  {data.mandiTrends?.averagePrice != null
                    ? `₹${data.mandiTrends.averagePrice}`
                    : "No data yet"}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="card group flex flex-col gap-3 p-5 transition-shadow hover:shadow-md"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${link.tone}`}>
                    <link.icon size={18} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">{link.label}</span>
                    <ArrowRight
                      size={15}
                      className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
