import { useEffect, useState } from "react";
import {
  CloudRain,
  MapPin,
  Umbrella,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Sun,
} from "lucide-react";
import { PageSpinner } from "../components/ui/Spinner";
import { getCurrentWeather, getWeatherAdvisory, getDistrictFallbackWeather } from "../api/weather";
import { useAuth } from "../context/AuthContext";

const GREEN = "#0e4d2f";

export default function Weather() {
  const { user } = useAuth();
  const userCity = user?.district || "Dhule";
  const userLoc  = user?.district && user?.state ? `${user.district}, ${user.state}` : `${userCity}, Maharashtra`;

  const [weather, setWeather]       = useState(() => getDistrictFallbackWeather(userCity));
  const [backendAdv, setBackendAdv] = useState("");
  const [loading, setLoading]       = useState(true);
  const [activeDay, setActiveDay]   = useState(0);

  const initialDistWeather = getDistrictFallbackWeather(userCity);

  const defaultForecast = [
    {
      day: "TODAY",
      condition: initialDistWeather.condition || "Sunny",
      max: initialDistWeather.temp ?? 32,
      min: initialDistWeather.minTemp ?? 24,
      rain: `${initialDistWeather.rainfall ?? 0.0} mm`,
      wind: `${initialDistWeather.windSpeed ?? 16} km/h`,
      humidity: `${initialDistWeather.humidity ?? 58}.0%`,
      status: "✓ Field Work OK",
      isStay: false,
      overallAdvisory: `Optimal sunny conditions for farm intercultural operations in ${userCity} (${initialDistWeather.temp ?? 32}°C). Keep crop irrigation scheduled in afternoon.`,
      advisories: [
        { id: 1, icon: CheckCircle2, color: "#16a34a", title: "Fertilizer Top-Dressing", text: `Optimal sunny weather (${initialDistWeather.temp ?? 32}°C). Ideal for applying NPK or Urea top-dressing to Kharif crops.` },
        { id: 2, icon: Wind, color: "#d97706", title: "Moderate Breeze", text: `Wind speed ${initialDistWeather.windSpeed ?? 16} km/h. Suitable for foliar bio-pesticide spraying during early morning hours.` },
        { id: 3, icon: Droplets, color: "#2563eb", title: "Humidity Monitor", text: `Humidity at ${initialDistWeather.humidity ?? 58}%. Optimal condition for active crop transpiration.` },
        { id: 4, icon: CloudRain, color: "#0284c7", title: "Irrigation Scheduling", text: "No immediate heavy rain. Maintain regular drip irrigation schedule for high-value crops." },
        { id: 5, icon: CheckCircle2, color: "#16a34a", title: "Field Operations", text: "All field intercultural operations, weeding, and hoeing green-lit for today." },
      ],
    },
    {
      day: "TOMORROW",
      condition: "Partly Sunny",
      max: (initialDistWeather.temp ?? 32) - 2,
      min: 23,
      rain: "1.2 mm",
      wind: "18 km/h",
      humidity: "62.0%",
      status: "✓ Field Work OK",
      isStay: false,
      overallAdvisory: `Favorable warm weather expected tomorrow (${(initialDistWeather.temp ?? 32) - 2}°C). Ideal for fertilizer top-dressing and field weeding.`,
      advisories: [
        { id: 1, icon: CheckCircle2, color: "#16a34a", title: "Foliar Spraying Approved", text: "Favorable conditions. Early morning bio-pesticide spraying recommended." },
        { id: 2, icon: Wind, color: "#d97706", title: "Gentle Wind", text: "Wind speed 18 km/h. Good for pest trap installations." },
        { id: 3, icon: Droplets, color: "#2563eb", title: "Moisture Level", text: "Soil moisture stable. Light drip irrigation required." },
        { id: 4, icon: CloudRain, color: "#0284c7", title: "Intercultural Hoeing", text: "Soil conditions suitable for manual weeding and hoeing." },
        { id: 5, icon: CheckCircle2, color: "#16a34a", title: "Farm Maintenance", text: "Clear field channels and inspect drip lateral lines." },
      ],
    },
    {
      day: "TUE",
      condition: "Light Rain",
      max: 29,
      min: 23,
      rain: "4.6 mm",
      wind: "20 km/h",
      humidity: "78.0%",
      status: "✓ Field Work OK",
      isStay: false,
      overallAdvisory: "Light showers expected (4.6 mm). Great for soil moisture retention without causing field waterlogging.",
      advisories: [
        { id: 1, icon: Umbrella, color: "#7c3aed", title: "Light Rain Caution", text: "Light rain (4.6 mm). Hold off on heavy chemical sprays." },
        { id: 2, icon: Wind, color: "#d97706", title: "Breeze Watch", text: "Wind speed 20 km/h. Secure nursery nets." },
        { id: 3, icon: Droplets, color: "#2563eb", title: "Pest Scouting", text: "Moist conditions favor sucking pests. Inspect crop whorls." },
        { id: 4, icon: CheckCircle2, color: "#16a34a", title: "Hand Weeding", text: "Moist soil facilitates easy hand weeding." },
        { id: 5, icon: AlertTriangle, color: "#dc2626", title: "Irrigation Pause", text: "Pause automated drip irrigation for today." },
      ],
    },
    {
      day: "WED",
      condition: "Sunny",
      max: 33,
      min: 24,
      rain: "0.0 mm",
      wind: "15 km/h",
      humidity: "55.0%",
      status: "✓ Field Work OK",
      isStay: false,
      overallAdvisory: "Clear sunny day (33°C). Excellent for solar drying of farm produce and deep field tillage.",
      advisories: [
        { id: 1, icon: CheckCircle2, color: "#16a34a", title: "Field Operations Approved", text: "Clear sunny skies. All field activities green-lit." },
        { id: 2, icon: Sun, color: "#d97706", title: "Solar Drying", text: "Ideal conditions for drying harvested grains and oilseeds." },
        { id: 3, icon: Droplets, color: "#2563eb", title: "Drip Fertigation", text: "Apply recommended water-soluble fertigation." },
        { id: 4, icon: Wind, color: "#0284c7", title: "Spray Window", text: "Pesticide spraying approved from 6 AM to 10 AM." },
        { id: 5, icon: CheckCircle2, color: "#16a34a", title: "Tractor Tillage", text: "Soil dry enough for heavy tractor ploughing." },
      ],
    },
    {
      day: "THU",
      condition: "Clear Sky",
      max: 34,
      min: 25,
      rain: "0.0 mm",
      wind: "14 km/h",
      humidity: "50.0%",
      status: "✓ Field Work OK",
      isStay: false,
      overallAdvisory: "Warm clear skies (34°C). Ensure adequate irrigation in late afternoon to protect crop leaves from heat stress.",
      advisories: [
        { id: 1, icon: CheckCircle2, color: "#16a34a", title: "Pesticide Spray Approved", text: "Excellent early morning spraying window." },
        { id: 2, icon: Sun, color: "#d97706", title: "Warm Vegetative Growth", text: "High solar radiation boosts crop photosynthesis." },
        { id: 3, icon: Droplets, color: "#2563eb", title: "Irrigation Boost", text: "Run drip irrigation during late afternoon." },
        { id: 4, icon: Wind, color: "#0284c7", title: "Trap Monitoring", text: "Check sticky traps for yellow mite or aphid counts." },
        { id: 5, icon: CheckCircle2, color: "#16a34a", title: "Produce Hauling", text: "Road conditions dry and safe for mandi transport." },
      ],
    },
    {
      day: "FRI",
      condition: "Sunny",
      max: 33,
      min: 24,
      rain: "0.0 mm",
      wind: "16 km/h",
      humidity: "54.0%",
      status: "✓ Field Work OK",
      isStay: false,
      overallAdvisory: "Clear sunny weather (33°C). Great opportunity for crop harvesting, threshing, and APMC transportation.",
      advisories: [
        { id: 1, icon: Sun, color: "#d97706", title: "Solar Grain Drying", text: "Sunny sky. Perfect for grain moisture reduction." },
        { id: 2, icon: CheckCircle2, color: "#16a34a", title: "Full Harvest Window", text: "Proceed with full-scale harvesting operations." },
        { id: 3, icon: Droplets, color: "#2563eb", title: "Root Drenching", text: "Apply bio-fertilizer culture to root zone." },
        { id: 4, icon: Wind, color: "#0284c7", title: "Whitefly Control", text: "Install yellow sticky traps @ 10 traps/acre." },
        { id: 5, icon: CheckCircle2, color: "#16a34a", title: "Mandi Transport", text: "Safe transport window for APMC mandi hauling." },
      ],
    },
    {
      day: "SAT",
      condition: "Partly Cloudy",
      max: 31,
      min: 23,
      rain: "0.8 mm",
      wind: "17 km/h",
      humidity: "60.0%",
      status: "✓ Field Work OK",
      isStay: false,
      overallAdvisory: "Pleasant mild weather (31°C). Suitable for land preparation, harrowing, and organic FYM application.",
      advisories: [
        { id: 1, icon: CheckCircle2, color: "#16a34a", title: "Soil Tillage", text: "Ideal conditions for harrowing and bed preparation." },
        { id: 2, icon: Sun, color: "#d97706", title: "FYM Application", text: "Apply well-decomposed farmyard manure." },
        { id: 3, icon: Droplets, color: "#2563eb", title: "Bio-Culture", text: "Apply Azotobacter / PSB soil culture." },
        { id: 4, icon: Wind, color: "#0284c7", title: "Drip Line Flush", text: "Flush sub-mains to remove mineral sediment." },
        { id: 5, icon: CheckCircle2, color: "#16a34a", title: "Weekly Planning", text: "Review crop health and plan seed procurement." },
      ],
    },
  ];

  useEffect(() => {
    setLoading(true);

    Promise.allSettled([
      getCurrentWeather(userCity),
      getWeatherAdvisory(userCity),
    ]).then(([wRes, aRes]) => {
      if (wRes.status === "fulfilled" && wRes.value) {
        setWeather(wRes.value);
      } else {
        setWeather(getDistrictFallbackWeather(userCity));
      }

      if (aRes.status === "fulfilled" && typeof aRes.value === "string") {
        setBackendAdv(aRes.value);
      }
      setLoading(false);
    });
  }, [userCity]);

  // Construct dynamic forecast, merging backend/district live temperature
  const displayForecast = defaultForecast.map((item, idx) => {
    if (idx === 0 && weather?.temp != null) {
      return {
        ...item,
        max: weather.temp,
        min: weather.minTemp ? weather.minTemp : item.min,
        condition: weather.condition || item.condition,
        rain: weather.rainfall != null ? `${weather.rainfall} mm` : item.rain,
        wind: weather.windSpeed != null ? `${weather.windSpeed} km/h` : item.wind,
        humidity: weather.humidity != null ? `${weather.humidity}%` : item.humidity,
      };
    }
    return item;
  });

  const currentDayData = displayForecast[activeDay] || displayForecast[0];

  const overallAdvisoryText =
    activeDay === 0 && backendAdv
      ? backendAdv
      : currentDayData.overallAdvisory || defaultForecast[0].overallAdvisory;

  const currentAdvisories = currentDayData.advisories || defaultForecast[0].advisories;

  return (
    <div className="space-y-5 w-full font-sans select-none">
      {/* Subheader */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2" style={{ color: GREEN }}>
            🌤️ Weather &amp; Agronomic Advisory
          </h2>
          <p className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-1">
            <MapPin size={14} className="text-emerald-700" /> {userLoc} • <span className="text-slate-400">Selected Day: {currentDayData.day || "TODAY"}</span>
          </p>
        </div>
      </div>

      {loading && <PageSpinner label={`Fetching live weather & advisory for ${userCity}...`} />}

      {!loading && (
        <div className="space-y-5">
          {/* 7-Day Forecast Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {displayForecast.map((f, i) => {
              const isActive = activeDay === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className={`rounded-2xl p-4 text-center transition-all border cursor-pointer ${
                    isActive
                      ? "bg-[#0e4d2f] text-white border-[#0e4d2f] shadow-md scale-102"
                      : "bg-white border-black/5 text-slate-800 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <p className={`text-xs font-black uppercase tracking-wider ${isActive ? "text-green-200" : "text-slate-400"}`}>
                    {f.day || `DAY ${i+1}`}
                  </p>
                  <p className="text-sm font-extrabold mt-1 truncate">{f.condition || "Sunny"}</p>
                  <div className="my-2 flex justify-center text-3xl">⛅</div>
                  <p className="text-xl font-black">
                    {f.max ?? 32}° <span className={`text-sm font-semibold ${isActive ? "text-green-200" : "text-slate-400"}`}>{f.min ?? 24}°</span>
                  </p>
                  <div className="mt-2 text-xs space-y-1 font-bold">
                    <p className={isActive ? "text-green-100" : "text-slate-600"}>💧 {f.rain || "0.0 mm"}</p>
                    <p className={isActive ? "text-green-100" : "text-slate-600"}>💨 {f.wind || "16 km/h"}</p>
                  </div>
                  <div className="mt-3">
                    <span
                      className={`inline-block rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                        f.isStay ?? false
                          ? isActive ? "bg-rose-900/60 text-rose-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                          : isActive ? "bg-green-800 text-green-100" : "bg-green-50 text-green-800 border border-green-200"
                      }`}
                    >
                      {f.status || "✓ Field Work OK"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main 2-Column Section Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 Columns: Selected Day Temperature & Weather Metrics */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-xs text-center">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  {currentDayData.day || "TODAY"}'S TEMPERATURE ({userCity})
                </p>
                <div className="flex items-center justify-center gap-3 my-4">
                  <span className="text-6xl font-black text-slate-900">{currentDayData.max ?? 32}°C</span>
                  <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl text-amber-500">
                    ⛅
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-700">{currentDayData.condition || "Sunny"}</p>
              </div>

              {/* 2x2 Weather Metrics Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-black/5 bg-white p-5 text-center shadow-xs">
                  <div className="text-2xl mb-1">💧</div>
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">RAINFALL</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{currentDayData.rain || "0.0 mm"}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-5 text-center shadow-xs">
                  <div className="text-2xl mb-1">💨</div>
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">WIND</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{currentDayData.wind || "16 km/h"}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-5 text-center shadow-xs">
                  <div className="text-2xl mb-1">💧</div>
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">HUMIDITY</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{currentDayData.humidity || "58.0%"}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-5 text-center shadow-xs">
                  <div className="text-2xl mb-1">🌡️</div>
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">MIN TEMP</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{currentDayData.min ?? 24}°C</p>
                </div>
              </div>
            </div>

            {/* Right 8 Columns: Reactive Farm Advisory Section */}
            <div className="lg:col-span-8 space-y-4">
              {/* Overall Banner */}
              <div
                className="rounded-3xl border p-6 shadow-2xs flex items-center gap-4"
                style={{ background: "#f0fdf4", borderColor: "#86efac" }}
              >
                <span className="text-4xl">🌱</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-slate-900 text-lg">
                      Overall Agronomic Advisory ({currentDayData.day || "TODAY"})
                    </p>
                    <span className="rounded-full bg-emerald-700 text-white text-[10px] font-black px-2.5 py-0.5 uppercase">
                      Active Day {activeDay + 1}
                    </span>
                  </div>
                  <p className="text-slate-800 text-base font-semibold mt-1 leading-relaxed">
                    {overallAdvisoryText}
                  </p>
                </div>
              </div>

              {/* Advisories List */}
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-1">
                  Farm Advisories for {currentDayData.day || "TODAY"} (5 Directives)
                </h3>
                {currentAdvisories.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-base text-slate-800 font-medium leading-relaxed"
                  >
                    <a.icon size={22} className="shrink-0 mt-0.5" style={{ color: a.color }} />
                    <div>
                      <span className="font-extrabold text-slate-900 block mb-0.5 text-base">{a.title}</span>
                      <span className="text-sm md:text-base text-slate-700 font-semibold">{a.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
