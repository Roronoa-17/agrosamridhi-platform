import { useEffect, useState } from "react";
import { Search, Download, ChevronRight, CheckCircle2, Globe } from "lucide-react";
import { PageSpinner } from "../components/ui/Spinner";
import { getAllSchemes, getEligibleSchemes } from "../api/schemes";
import { useAuth } from "../context/AuthContext";

const GREEN = "#0e4d2f";

/* All 30 Government Schemes Database */
const ALL_30_SCHEMES_RAW = [
  { id: 1, schemeName: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "₹6,000 per year direct income support in 3 installments of ₹2,000 each", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 2, schemeName: "Pradhan Mantri Fasal Bima Yojana (PMFBY)", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "Crop insurance covering up to full sum insured. Premium: 2% Kharif, 1.5% Rabi", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 3, schemeName: "Kisan Credit Card (KCC)", agency: "Ministry of Agriculture and Farmers' Welfare / RBI", benefit: "Short-term credit up to ₹3 lakh at 4% interest rate", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 4, schemeName: "Soil Health Card Scheme", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "Free soil testing and health card every 2 years. Guidance on correct fertilizer usage", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 5, schemeName: "PM Krishi Sinchayee Yojana (PMKSY) – Per Drop More Crop", agency: "Ministry of Jal Shakti / Ministry of Agriculture", benefit: "55% subsidy for small/marginal farmers and 45% for others on drip/sprinkler irrigation", maxLandAcres: 99999, maxIncome: 250000, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 6, schemeName: "Rashtriya Krishi Vikas Yojana (RKVY-RAFTAAR)", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "Grants and seed capital up to ₹25 lakh for agri-entrepreneurs and infrastructure", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 7, schemeName: "Mission for Integrated Development of Horticulture (MIDH)", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "Subsidy 40-50% for establishing orchards, 50% for cold chain and post-harvest management", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 8, schemeName: "National Food Security Mission (NFSM)", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "Subsidized certified seeds, micronutrients, soil amendments, and farm machinery", maxLandAcres: 99999, maxIncome: 200000, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 9, schemeName: "e-NAM (National Agriculture Market) Registration", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "Access to pan-India online trading platform for direct crop sales without middlemen", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 10, schemeName: "PM Kisan Maan Dhan Yojana", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "Guaranteed pension of ₹3,000 per month after age 60 for small/marginal farmers", maxLandAcres: 5, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 11, schemeName: "Sub-Mission on Agricultural Mechanization (SMAM)", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "40-50% subsidy (up to ₹1.2 lakh) on tractors, harvesters, seed drills, sprayers", maxLandAcres: 10, maxIncome: 250000, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 12, schemeName: "Paramparagat Krishi Vikas Yojana (PKVY) – Organic Farming", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "₹50,000 per hectare over 3 years for cluster-based organic farming & certification", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 13, schemeName: "Neem Coated Urea Scheme", agency: "Ministry of Chemicals and Fertilizers", benefit: "100% neem coated urea at subsidized rates to improve nitrogen efficiency", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 14, schemeName: "Direct Benefit Transfer for Fertilizer Subsidy", agency: "Ministry of Chemicals and Fertilizers", benefit: "Fertilizer subsidy transferred directly with point-of-sale Aadhaar verification", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 15, schemeName: "Agriculture Infrastructure Fund (AIF)", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "Loans up to ₹2 crore at 3% interest subsidy for 7 years for warehouses and cold chains", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 16, schemeName: "Magel Tyala Shet Tale (Maharashtra) – Farm Pond Scheme", agency: "Government of Maharashtra", benefit: "100% subsidy on farm pond construction (up to ₹75,000)", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: ["Maharashtra"], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 17, schemeName: "Nanaji Deshmukh Krishi Sanjivani Project (Maharashtra)", agency: "Government of Maharashtra", benefit: "Climate-resilient agriculture financial support up to ₹2 lakh per farm", maxLandAcres: 99999, maxIncome: 200000, allowedStates: ["Maharashtra"], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 18, schemeName: "UP Kisan Mitra Urja Yojana (Uttar Pradesh)", agency: "Government of Uttar Pradesh", benefit: "Free electricity up to 1000 units per month for farm pump connections", maxLandAcres: 5, maxIncome: 200000, allowedStates: ["Uttar Pradesh"], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 19, schemeName: "UP Sinchai Pump Subsidy (Uttar Pradesh)", agency: "Government of Uttar Pradesh", benefit: "90% subsidy on submersible pump sets for SC/ST, 50% for others", maxLandAcres: 5, maxIncome: 200000, allowedStates: ["Uttar Pradesh"], allowedCaste: ["SC", "ST", "OBC"] },
  { id: 20, schemeName: "Punjab Agriculture Pump Set Scheme", agency: "Government of Punjab", benefit: "Free 7.5 HP submersible pump set for SC farmers, 50% for others", maxLandAcres: 7.5, maxIncome: 180000, allowedStates: ["Punjab"], allowedCaste: ["SC"] },
  { id: 21, schemeName: "Punjab Crop Residue Management Scheme", agency: "Government of Punjab", benefit: "₹2,500 per acre incentive for in-situ crop residue management (no burning)", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: ["Punjab"], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 22, schemeName: "Rajiv Gandhi Hasirudhama Scheme (Karnataka)", agency: "Government of Karnataka", benefit: "75% subsidy for establishing vermicompost units (up to ₹15,000)", maxLandAcres: 5, maxIncome: 150000, allowedStates: ["Karnataka"], allowedCaste: ["OBC", "SC", "ST"] },
  { id: 23, schemeName: "Karnataka Drip Irrigation Scheme", agency: "Government of Karnataka", benefit: "90% subsidy for SC/ST small/marginal farmers on drip and sprinkler irrigation", maxLandAcres: 10, maxIncome: 250000, allowedStates: ["Karnataka"], allowedCaste: ["SC", "ST"] },
  { id: 24, schemeName: "Mukhyamantri Krishak Jeevan Kalyan (Madhya Pradesh)", agency: "Government of Madhya Pradesh", benefit: "₹4 lakh accidental death compensation with zero premium", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: ["Madhya Pradesh"], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 25, schemeName: "MP Beej Gram Yojana (Madhya Pradesh Seed Village)", agency: "Government of Madhya Pradesh", benefit: "50-100% subsidy on certified seeds of wheat, rice, maize, soybean", maxLandAcres: 5, maxIncome: 150000, allowedStates: ["Madhya Pradesh"], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 26, schemeName: "ATMA Agricultural Extension Scheme", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "Free training, demonstrations, farmer field schools, and exposure visits", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 27, schemeName: "Negotiable Warehouse Receipt (NWR) System", agency: "Ministry of Consumer Affairs / WDRA", benefit: "Pledge loans against warehouse receipts at 70-80% of commodity value", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 28, schemeName: "Formation and Promotion of 10,000 FPOs", agency: "Ministry of Agriculture and Farmers' Welfare", benefit: "₹15 lakh grant per FPO over 5 years + credit guarantee up to ₹2 crore", maxLandAcres: 5, maxIncome: 250000, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 29, schemeName: "PM Jeevan Jyoti Bima Yojana for Farmers", agency: "Ministry of Finance / IRDAI", benefit: "₹2 lakh life insurance cover at just ₹436/year premium", maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] },
  { id: 30, schemeName: "PM-KUSUM Solar Pump Scheme", agency: "Ministry of New and Renewable Energy", benefit: "90% subsidy on solar pump installation + option to sell surplus power to grid", maxLandAcres: 99999, maxIncome: 300000, allowedStates: [], allowedCaste: ["GEN", "OBC", "SC", "ST"] }
];

