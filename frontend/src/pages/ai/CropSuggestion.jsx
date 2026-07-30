import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Sprout, ArrowLeft, Calendar, IndianRupee, TrendingUp } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import { getCropSuggestion } from "../../api/ai";
import { extractErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const seasons = ["Kharif", "Rabi", "Zaid"];

export default function CropSuggestion() {
  const { user } = useAuth();
  const location = useLocation();
  const prefill = location.state || {};

  const [form, setForm] = useState({
    nitrogen: prefill.nitrogen ?? "",
    phosphorus: prefill.phosphorus ?? "",
    potassium: prefill.potassium ?? "",
    ph: prefill.ph ?? "",
    budget: "",
    location: user?.district || user?.state || "",
    farmSizeAcres: "",
    season: "Kharif",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        nitrogen: form.nitrogen ? Number(form.nitrogen) : null,
        phosphorus: form.phosphorus ? Number(form.phosphorus) : null,
        potassium: form.potassium ? Number(form.potassium) : null,
        ph: form.ph ? Number(form.ph) : null,
        budget: form.budget ? Number(form.budget) : null,
        location: form.location || null,
        farmSizeAcres: form.farmSizeAcres ? Number(form.farmSizeAcres) : null,
        season: form.season || null,
      };
      const res = await getCropSuggestion(payload);
      setResult(res);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not generate crop suggestions"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/ai" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} /> Back to AI Tools
      </Link>
      <PageHeader
        title="Crop Suggestion"
        description="Get AI-recommended crops and a rotation plan tailored to your farm."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="card space-y-4 p-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="nitrogen">Nitrogen (N)</label>
              <input id="nitrogen" name="nitrogen" type="number" step="0.01" value={form.nitrogen} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="phosphorus">Phosphorus (P)</label>
              <input id="phosphorus" name="phosphorus" type="number" step="0.01" value={form.phosphorus} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="potassium">Potassium (K)</label>
              <input id="potassium" name="potassium" type="number" step="0.01" value={form.potassium} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="ph">Soil pH</label>
              <input id="ph" name="ph" type="number" step="0.01" value={form.ph} onChange={handleChange} className="input" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="location">Location</label>
            <input id="location" name="location" value={form.location} onChange={handleChange} placeholder="District, State" className="input" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="farmSizeAcres">Farm size (acres)</label>
              <input id="farmSizeAcres" name="farmSizeAcres" type="number" step="0.01" min="0" value={form.farmSizeAcres} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="budget">Budget (₹)</label>
              <input id="budget" name="budget" type="number" min="0" value={form.budget} onChange={handleChange} className="input" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="season">Season</label>
            <select id="season" name="season" value={form.season} onChange={handleChange} className="input">
              {seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner size={18} className="text-white" /> : <Sprout size={18} />}
            {loading ? "Generating plan..." : "Get suggestions"}
          </button>
        </form>

        <div className="lg:col-span-3">
          {!result && !loading && (
            <div className="card flex h-full flex-col items-center justify-center gap-2 p-10 text-center text-slate-400">
              <Sprout size={28} />
              <p className="text-sm">Your personalized crop plan will appear here</p>
            </div>
          )}

          {loading && (
            <div className="card flex h-full flex-col items-center justify-center gap-3 p-10 text-center text-slate-500">
              <Spinner size={26} />
              <p className="text-sm">Analyzing soil data and generating your plan...</p>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {result.eligibleCrops?.length > 0 && (
                <div className="card p-6">
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">Eligible Crops</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.eligibleCrops.map((crop) => (
                      <span
                        key={crop}
                        className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.advisory && (
                <div className="card p-6">
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">Advisory</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{result.advisory}</p>
                </div>
              )}

              {result.rotationPlan?.length > 0 && (
                <div className="card p-6">
                  <h3 className="mb-4 text-sm font-semibold text-slate-700">Rotation Plan</h3>
                  <div className="space-y-3">
                    {result.rotationPlan.map((plan, idx) => (
                      <div key={idx} className="rounded-xl border border-black/5 bg-slate-50/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                              Y{plan.year}
                            </span>
                            <span className="font-semibold text-slate-900">{plan.recommendedCrop}</span>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar size={13} /> {plan.season}
                          </span>
                        </div>
                        {plan.reason && <p className="mt-2 text-sm text-slate-600">{plan.reason}</p>}
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                          {plan.estimatedCostPerAcre != null && (
                            <span className="flex items-center gap-1">
                              <IndianRupee size={12} /> Cost/acre: ₹{plan.estimatedCostPerAcre}
                            </span>
                          )}
                          {plan.expectedProfitPerAcre != null && (
                            <span className="flex items-center gap-1 text-brand-700">
                              <TrendingUp size={12} /> Profit/acre: ₹{plan.expectedProfitPerAcre}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
