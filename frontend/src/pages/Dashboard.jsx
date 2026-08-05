import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { fetchMandiPrices } from "../api/mandi";
import { fetchWeather, getDistrictFallbackWeather } from "../api/weather";
import { useAuth } from "../context/AuthContext";

const GREEN = "#0e4d2f";
const LOCAL_SOIL_KEY = "agrosamridhi_latest_soil_ocr";
const LOCAL_PEST_KEY = "agrosamridhi_latest_pest_diagnosis";

/* All 30 Government Schemes Database */
const ALL_30_SCHEMES_RAW = [
  { id: 1, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 2, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 3, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 4, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 5, maxLandAcres: 99999, maxIncome: 250000, allowedStates: [] },
  { id: 6, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 7, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 8, maxLandAcres: 99999, maxIncome: 200000, allowedStates: [] },
  { id: 9, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 10, maxLandAcres: 5, maxIncome: 9999999, allowedStates: [] },
  { id: 11, maxLandAcres: 10, maxIncome: 250000, allowedStates: [] },
  { id: 12, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 13, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 14, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 15, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 16, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: ["Maharashtra"] },
  { id: 17, maxLandAcres: 99999, maxIncome: 200000, allowedStates: ["Maharashtra"] },
  { id: 18, maxLandAcres: 5, maxIncome: 200000, allowedStates: ["Uttar Pradesh"] },
  { id: 19, maxLandAcres: 5, maxIncome: 200000, allowedStates: ["Uttar Pradesh"] },
  { id: 20, maxLandAcres: 7.5, maxIncome: 180000, allowedStates: ["Punjab"] },
  { id: 21, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: ["Punjab"] },
  { id: 22, maxLandAcres: 5, maxIncome: 150000, allowedStates: ["Karnataka"] },
  { id: 23, maxLandAcres: 10, maxIncome: 250000, allowedStates: ["Karnataka"] },
  { id: 24, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: ["Madhya Pradesh"] },
  { id: 25, maxLandAcres: 5, maxIncome: 150000, allowedStates: ["Madhya Pradesh"] },
  { id: 26, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 27, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 28, maxLandAcres: 5, maxIncome: 250000, allowedStates: [] },
  { id: 29, maxLandAcres: 99999, maxIncome: 9999999, allowedStates: [] },
  { id: 30, maxLandAcres: 99999, maxIncome: 300000, allowedStates: [] }
];

function getFarmerCropMandiRates(crop, city, state) {
  const cropLower = (crop || "Sugarcane").toLowerCase();

  if (cropLower.includes("cotton") || cropLower.includes("kapas")) {
    return [
      { market: `${city} APMC`, commodity: "Cotton (Long Staple)", modalPrice: 7450, trend: "+₹180/qtl" },
      { market: "Akola Mandi", commodity: "Cotton (Medium Staple)", modalPrice: 7120, trend: "+₹90/qtl" },
      { market: "Yavatmal APMC", commodity: "Cotton (Shankar-6)", modalPrice: 7300, trend: "Stable" },
      { market: "Nagpur Market", commodity: "Cotton (Raw Kapas)", modalPrice: 6980, trend: "+₹120/qtl" },
    ];
  }
  if (cropLower.includes("rice") || cropLower.includes("paddy") || cropLower.includes("chawal")) {
    return [
      { market: `${city} APMC`, commodity: "Rice (Basmati 1509)", modalPrice: 4250, trend: "+₹110/qtl" },
      { market: "Gondia Mandi", commodity: "Rice (Wada Kolam)", modalPrice: 3950, trend: "+₹70/qtl" },
      { market: "Bhandara Yard", commodity: "Rice (Indrayani)", modalPrice: 3820, trend: "Stable" },
      { market: "Chandrapur Market", commodity: "Rice (Raw Paddy)", modalPrice: 2380, trend: "+₹50/qtl" },
    ];
  }
  if (cropLower.includes("wheat") || cropLower.includes("gehun")) {
    return [
      { market: `${city} APMC`, commodity: "Wheat (Sharbati)", modalPrice: 3250, trend: "+₹90/qtl" },
      { market: "Nashik Mandi", commodity: "Wheat (Lokwan)", modalPrice: 2890, trend: "+₹40/qtl" },
      { market: "Dhule Yard", commodity: "Wheat (Mill Quality)", modalPrice: 2650, trend: "Stable" },
      { market: "Jalgaon Market", commodity: "Wheat (Durum)", modalPrice: 3100, trend: "+₹60/qtl" },
    ];
  }
  if (cropLower.includes("onion") || cropLower.includes("kanda")) {
    return [
      { market: `${city} APMC`, commodity: "Onion (Red Onion)", modalPrice: 2450, trend: "+₹150/qtl" },
      { market: "Lasalgaon Mandi", commodity: "Onion (Garwa Quality)", modalPrice: 2680, trend: "+₹210/qtl" },
      { market: "Pimpalgaon Yard", commodity: "Onion (Summer)", modalPrice: 2520, trend: "+₹90/qtl" },
      { market: "Solapur APMC", commodity: "Onion (Medium)", modalPrice: 2310, trend: "Stable" },
    ];
  }
  if (cropLower.includes("tomato") || cropLower.includes("tamatar")) {
    return [
      { market: `${city} APMC`, commodity: "Tomato (Hybrid Red)", modalPrice: 2250, trend: "+₹120/qtl" },
      { market: "Narayangaon Mandi", commodity: "Tomato (Desi)", modalPrice: 2480, trend: "+₹180/qtl" },
      { market: "Pimpalgaon APMC", commodity: "Tomato (Grade A)", modalPrice: 2320, trend: "+₹60/qtl" },
      { market: "Nashik Market", commodity: "Tomato (Commercial)", modalPrice: 2150, trend: "Stable" },
    ];
  }
  if (cropLower.includes("potato") || cropLower.includes("aloo")) {
    return [
      { market: `${city} APMC`, commodity: "Potato (Jyoti)", modalPrice: 1750, trend: "+₹80/qtl" },
      { market: "Manchar Mandi", commodity: "Potato (Kufri Pukhraj)", modalPrice: 1890, trend: "+₹110/qtl" },
      { market: "Satara APMC", commodity: "Potato (Chips Quality)", modalPrice: 1950, trend: "+₹50/qtl" },
      { market: "Pune Market", commodity: "Potato (Standard)", modalPrice: 1680, trend: "Stable" },
    ];
  }

  // Sugarcane and default fallback for farmer's primary crop
  return [
    { market: `${city} APMC`, commodity: `${crop} (Grade A)`, modalPrice: 3480, trend: "+₹120/qtl" },
    { market: "Dhule Yard", commodity: `${crop} (Commercial)`, modalPrice: 3550, trend: "+₹150/qtl" },
    { market: "Nashik Mandi", commodity: `${crop} (High Quality)`, modalPrice: 3620, trend: "Stable" },
    { market: "Jalgaon Market", commodity: `${crop} (Standard)`, modalPrice: 3390, trend: "+₹80/qtl" },
  ];
}

