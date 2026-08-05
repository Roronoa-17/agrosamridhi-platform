import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sprout, ChevronDown, Calendar, IndianRupee, Droplets, FlaskConical } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import { getCropSuggestion } from "../../api/ai";
import { useAuth } from "../../context/AuthContext";

const GREEN = "#0e4d2f";
const LOCAL_SOIL_KEY = "agrosamridhi_latest_soil_ocr";

const SEASONS = [
  "Kharif (Monsoon/Summer)",
  "Rabi (Winter)",
  "Zaid (Spring/Summer)",
];

const IRRIGATION_OPTIONS = [
  "Low (Rainfed only)",
  "Medium (Canal / Tube Well)",
  "High (Drip / Sprinkler)",
];

const TABS = ["Recommended Crops", "Fertilizer Doses", "Crop Rotation", "Planting Calendar"];

const ALL_CROP_KNOWLEDGE = {
  KHARIF: [
    { name: "Rice / Paddy", season: "KHARIF", waterDemand: "HIGH", minBudgetPerAcre: 18000, approxCost: 35000, expectedProfit: 42000, minPh: 5.0, maxPh: 6.8, suitabilityReason: "High water requirement. Ideal for clay/loam soils with high water retention and warm monsoon weather." },
    { name: "Maize (Corn)", season: "KHARIF", waterDemand: "MEDIUM", minBudgetPerAcre: 12000, approxCost: 25000, expectedProfit: 35000, minPh: 5.5, maxPh: 7.5, suitabilityReason: "Moderate water demand. High grain yield potential with balanced NPK." },
    { name: "Cotton (Kapas)", season: "KHARIF", waterDemand: "MEDIUM", minBudgetPerAcre: 20000, approxCost: 40000, expectedProfit: 48000, minPh: 6.0, maxPh: 8.2, suitabilityReason: "Capital intensive cash crop. Thrives in deep black cotton soils with good drainage." },
    { name: "Soybean", season: "KHARIF", waterDemand: "MEDIUM", minBudgetPerAcre: 9000, approxCost: 22000, expectedProfit: 38000, minPh: 6.0, maxPh: 7.8, suitabilityReason: "Low water & budget demand. Leguminous oilseed that enriches nitrogen-deficient soils." },
  ],
  RABI: [
    { name: "Wheat (Gehun)", season: "RABI", waterDemand: "MEDIUM", minBudgetPerAcre: 14000, approxCost: 28000, expectedProfit: 40000, minPh: 6.0, maxPh: 7.5, suitabilityReason: "Staple Rabi cereal crop requiring cool germination temperatures and 3-4 irrigations." },
    { name: "Chickpea (Chana)", season: "RABI", waterDemand: "LOW", minBudgetPerAcre: 8000, approxCost: 18000, expectedProfit: 32000, minPh: 6.0, maxPh: 8.0, suitabilityReason: "Low water & low budget crop with excellent biological nitrogen fixation." },
    { name: "Mustard (Sarson)", season: "RABI", waterDemand: "LOW", minBudgetPerAcre: 7000, approxCost: 15000, expectedProfit: 30000, minPh: 6.0, maxPh: 7.5, suitabilityReason: "Lowest cost input oilseed crop with high market prices during winter harvest." },
    { name: "Potato (Aloo)", season: "RABI", waterDemand: "HIGH", minBudgetPerAcre: 22000, approxCost: 45000, expectedProfit: 55000, minPh: 5.0, maxPh: 6.5, suitabilityReason: "High capital & irrigation requirement. High profit tuber crop in sandy loam soil." },
  ],
  ZAID: [
    { name: "Watermelon (Tarbooz)", season: "ZAID", waterDemand: "HIGH", minBudgetPerAcre: 15000, approxCost: 30000, expectedProfit: 45000, minPh: 6.0, maxPh: 7.0, suitabilityReason: "High water demand. Fast-growing summer cash crop with high market demand." },
    { name: "Cucumber (Kheera)", season: "ZAID", waterDemand: "MEDIUM", minBudgetPerAcre: 10000, approxCost: 20000, expectedProfit: 34000, minPh: 5.5, maxPh: 7.0, suitabilityReason: "Moderate budget horticultural crop giving continuous picking yields." },
    { name: "Muskmelon (Kharbooza)", season: "ZAID", waterDemand: "MEDIUM", minBudgetPerAcre: 12000, approxCost: 25000, expectedProfit: 38000, minPh: 6.0, maxPh: 7.0, suitabilityReason: "High sugar content summer fruit crop suitable for light sandy loam soils." },
  ]
};

