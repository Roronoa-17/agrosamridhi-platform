import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CloudSun,
  Search,
  RefreshCcw,
  Droplets,
  Wind,
  CloudRain,
  Thermometer,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Spinner, { PageSpinner } from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { getAllWeatherData, fetchWeatherData, getWeatherAdvisory } from "../api/weather";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Weather() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [district, setDistrict] = useState(user?.district || "");
  const [advisory, setAdvisory] = useState(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);

  const loadRecords = () => {
    setLoading(true);
    getAllWeatherData()
      .then(setRecords)
      .catch((err) => toast.error(extractErrorMessage(err, "Could not load weather data")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetchWeatherData(district.trim());
      toast.success(
        district.trim() ? `Weather data synced for ${district.trim()}` : "Weather data synced successfully"
      );
      loadRecords();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to sync weather data"));
    } finally {
      setSyncing(false);
    }
  };

  const handleAdvisory = async (e) => {
    e.preventDefault();
    if (!district.trim()) return;
    setAdvisoryLoading(true);
    setAdvisory(null);
    try {
      const result = await getWeatherAdvisory(district.trim());
      setAdvisory(result);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not fetch advisory for this district"));
    } finally {
      setAdvisoryLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Weather"
        description="District-level forecasts and farming advisories."
        action={
          <button onClick={handleSync} disabled={syncing} className="btn-secondary">
            {syncing ? <Spinner size={16} /> : <RefreshCcw size={16} />}
            {district.trim() ? `Sync ${district.trim()}` : "Sync latest data"}
          </button>
        }
      />

      <div className="card mb-6 p-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <CloudSun size={17} className="text-brand-600" />
          Get advisory for a district
        </h3>
        <form onSubmit={handleAdvisory} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="e.g. Nashik"
            className="input sm:max-w-xs"
          />
          <button type="submit" disabled={advisoryLoading} className="btn-primary">
            {advisoryLoading ? <Spinner size={16} className="text-white" /> : <Search size={16} />}
            Get advisory
          </button>
        </form>

        {advisory && (
          <div className="mt-4 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">{advisory}</div>
        )}
      </div>

      <h3 className="mb-3 text-sm font-semibold text-slate-700">Recent Forecasts</h3>
      {loading && <PageSpinner label="Loading weather records..." />}

      {!loading && records.length === 0 && (
        <EmptyState
          icon={CloudSun}
          title="No weather data yet"
          description="Sync the latest data to see forecasts for tracked districts."
          action={
            <button onClick={handleSync} className="btn-primary mt-2">
              Sync now
            </button>
          }
        />
      )}

      {!loading && records.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <div key={record.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{record.district}</p>
                  <p className="text-xs text-slate-400">{record.state}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  {record.forecastDate}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Thermometer size={15} className="text-rose-500" />
                  {record.temperature}°C
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Droplets size={15} className="text-sky-500" />
                  {record.humidity}%
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Wind size={15} className="text-slate-400" />
                  {record.windSpeed} km/h
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CloudRain size={15} className="text-blue-500" />
                  {record.rainfall ?? 0} mm
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