export default function Dashboard() {
  const { user } = useAuth();
  const userCity  = user?.district || user?.state || "Dhule";
  const userState = user?.state || "Maharashtra";
  const userLand  = user?.landSizeAcres ? Number(user.landSizeAcres) : 2.5;
  const userIncome = user?.annualIncome ? Number(user.annualIncome) : 180000;
  const userCrop   = user?.primaryCrop || "Sugarcane";

  const [weatherData, setWeatherData] = useState(() => getDistrictFallbackWeather(userCity));
  const [mandiPrices, setMandiPrices] = useState([]);
  const [activeScore, setActiveScore] = useState(20);
  const [activeQual, setActiveQual]   = useState("POOR QUALITY");
  const [pestStatus, setPestStatus]   = useState({ disease: "Pink Bollworm", severity: "HIGH SEVERITY" });

  useEffect(() => {
    try {
      const savedSoil = localStorage.getItem(LOCAL_SOIL_KEY);
      if (savedSoil) {
        const parsed = JSON.parse(savedSoil);
        if (parsed?.result?.score) setActiveScore(parsed.result.score);
        if (parsed?.result?.quality) setActiveQual(parsed.result.quality);
      }
    } catch {
      /* ignore */
    }

    try {
      const savedPest = localStorage.getItem(LOCAL_PEST_KEY);
      if (savedPest) {
        const parsed = JSON.parse(savedPest);
        if (parsed?.result?.diseaseName) {
          setPestStatus({
            disease: parsed.result.diseaseName.split("(")[0].trim(),
            severity: `${parsed.result.severity || "HIGH"} SEVERITY`,
          });
        }
      }
    } catch {
      /* ignore */
    }

    Promise.allSettled([
      fetchWeather(userCity),
      fetchMandiPrices({ state: userState, commodity: userCrop }),
    ]).then(([wRes, mRes]) => {
      if (wRes.status === "fulfilled" && wRes.value) {
        setWeatherData(wRes.value);
      } else {
        setWeatherData(getDistrictFallbackWeather(userCity));
      }

      if (mRes.status === "fulfilled" && Array.isArray(mRes.value) && mRes.value.length > 0) {
        const filteredByCrop = mRes.value.filter((r) =>
          r.commodity?.toLowerCase().includes(userCrop.toLowerCase())
        );
        if (filteredByCrop.length > 0) {
          setMandiPrices(filteredByCrop.slice(0, 5));
        } else {
          setMandiPrices(getFarmerCropMandiRates(userCrop, userCity, userState));
        }
      } else {
        setMandiPrices(getFarmerCropMandiRates(userCrop, userCity, userState));
      }
    });
  }, [userCity, userState, userCrop]);

  const matchedSchemesCount = ALL_30_SCHEMES_RAW.filter((s) => {
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
  }).length;

  return (
    <div className="space-y-6 w-full font-sans select-none">
      {/* 🚀 Top Banner Hero Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 rounded-3xl p-7 text-white shadow-lg" style={{ background: GREEN }}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-700/60 px-3 py-1 text-xs font-bold text-emerald-200">
              Kharif Season Active
            </span>
            <span className="text-xs text-emerald-200 font-semibold">📍 {userState} • {userCity}</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || "Farmer"}!
          </h2>
          <p className="text-sm text-emerald-100/90 font-medium max-w-2xl leading-relaxed">
            Your unified AI command center for soil health card scanning, crop suitability calculation, Agmarknet mandi market trends, and government scheme eligibility.
          </p>
        </div>

        <Link
          to="/ai/crop-suggestion"
          className="flex items-center gap-2.5 rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-md hover:bg-amber-300 transition-colors shrink-0"
        >
          <span>Calculate Top Crops</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* 🌤️ Grid 1: Weather & Mandi Real-time Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                🌤️ Live Local Weather
              </h3>
              <span className="text-xs text-slate-400 font-bold">{userCity}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-5xl font-black text-slate-900">
                  {weatherData?.temp ?? 32}°C
                </p>
                <p className="text-xs font-extrabold text-slate-500 mt-1">
                  {weatherData?.condition ?? "Sunny • Humidity 58%"}
                </p>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-amber-50 flex items-center justify-center text-4xl text-amber-500 shadow-2xs">
                ⛅
              </div>
            </div>
          </div>

          {/* Weather Advisory with Increased Font Size & Enhanced Styling */}
          <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100 text-slate-800 space-y-1">
            <p className="font-black text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              🌾 Agronomic Advisory:
            </p>
            <p className="text-sm font-semibold leading-relaxed text-slate-700">
              Optimal sunny conditions for farm intercultural operations in {userCity} ({weatherData?.temp ?? 32}°C). Keep crop irrigation scheduled in afternoon.
            </p>
          </div>
        </div>

        {/* Mandi Prices Feed Card */}
        <div className="lg:col-span-2 rounded-3xl border border-black/5 bg-white p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                📈 Mandi Prices: {userCrop} ({userState})
              </h3>
              <p className="text-xs text-emerald-800 font-extrabold mt-0.5">
                Registered Profile Crop: {userCrop}
              </p>
            </div>
            <Link to="/mandi" className="text-xs font-extrabold text-emerald-700 hover:underline flex items-center gap-1">
              View All Mandis <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {mandiPrices.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <p className="font-black text-slate-900 text-sm md:text-base">{item.commodity}</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">{item.market}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-base md:text-lg">₹{item.modalPrice}/qtl</p>
                  <span className="text-xs font-black text-emerald-700">{item.trend || "+3.2%"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 Bottom 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Soil Health Card Score */}
        <Link to="/ai/soil-card" className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-xs hover:shadow-md transition-all">
          <div className="text-3xl mb-2">🧪</div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Soil Health Card Score</p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {activeScore}<span className="text-base font-semibold text-slate-400">/100</span>
          </p>
          <span className="mt-3 inline-block rounded-full bg-[#fee2e2] text-[#dc2626] px-4 py-1 text-xs font-black uppercase">
            {activeQual}
          </span>
        </Link>

        {/* 2. Eligible Crop Recommendations */}
        <Link to="/ai/crop-suggestion" className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-xs hover:shadow-md transition-all">
          <div className="text-3xl mb-2">🌾</div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eligible Crop Recommendations</p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            3 Crops
          </p>
          <span className="mt-3 inline-block rounded-full bg-[#dcfce7] text-[#15803d] px-4 py-1 text-xs font-black uppercase">
            KHARIF CURRENT SEASON
          </span>
        </Link>

        {/* 3. Govt Schemes (Matching Profile Count) */}
        <Link to="/schemes" className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-xs hover:shadow-md transition-all">
          <div className="text-3xl mb-2">📜</div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Govt Schemes</p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            30 Schemes
          </p>
          <p className="mt-3 text-xs font-black text-[#15803d] uppercase tracking-wide">
            {matchedSchemesCount} HIGHLY ELIGIBLE
          </p>
        </Link>

        {/* 4. Pest Diagnosis Status */}
        <Link to="/ai/pest-diagnosis" className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-xs hover:shadow-md transition-all">
          <div className="text-3xl mb-2">🐛</div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pest Diagnosis Status</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {pestStatus.disease}
          </p>
          <span className="mt-3 inline-block rounded-full bg-[#fef3c7] text-[#d97706] px-4 py-1 text-xs font-black uppercase">
            {pestStatus.severity}
          </span>
        </Link>
      </div>
    </div>
  );
}
