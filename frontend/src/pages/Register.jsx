import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import AgroLogo from "../components/ui/AgroLogo";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

const INDIA_STATES = [
  "Maharashtra",
  "Madhya Pradesh",
  "Punjab",
  "Uttar Pradesh",
  "Gujarat",
  "Haryana",
  "Rajasthan",
  "Karnataka",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Telangana",
  "West Bengal",
  "Bihar",
];

const CROP_OPTIONS = [
  "Sugarcane (Ganna)",
  "Cotton (Kapas)",
  "Rice / Paddy (Chawal)",
  "Wheat (Gehun)",
  "Onion (Kanda)",
  "Tomato (Tamatar)",
  "Potato (Aloo)",
  "Soybean",
  "Maize (Makka)",
  "Chickpea (Chana)",
  "Mustard (Sarson)",
  "Mango (Aam)",
  "Grape (Draksh)",
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  state: "",
  district: "",
  latitude: "",
  longitude: "",
  landSizeAcres: "",
  casteCategory: "GENERAL",
  annualIncome: "",
  preferredLanguage: "EN",
  primaryCrop: "Sugarcane",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState(initialForm);
  const [loading, setLoading] = useState(false);

  // Clear any residual browser autofill on mount
  useEffect(() => {
    setForm(initialForm);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutofillCoordinates = () => {
    if ("geolocation" in navigator) {
      toast.loading("Fetching your GPS coordinates...", { id: "gps" });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(4),
            longitude: position.coords.longitude.toFixed(4),
          }));
          toast.success("GPS Coordinates autofilled!", { id: "gps" });
        },
        () => {
          setForm((prev) => ({
            ...prev,
            latitude: "19.9975",
            longitude: "73.7898",
          }));
          toast.success("Default coordinates autofilled!", { id: "gps" });
        }
      );
    } else {
      setForm((prev) => ({
        ...prev,
        latitude: "19.9975",
        longitude: "73.7898",
      }));
      toast.success("Default coordinates autofilled!");
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.name || !form.email || !form.phone || !form.password) {
        toast.error("Please fill in all basic account credentials");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.state || !form.district) {
        toast.error("Please select state and district");
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        primaryCrop: form.primaryCrop.split(" ")[0],
        landSizeAcres: form.landSizeAcres ? Number(form.landSizeAcres) : 2.5,
        annualIncome: form.annualIncome ? Number(form.annualIncome) : 180000,
      };
      await register(payload);
      toast.success("Farmer Registration Complete! Welcome to AgroSamridhi.");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not complete registration"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b5134] flex items-center justify-center p-4 md:p-8 font-sans select-none">
      <div className="w-full max-w-[460px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/10 flex flex-col items-center">
        {/* Yellow Sprout Brand Logo */}
        <div className="flex flex-col items-center text-center mb-4">
          <AgroLogo size={44} />
          <h1 className="text-2xl md:text-3xl font-black text-[#0e4d2f] tracking-tight mt-2">
            Farmer Registration
          </h1>
        </div>

        {/* 3-Step Stepper Progress Bar */}
        <div className="w-full flex items-center justify-center gap-2 my-4 relative">
          <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-10 h-0.5 bg-[#066f44] -translate-y-1/2 z-0 transition-all duration-300"
            style={{
              width: step === 1 ? "0%" : step === 2 ? "50%" : "80%",
            }}
          />

          {/* Circle 1 */}
          <div
            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
              step >= 1 ? "bg-[#066f44] text-white" : "border-2 border-slate-300 bg-white text-slate-400"
            }`}
          >
            1
          </div>

          <div className="w-16" />

          {/* Circle 2 */}
          <div
            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
              step >= 2 ? "bg-[#066f44] text-white" : "border-2 border-slate-300 bg-white text-slate-400"
            }`}
          >
            2
          </div>

          <div className="w-16" />

          {/* Circle 3 */}
          <div
            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
              step >= 3 ? "bg-[#066f44] text-white" : "border-2 border-slate-300 bg-white text-slate-400"
            }`}
          >
            3
          </div>
        </div>

        {/* STEP 1: Basic Account Credentials */}
        {step === 1 && (
          <form
            onSubmit={handleNextStep}
            autoComplete="off"
            className="w-full space-y-4 mt-2"
          >
            {/* Dummy hidden inputs to block aggressive browser autofill */}
            <input type="text" name="prevent_autofill_user" className="hidden" tabIndex={-1} autoComplete="off" />
            <input type="password" name="prevent_autofill_pass" className="hidden" tabIndex={-1} autoComplete="off" />

            <p className="text-xs font-bold text-center text-slate-500 mb-4">
              Step 1: Basic Account Credentials
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="reg_name">
                Full Name
              </label>
              <input
                id="reg_name"
                name="name"
                required
                autoComplete="off"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="reg_email">
                Email Address
              </label>
              <input
                id="reg_email"
                name="email"
                type="email"
                required
                autoComplete="off"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. ramesh@gmail.com"
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="reg_phone">
                Mobile Number
              </label>
              <input
                id="reg_phone"
                name="phone"
                required
                autoComplete="off"
                pattern="^[6-9]\d{9}$"
                title="10-digit mobile number"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="reg_password">
                Password
              </label>
              <input
                id="reg_password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 chars, 1 uppercase, 1 digit"
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#066f44] hover:bg-[#045936] text-white py-3.5 text-xs font-black tracking-wide shadow-sm transition-colors cursor-pointer mt-4"
            >
              Next Step
            </button>
          </form>
        )}

        {/* STEP 2: Location and Farm GPS */}
        {step === 2 && (
          <form onSubmit={handleNextStep} autoComplete="off" className="w-full space-y-4 mt-2">
            <p className="text-xs font-bold text-center text-slate-500 mb-4">
              Step 2: Location and Farm GPS
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="state">
                State
              </label>
              <select
                id="state"
                name="state"
                required
                value={form.state}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
              >
                <option value="">-- Select Your State --</option>
                {INDIA_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="district">
                District
              </label>
              <input
                id="district"
                name="district"
                required
                autoComplete="off"
                value={form.district}
                onChange={handleChange}
                placeholder="e.g. Nashik"
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="latitude">
                  Latitude
                </label>
                <input
                  id="latitude"
                  name="latitude"
                  autoComplete="off"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 19.9975"
                  className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="longitude">
                  Longitude
                </label>
                <input
                  id="longitude"
                  name="longitude"
                  autoComplete="off"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="e.g. 73.7898"
                  className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutofillCoordinates}
              className="w-full rounded-2xl border border-emerald-600 bg-white py-3 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              📍 Autofill My Coordinates
            </button>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 rounded-2xl border border-slate-300 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-[#066f44] hover:bg-[#045936] text-white py-3 text-xs font-black tracking-wide shadow-sm transition-colors cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Farm Demographics & Language */}
        {step === 3 && (
          <form onSubmit={handleSubmit} autoComplete="off" className="w-full space-y-3.5 mt-2">
            <p className="text-xs font-bold text-center text-slate-500 mb-3">
              Step 3: Farm Demographics &amp; Language
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="primaryCrop">
                Primary Cultivated Crop
              </label>
              <select
                id="primaryCrop"
                name="primaryCrop"
                required
                value={form.primaryCrop}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
              >
                {CROP_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="landSizeAcres">
                Farm Land Size (Acres)
              </label>
              <input
                id="landSizeAcres"
                name="landSizeAcres"
                type="number"
                step="0.01"
                min="0"
                autoComplete="off"
                value={form.landSizeAcres}
                onChange={handleChange}
                placeholder="e.g. 2.5"
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="casteCategory">
                Caste Category (for Schemes matching)
              </label>
              <select
                id="casteCategory"
                name="casteCategory"
                value={form.casteCategory}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
              >
                <option value="GENERAL">General (GEN)</option>
                <option value="GEN">GEN</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="annualIncome">
                Annual Income (INR)
              </label>
              <input
                id="annualIncome"
                name="annualIncome"
                type="number"
                min="0"
                autoComplete="off"
                value={form.annualIncome}
                onChange={handleChange}
                placeholder="e.g. 120000"
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block" htmlFor="preferredLanguage">
                Preferred Communication Language
              </label>
              <select
                id="preferredLanguage"
                name="preferredLanguage"
                value={form.preferredLanguage}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
              >
                <option value="EN">English</option>
                <option value="HI">हिन्दी (Hindi)</option>
                <option value="MR">मराठी (Marathi)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 rounded-2xl border border-slate-300 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl bg-[#066f44] hover:bg-[#045936] text-white py-3 text-xs font-black tracking-wide shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading && <Spinner size={16} className="text-white" />}
                {loading ? "Submitting..." : "Submit & Complete"}
              </button>
            </div>
          </form>
        )}

        {/* Card Footer */}
        <div className="mt-8 text-center text-xs font-bold text-slate-500">
          Already registered?{" "}
          <Link to="/login" className="text-[#066f44] hover:underline font-extrabold ml-1">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