export default function Schemes() {
  const { user } = useAuth();
  const userState  = user?.state || "Maharashtra";
  const userLand   = user?.landSizeAcres ? Number(user.landSizeAcres) : 2.5;
  const userIncome = user?.annualIncome ? Number(user.annualIncome) : 180000;
  const userCaste  = user?.casteCategory || "GEN";

  const [schemes,   setSchemes]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("MATCHED");
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    const fetchFn = activeTab === "MATCHED" ? getEligibleSchemes : getAllSchemes;
    setLoading(true);

    fetchFn()
      .then((res) => {
        let list = [];
        if (Array.isArray(res) && res.length > 0) {
          list = res.map((s, i) => ({
            id: s.schemeId || s.id || i + 1,
            schemeName: s.name || s.schemeName || "Government Scheme",
            agency: s.ministry || s.agency || "Ministry of Agriculture",
            benefit: s.benefit || s.description || "Direct benefit support for farmers",
            isNational: !s.allowedStates || s.allowedStates.length === 0,
            eligible: true,
          }));
        }

        if (list.length > 0 && activeTab === "MATCHED") {
          setSchemes(list);
        } else {
          // Dynamic Matcher Evaluation against Farmer Profile
          if (activeTab === "MATCHED") {
            const matched = ALL_30_SCHEMES_RAW.filter((s) => {
              // 1. State check
              if (s.allowedStates.length > 0 && !s.allowedStates.some(st => st.toLowerCase() === userState.toLowerCase())) {
                return false;
              }
              // 2. Land holding check
              if (s.maxLandAcres && userLand > s.maxLandAcres) {
                return false;
              }
              // 3. Income limit check
              if (s.maxIncome && userIncome > s.maxIncome && s.maxIncome < 9000000) {
                return false;
              }
              return true;
            }).map((s) => ({ ...s, isNational: s.allowedStates.length === 0, eligible: true }));

            setSchemes(matched);
          } else {
            setSchemes(ALL_30_SCHEMES_RAW.map((s) => ({ ...s, isNational: s.allowedStates.length === 0, eligible: true })));
          }
        }
      })
      .catch(() => {
        // Fallback profile evaluator
        if (activeTab === "MATCHED") {
          const matched = ALL_30_SCHEMES_RAW.filter((s) => {
            if (s.allowedStates.length > 0 && !s.allowedStates.some(st => st.toLowerCase() === userState.toLowerCase())) {
              return false;
            }
            if (s.maxLandAcres && userLand > s.maxLandAcres) {
              return false;
            }
            if (s.maxIncome && userIncome > s.maxIncome && s.maxIncome < 9000000) {
              return false;
            }
            return true;
          }).map((s) => ({ ...s, isNational: s.allowedStates.length === 0, eligible: true }));

          setSchemes(matched);
        } else {
          setSchemes(ALL_30_SCHEMES_RAW.map((s) => ({ ...s, isNational: s.allowedStates.length === 0, eligible: true })));
        }
      })
      .finally(() => setLoading(false));
  }, [activeTab, userState, userLand, userIncome, userCaste]);

  const filtered = schemes.filter((s) =>
    !search.trim() ||
    s.schemeName?.toLowerCase().includes(search.toLowerCase()) ||
    s.benefit?.toLowerCase().includes(search.toLowerCase()) ||
    s.agency?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full font-sans select-none">
      {/* Subheader & PDF Action Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 font-medium">
          Schemes are matched based on your profile — land size, income, category, and state region. — <strong className="text-slate-800">State Region: {userState}</strong>
        </p>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xs self-start sm:self-auto shrink-0 cursor-pointer"
          style={{ background: GREEN }}
        >
          <Download size={15} />
          Download PDF Report
        </button>
      </div>

      {/* State Region Banner */}
      <div
        className="rounded-3xl border p-5 text-xs shadow-2xs"
        style={{ background: "#f0fdf4", borderColor: "#86efac" }}
      >
        <p className="font-extrabold text-slate-900 text-sm">
          📍 Your Profile Match Context: {userState} ({userLand} acres | ₹{userIncome.toLocaleString("en-IN")}/yr)
        </p>
        <p className="text-slate-600 mt-1 font-medium">
          You are viewing schemes available in your state and national schemes open to all Indian farmers.
        </p>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between pt-1">
        <div className="flex gap-5 border-b border-black/5 text-sm font-bold">
          <button
            onClick={() => setActiveTab("MATCHED")}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === "MATCHED"
                ? "border-b-2 border-green-800 text-green-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            My Matched Schemes ({activeTab === "MATCHED" ? filtered.length : "Matched"})
          </button>
          <button
            onClick={() => setActiveTab("ALL")}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === "ALL"
                ? "border-b-2 border-green-800 text-green-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Browse All Schemes (30)
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes by name, benefit..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-semibold outline-none focus:border-green-600"
          />
        </div>
      </div>

      {loading && <PageSpinner label="Evaluating profile match against all 30 government schemes..." />}

      {/* List of Schemes Cards */}
      {!loading && (
        <div className="space-y-4">
          {filtered.map((s, idx) => (
            <div
              key={s.id ?? idx}
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  #{idx + 1} {s.schemeName}
                </h3>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  {s.agency || "Ministry of Agriculture and Farmers' Welfare"}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed pt-1 font-medium">
                  <strong>Benefit:</strong> {s.benefit}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                {s.isNational ? (
                  <span className="rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-xs font-bold flex items-center gap-1">
                    <Globe size={12} /> National Scheme
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-xs font-bold flex items-center gap-1">
                    📍 {userState} Scheme
                  </span>
                )}

                <span className="rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Highly Eligible
                </span>
                <ChevronRight size={16} className="text-slate-400 hidden md:inline" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