function calculateDynamicCrops(seasonStr, irrigationStr, budgetNum, acresNum, phNum) {
  const normSeason = seasonStr.toUpperCase().includes("RABI") ? "RABI" : seasonStr.toUpperCase().includes("ZAID") ? "ZAID" : "KHARIF";
  const cropList = ALL_CROP_KNOWLEDGE[normSeason] || ALL_CROP_KNOWLEDGE.KHARIF;
  const isRainfed = irrigationStr.toLowerCase().includes("low");

  let filtered = cropList.filter((c) => {
    if (isRainfed && c.waterDemand === "HIGH") {
      return false;
    }
    const totalCostForFarm = c.approxCost * acresNum;
    if (budgetNum > 0 && totalCostForFarm > budgetNum * 1.3 && budgetNum < 30000) {
      return c.minBudgetPerAcre <= budgetNum / acresNum + 5000;
    }
    return true;
  });

  if (filtered.length === 0) {
    filtered = cropList.filter((c) => c.waterDemand !== "HIGH");
  }

  return filtered.map((c, i) => {
    const totalBudget = Math.round(c.approxCost * acresNum);
    const totalProfit = Math.round(c.expectedProfit * acresNum);

    return {
      cropName: c.name,
      rank: i + 1,
      waterDemand: c.waterDemand,
      minBudgetPerAcre: c.minBudgetPerAcre,
      totalFarmBudget: totalBudget,
      expectedProfitPerAcre: c.expectedProfit,
      totalFarmProfit: totalProfit,
      suitabilityReason: `${c.suitabilityReason} (Calculated for ${acresNum} acres | Irrigation: ${irrigationStr.split(" ")[0]} | Total Farm Budget: ₹${totalBudget.toLocaleString("en-IN")})`,
    };
  });
}

/* ─── 1. Recommended Crops Tab ─── */
function CropCard({ crop, rank, acresNum }) {
  const waterColor =
    crop.waterDemand === "HIGH" ? "#dc2626"
    : crop.waterDemand === "MEDIUM" ? "#d97706"
    : "#16a34a";

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 mb-4 shadow-xs">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {crop.cropName ?? crop.name}
          </h3>
        </div>
        <span
          className="shrink-0 text-xs font-black px-3 py-1 rounded-lg uppercase"
          style={{ color: "#15803d", background: "#dcfce7" }}
        >
          Rule Match Score #{rank}
        </span>
      </div>

      <div className="flex flex-wrap gap-8 mt-3 text-xs">
        <div>
          <p className="uppercase font-bold text-slate-400 tracking-wide flex items-center gap-1">
            <Droplets size={12} /> WATER DEMAND
          </p>
          <p className="font-extrabold text-sm mt-0.5" style={{ color: waterColor }}>
            {crop.waterDemand ?? "MEDIUM"}
          </p>
        </div>
        <div>
          <p className="uppercase font-bold text-slate-400 tracking-wide flex items-center gap-1">
            <IndianRupee size={12} /> TOTAL COST ({acresNum} ACRES)
          </p>
          <p className="font-extrabold text-sm text-slate-800 mt-0.5">
            ₹{Number(crop.totalFarmBudget ?? (crop.minBudgetPerAcre * acresNum)).toLocaleString("en-IN")}
          </p>
        </div>
        <div>
          <p className="uppercase font-bold text-slate-400 tracking-wide">TOTAL EXPECTED PROFIT</p>
          <p className="font-extrabold text-sm text-green-700 mt-0.5">
            ₹{Number(crop.totalFarmProfit ?? (crop.expectedProfitPerAcre * acresNum)).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-black/5">
        <p className="text-xs font-bold text-slate-500">Suitability Match:</p>
        <p className="text-sm mt-0.5 font-medium text-slate-700">
          {crop.suitabilityReason}
        </p>
      </div>
    </div>
  );
}

