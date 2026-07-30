import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LineChart as LineChartIcon, Search, RefreshCcw, Wheat } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Spinner, { PageSpinner } from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import StatCard from "../components/ui/StatCard";
import { getAllMandiPrices, fetchMandiPrices, getMandiTrend } from "../api/mandi";
import { extractErrorMessage } from "../api/client";

const BRAND_600 = "#35762a";
const MUTED = "#898781";
const GRIDLINE = "#e1e0d9";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-black/5 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-slate-700">{label}</p>
      <p className="mt-0.5 text-slate-500">
        Modal price: <span className="font-semibold text-slate-800">₹{payload[0].value}</span>
      </p>
    </div>
  );
}

export default function Mandi() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [cropName, setCropName] = useState("");
  const [trend, setTrend] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);

  const loadRecords = () => {
    setLoading(true);
    getAllMandiPrices()
      .then(setRecords)
      .catch((err) => toast.error(extractErrorMessage(err, "Could not load mandi prices")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetchMandiPrices();
      toast.success("Mandi prices synced successfully");
      loadRecords();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to sync mandi prices"));
    } finally {
      setSyncing(false);
    }
  };

  const handleTrend = async (e) => {
    e.preventDefault();
    if (!cropName.trim()) return;
    setTrendLoading(true);
    setTrend(null);
    try {
      const result = await getMandiTrend(cropName.trim());
      setTrend(result);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not fetch trend for this crop"));
    } finally {
      setTrendLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const byCrop = new Map();
    for (const r of records) {
      const existing = byCrop.get(r.cropName);
      if (!existing || new Date(r.arrivalDate) > new Date(existing.arrivalDate)) {
        byCrop.set(r.cropName, r);
      }
    }
    return Array.from(byCrop.values())
      .map((r) => ({ crop: r.cropName, price: r.modalPrice }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 10);
  }, [records]);

  return (
    <div>
      <PageHeader
        title="Mandi Prices"
        description="Live market prices and trends across mandis."
        action={
          <button onClick={handleSync} disabled={syncing} className="btn-secondary">
            {syncing ? <Spinner size={16} /> : <RefreshCcw size={16} />}
            Sync latest prices
          </button>
        }
      />

      <div className="card mb-6 p-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <LineChartIcon size={17} className="text-brand-600" />
          Check price trend for a crop
        </h3>
        <form onSubmit={handleTrend} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            placeholder="e.g. Onion"
            className="input sm:max-w-xs"
          />
          <button type="submit" disabled={trendLoading} className="btn-primary">
            {trendLoading ? <Spinner size={16} className="text-white" /> : <Search size={16} />}
            Get trend
          </button>
        </form>

        {trend && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Crop" value={trend.cropName} tone="brand" icon={Wheat} />
            <StatCard label="Average Price" value={`₹${trend.averagePrice ?? "—"}`} tone="sky" />
            <StatCard label="Min / Max" value={`₹${trend.minimumPrice ?? "—"} / ₹${trend.maximumPrice ?? "—"}`} tone="earth" />
            <StatCard label="Records" value={trend.totalRecords ?? 0} tone="amber" />
          </div>
        )}
      </div>

      {loading && <PageSpinner label="Loading mandi prices..." />}

      {!loading && records.length === 0 && (
        <EmptyState
          icon={LineChartIcon}
          title="No mandi price data yet"
          description="Sync the latest prices to see market trends."
          action={
            <button onClick={handleSync} className="btn-primary mt-2">
              Sync now
            </button>
          }
        />
      )}

      {!loading && records.length > 0 && (
        <>
          <div className="card mb-6 p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">
              Latest modal price by crop (top 10)
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke={GRIDLINE} />
                  <XAxis
                    dataKey="crop"
                    tick={{ fontSize: 12, fill: MUTED }}
                    axisLine={{ stroke: GRIDLINE }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: MUTED }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip cursor={{ fill: "rgba(53,118,42,0.06)" }} content={<ChartTooltip />} />
                  <Bar dataKey="price" fill={BRAND_600} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Crop</th>
                    <th className="px-5 py-3">Mandi</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3 text-right">Min</th>
                    <th className="px-5 py-3 text-right">Max</th>
                    <th className="px-5 py-3 text-right">Modal</th>
                    <th className="px-5 py-3">Arrival Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-slate-800">{r.cropName}</td>
                      <td className="px-5 py-3 text-slate-600">{r.mandiName}</td>
                      <td className="px-5 py-3 text-slate-500">
                        {r.district}, {r.state}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-600 tabular-nums">₹{r.minPrice}</td>
                      <td className="px-5 py-3 text-right text-slate-600 tabular-nums">₹{r.maxPrice}</td>
                      <td className="px-5 py-3 text-right font-medium text-slate-800 tabular-nums">
                        ₹{r.modalPrice}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{r.arrivalDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