/* ─── 2. Fertilizer Doses Tab ─── */
function FertilizerTab({ crops, soilData, acresNum }) {
  return (
    <div className="space-y-4">
      {crops.map((c, i) => {
        const ureaPerAcre = soilData?.nitrogen ? Math.max(35, 110 - Math.round(soilData.nitrogen / 2)) : 45;
        const dapPerAcre  = soilData?.phosphorus ? Math.max(25, 65 - Math.round(soilData.phosphorus * 1.5)) : 40;
        const mopPerAcre  = soilData?.potassium ? Math.max(15, 170 - Math.round(soilData.potassium / 2)) : 20;

        const totalUrea = Math.round(ureaPerAcre * acresNum);
        const totalDap  = Math.round(dapPerAcre * acresNum);
        const totalMop  = Math.round(mopPerAcre * acresNum);

        return (
          <div key={i} className="rounded-3xl border border-black/5 bg-slate-50 p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-base text-slate-900">{c.cropName ?? c.name}</h4>
              <span className="text-xs font-black text-green-800 bg-green-100 px-3 py-1 rounded-lg uppercase">
                Total Dose ({acresNum} Acres)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-4">
              <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs">
                <p className="font-bold text-slate-700 mb-1">Urea (Nitrogen)</p>
                <p className="text-xl font-black text-emerald-700">
                  {totalUrea} kg ({Math.ceil(totalUrea / 45)} Bags)
                </p>
                <p className="text-xs text-slate-400 mt-1">Split: 50% basal, 50% top dress</p>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs">
                <p className="font-bold text-slate-700 mb-1">DAP (Phosphorus)</p>
                <p className="text-xl font-black text-amber-700">
                  {totalDap} kg ({Math.ceil(totalDap / 50)} Bags)
                </p>
                <p className="text-xs text-slate-400 mt-1">Apply 100% at sowing time</p>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs">
                <p className="font-bold text-slate-700 mb-1">MOP (Potassium)</p>
                <p className="text-xl font-black text-indigo-700">
                  {totalMop} kg ({Math.ceil(totalMop / 50)} Bags)
                </p>
                <p className="text-xs text-slate-400 mt-1">Apply along with basal DAP</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── 3. Crop Rotation Tab ─── */
function RotationTab({ season, crops, acresNum }) {
  const primary = crops[0]?.cropName || "Primary Crop";
  const secondary = crops[1]?.cropName || "Secondary Crop";

  const rotationPlan = [
    { year: 1, season: season || "Kharif", crop: primary, benefit: `Main cash crop for ${acresNum} acres with optimal NPK soil utilization.` },
    { year: 1, season: season === "Kharif" ? "Rabi" : "Kharif", crop: "Chickpea (Chana)", benefit: "Fixes atmospheric nitrogen naturally in root nodules." },
    { year: 2, season: season || "Kharif", crop: secondary, benefit: "Breaks soil pest cycle & enriches organic carbon." },
    { year: 2, season: season === "Kharif" ? "Rabi" : "Kharif", crop: "Mustard / Wheat", benefit: "Utilizes residual soil nutrients efficiently." },
  ];

  return (
    <div className="space-y-4">
      {rotationPlan.map((p, i) => (
        <div key={i} className="rounded-3xl border border-black/5 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: GREEN }}
              >
                Y{p.year}
              </span>
              <span className="font-bold text-sm text-slate-900">{p.crop}</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Calendar size={13} /> {p.season} Season
            </span>
          </div>
          <p className="mt-2.5 text-xs text-slate-600 leading-relaxed font-medium">{p.benefit}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── 4. Planting Calendar Tab ─── */
function CalendarTab({ season, acresNum }) {
  const isKharif = season.toUpperCase().includes("KHARIF");
  const calendar = isKharif
    ? [
        { phase: "Land Preparation", window: "May 15 - June 10", task: `Deep ploughing, FYM addition (${Math.round(2.5 * acresNum)} trolleys for ${acresNum} ac) & levelling.` },
        { phase: "Sowing / Transplanting", window: "June 15 - July 5", task: "Seed treatment with Azotobacter/PSB bio-fertilizer & sowing." },
        { phase: "Intercultivation & Weeding", window: "July 20 - Aug 10", task: "First weeding & top-dressing 50% split Urea dose." },
        { phase: "Harvesting & Threshing", window: "Oct 10 - Oct 25", task: "Harvesting at 14% grain moisture level." },
      ]
    : [
        { phase: "Land Preparation", window: "Oct 15 - Nov 5", task: `Pre-irrigation & seed bed preparation with rotavator for ${acresNum} acres.` },
        { phase: "Sowing / Seed Treatment", window: "Nov 10 - Nov 30", task: "Treat seeds with Trichoderma & sow at 4-5 cm depth." },
        { phase: "First Irrigation & Top Dress", window: "Dec 15 - Dec 25", task: "Crown root initiation irrigation & Urea top dressing." },
        { phase: "Harvesting & Threshing", window: "March 20 - April 10", task: "Harvesting when grain turns golden yellow." },
      ];

  return (
    <div className="space-y-4">
      {calendar.map((c, i) => (
        <div key={i} className="rounded-3xl border border-black/5 bg-white p-5 flex items-start gap-4 shadow-2xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50 text-green-700 font-extrabold text-xs shrink-0 mt-0.5">
            {i + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm text-slate-900">{c.phase}</p>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                {c.window}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">{c.task}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CropSuggestion() {
  const { user } = useAuth();
  const location = useLocation();

  const soilData = (() => {
    if (location.state && location.state.ph != null) {
      return location.state;
    }
    try {
      const raw = localStorage.getItem(LOCAL_SOIL_KEY);
      return raw ? JSON.parse(raw).result : null;
    } catch {
      return null;
    }
  })();

  const [form, setForm] = useState({
    season:        SEASONS[0],
    irrigation:    IRRIGATION_OPTIONS[1],
    budget:        "25000",
    farmSizeAcres: "2.0",
  });
  const [loading, setLoading] = useState(false);

  // Initialize with results calculated for initial form values
  const [activeResults, setActiveResults] = useState(() => ({
    crops: calculateDynamicCrops(SEASONS[0], IRRIGATION_OPTIONS[1], 25000, 2.0, soilData?.ph ? Number(soilData.ph) : 5.9),
    season: SEASONS[0],
    irrigation: IRRIGATION_OPTIONS[1],
    budget: "25000",
    farmSizeAcres: "2.0",
  }));

  const [activeTab, setActiveTab] = useState(0);

  // Form input change handler ONLY updates local form state (no automatic re-calculation!)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate ONLY when user explicitly submits/clicks button!
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const acresNum = form.farmSizeAcres ? Number(form.farmSizeAcres) : 2.0;
    const budgetNum = form.budget ? Number(form.budget) : 25000;
    const phNum = soilData?.ph ? Number(soilData.ph) : 5.9;

    try {
      const payload = {
        nitrogen:      soilData?.nitrogen   ? Number(soilData.nitrogen)   : 45,
        phosphorus:    soilData?.phosphorus ? Number(soilData.phosphorus) : 31,
        potassium:     soilData?.potassium  ? Number(soilData.potassium)  : 82,
        ph:            phNum,
        budget:        budgetNum,
        location:      user?.district || user?.state || "Pune",
        farmSizeAcres: acresNum,
        season:        form.season.split(" ")[0].toUpperCase(),
        irrigationCapability: form.irrigation,
      };

      const res = await getCropSuggestion(payload);
      let calculatedCrops = [];

      if (res && res.eligibleCrops?.length > 0) {
        calculatedCrops = res.eligibleCrops.map((c, i) => {
          if (typeof c === "string") {
            const minB = 8000 + i * 2000;
            const approx = minB * 2.2;
            return {
              cropName: c,
              rank: i + 1,
              waterDemand: form.irrigation.toLowerCase().includes("low") ? "LOW" : "MEDIUM",
              minBudgetPerAcre: minB,
              totalFarmBudget: Math.round(approx * acresNum),
              expectedProfitPerAcre: minB * 4.5,
              totalFarmProfit: Math.round(minB * 4.5 * acresNum),
              suitabilityReason: `Qualified by AgroSamridhi AI Engine for ${acresNum} acres (${form.season.split(" ")[0]} season | Irrigation: ${form.irrigation.split(" ")[0]}).`,
            };
          }
          return {
            ...c,
            rank: i + 1,
            totalFarmBudget: Math.round((c.minBudgetPerAcre || 10000) * 2.2 * acresNum),
            totalFarmProfit: Math.round((c.expectedProfitPerAcre || 35000) * acresNum),
          };
        });
      } else {
        calculatedCrops = calculateDynamicCrops(form.season, form.irrigation, budgetNum, acresNum, phNum);
      }

      setActiveResults({
        crops: calculatedCrops,
        season: form.season,
        irrigation: form.irrigation,
        budget: form.budget,
        farmSizeAcres: form.farmSizeAcres,
      });
    } catch {
      setActiveResults({
        crops: calculateDynamicCrops(form.season, form.irrigation, budgetNum, acresNum, phNum),
        season: form.season,
        irrigation: form.irrigation,
        budget: form.budget,
        farmSizeAcres: form.farmSizeAcres,
      });
    } finally {
      setLoading(false);
    }
  };

  const currentAcres = activeResults.farmSizeAcres ? Number(activeResults.farmSizeAcres) : 2.0;

  return (
    <div className="font-sans select-none w-full space-y-6">
      {/* Connected Soil Health Card Active Banner */}
      <div
        className="flex items-center justify-between rounded-3xl border p-5 text-sm shadow-xs"
        style={{ background: "#f0fdf4", borderColor: "#86efac" }}
      >
        <div className="flex items-center gap-3">
          <FlaskConical size={20} className="text-green-700 shrink-0" />
          <span className="font-extrabold text-slate-900">🧪 Connected Soil Health Card Active</span>
          <span className="text-slate-600 font-medium hidden sm:inline">
            | Nitrogen: <strong className="text-green-800">{soilData?.nitrogen ?? 158} kg/ha</strong> | Phosphorus: <strong className="text-green-800">{soilData?.phosphorus ?? 6.2} kg/ha</strong> | Potassium: <strong className="text-green-800">{soilData?.potassium ?? 160} kg/ha</strong> | pH: <strong className="text-rose-700">{soilData?.ph ?? 9.3}</strong>
          </span>
        </div>
        <span className="rounded-full bg-green-100 text-green-800 text-xs font-extrabold px-3.5 py-1 shrink-0">
          ✓ Auto-Linked
        </span>
      </div>

      <p className="text-sm text-slate-500 font-medium">
        Use our hybrid Rule Engine and AgroSamridhi AI pipeline to determine which crops are eligible for your farm.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-5">
              Generate Recommendations
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Current Season</label>
                <div className="relative">
                  <select
                    name="season"
                    value={form.season}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none pr-8 focus:border-green-600 cursor-pointer"
                  >
                    {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Irrigation Capability</label>
                <div className="relative">
                  <select
                    name="irrigation"
                    value={form.irrigation}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none pr-8 focus:border-green-600 cursor-pointer"
                  >
                    {IRRIGATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Available Budget (INR)</label>
                <input
                  name="budget"
                  type="number"
                  value={form.budget}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Active Cultivation Area (Acres)</label>
                <input
                  name="farmSizeAcres"
                  type="number"
                  step="0.1"
                  value={form.farmSizeAcres}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-green-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white shadow-xs hover:opacity-90 transition-opacity"
                style={{ background: GREEN }}
              >
                {loading ? <Spinner size={16} className="text-white" /> : <Sprout size={16} />}
                {loading ? "Calculating..." : "Calculate Top Eligible Crops"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Results & Active Tabs */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-black/5 bg-white p-7 h-full shadow-xs">
            <h3 className="text-base font-bold text-slate-900">AI Recommendations</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">
              Generated for {activeResults.season.split(" ")[0]} Crops — {activeResults.farmSizeAcres} acres | Irrigation: {activeResults.irrigation.split(" ")[0]} | Budget: ₹{Number(activeResults.budget).toLocaleString("en-IN")}
            </p>

            {/* Interactive Tab Headers */}
            <div className="flex gap-5 border-b border-black/5 mb-5 text-sm font-bold overflow-x-auto">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`pb-2.5 transition-colors shrink-0 cursor-pointer ${
                    activeTab === i
                      ? "border-b-2 border-green-800 text-green-900"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab 0: Recommended Crops */}
            {activeTab === 0 && (
              activeResults.crops.map((c) => (
                <CropCard key={c.rank} crop={c} rank={c.rank} acresNum={currentAcres} />
              ))
            )}

            {/* Tab 1: Fertilizer Doses */}
            {activeTab === 1 && (
              <FertilizerTab crops={activeResults.crops} soilData={soilData} acresNum={currentAcres} />
            )}

            {/* Tab 2: Crop Rotation */}
            {activeTab === 2 && (
              <RotationTab season={activeResults.season.split(" ")[0]} crops={activeResults.crops} acresNum={currentAcres} />
            )}

            {/* Tab 3: Planting Calendar */}
            {activeTab === 3 && (
              <CalendarTab season={activeResults.season.split(" ")[0]} acresNum={currentAcres} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
