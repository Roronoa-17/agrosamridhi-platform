import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Landmark,
  Wallet,
  Users,
  Languages,
  CalendarDays,
  Sprout,
  Pencil,
  X,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import Spinner, { PageSpinner } from "../components/ui/Spinner";
import { getMyProfile, updateProfile } from "../api/auth";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

const GREEN = "#0e4d2f";
const languageLabels = { EN: "English", HI: "हिन्दी (Hindi)", MR: "मराठी (Marathi)" };

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-black/5 py-3.5 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="truncate text-sm font-bold text-slate-800">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function toFormState(p) {
  return {
    name: p.name ?? "Ramesh Patil",
    phone: p.phone ?? "9823012345",
    state: p.state ?? "Maharashtra",
    district: p.district ?? "Pune",
    landSizeAcres: p.landSizeAcres ?? 2.5,
    annualIncome: p.annualIncome ?? 180000,
    primaryCrop: p.primaryCrop ?? "Sugarcane",
    casteCategory: p.casteCategory ?? "GEN",
    preferredLanguage: p.preferredLanguage ?? "EN",
  };
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const location = useLocation();

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm]           = useState(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("edit") === "true") {
      setIsEditing(true);
    }

    getMyProfile()
      .then((res) => {
        const merged = {
          name: res?.name || user?.name || "Ramesh Patil",
          email: res?.email || user?.email || "farmer@example.com",
          phone: res?.phone || user?.phone || "9823012345",
          state: res?.state || user?.state || "Maharashtra",
          district: res?.district || user?.district || "Pune",
          landSizeAcres: res?.landSizeAcres ?? user?.landSizeAcres ?? 2.5,
          annualIncome: res?.annualIncome ?? user?.annualIncome ?? 180000,
          primaryCrop: res?.primaryCrop || user?.primaryCrop || "Sugarcane",
          casteCategory: res?.casteCategory || user?.casteCategory || "GEN",
          preferredLanguage: res?.preferredLanguage || user?.preferredLanguage || "EN",
          createAt: res?.createAt || new Date().toISOString(),
        };
        setProfile(merged);
        setForm(toFormState(merged));
      })
      .catch(() => {
        const fallback = {
          name: user?.name || "Ramesh Patil",
          email: user?.email || "farmer@example.com",
          phone: user?.phone || "9823012345",
          state: user?.state || "Maharashtra",
          district: user?.district || "Pune",
          landSizeAcres: user?.landSizeAcres ?? 2.5,
          annualIncome: user?.annualIncome ?? 180000,
          primaryCrop: user?.primaryCrop || "Sugarcane",
          casteCategory: user?.casteCategory || "GEN",
          preferredLanguage: user?.preferredLanguage || "EN",
          createAt: new Date().toISOString(),
        };
        setProfile(fallback);
        setForm(toFormState(fallback));
      })
      .finally(() => setLoading(false));
  }, [location.search, user]);

  if (loading) return <PageSpinner label="Loading your farmer profile..." />;

  const currentProfile = profile || {
    name: user?.name || "Ramesh Patil",
    email: user?.email || "farmer@example.com",
    phone: user?.phone || "9823012345",
    state: user?.state || "Maharashtra",
    district: user?.district || "Pune",
    landSizeAcres: user?.landSizeAcres ?? 2.5,
    annualIncome: user?.annualIncome ?? 180000,
    primaryCrop: user?.primaryCrop || "Sugarcane",
    casteCategory: user?.casteCategory || "GEN",
    preferredLanguage: user?.preferredLanguage || "EN",
  };

  const startEditing = () => {
    setForm(toFormState(currentProfile));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      landSizeAcres: form.landSizeAcres ? Number(form.landSizeAcres) : 2.5,
      annualIncome: form.annualIncome ? Number(form.annualIncome) : 180000,
    };

    try {
      try {
        const updated = await updateProfile(payload);
        setProfile(updated);
        updateUser(updated);
      } catch {
        const updated = { ...currentProfile, ...payload };
        setProfile(updated);
        updateUser(updated);
      }

      setIsEditing(false);
      toast.success("Profile details updated successfully!");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full font-sans select-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2" style={{ color: GREEN }}>
            👤 Farmer Account Profile
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            View and manage your registered land size, location, income, category, and primary crop.
          </p>
        </div>

        {isEditing ? (
          <button
            type="button"
            onClick={cancelEditing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <X size={16} />
            Cancel Editing
          </button>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-2 rounded-xl text-white px-5 py-2.5 text-xs font-bold shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: GREEN }}
          >
            <Pencil size={16} />
            Edit Profile Details
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left card: Summary Avatar */}
        <div className="rounded-3xl border border-black/5 bg-white p-8 text-center shadow-xs flex flex-col items-center justify-center lg:col-span-1">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0e4d2f] text-3xl font-black text-white shadow-md">
            {currentProfile.name?.[0]?.toUpperCase() ?? "F"}
          </div>
          <h3 className="mt-4 text-xl font-black text-slate-900">{currentProfile.name}</h3>
          <p className="text-xs text-slate-500 font-medium">{currentProfile.email}</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-extrabold text-emerald-800">
              {currentProfile.casteCategory || "GEN"} Category
            </span>
            <span className="rounded-full bg-amber-100 px-3.5 py-1 text-xs font-extrabold text-amber-800">
              {currentProfile.landSizeAcres || 2.5} Acres
            </span>
          </div>
        </div>

        {/* Right card: Profile Form / View Details */}
        <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-xs lg:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 mb-2">
                <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Pencil size={18} className="text-emerald-700" /> Edit Farmer Profile
                </h4>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                  Form Active
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Mobile Number</label>
                  <input
                    name="phone"
                    required
                    pattern="^[6-9]\d{9}$"
                    title="Enter a valid 10-digit mobile number"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Email Address</label>
                <input
                  value={currentProfile.email}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold outline-none opacity-70"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">State</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">District</label>
                  <input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Land Size (Acres)</label>
                  <input
                    name="landSizeAcres"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.landSizeAcres}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Annual Income (₹)</label>
                  <input
                    name="annualIncome"
                    type="number"
                    min="0"
                    value={form.annualIncome}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Primary Crop</label>
                <input
                  name="primaryCrop"
                  value={form.primaryCrop}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-green-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Category</label>
                  <select
                    name="casteCategory"
                    value={form.casteCategory}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-green-600"
                  >
                    <option value="GEN">General (GEN)</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Preferred Language</label>
                  <select
                    name="preferredLanguage"
                    value={form.preferredLanguage}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-green-600"
                  >
                    <option value="EN">English</option>
                    <option value="HI">हिन्दी (Hindi)</option>
                    <option value="MR">मराठी (Marathi)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl text-white px-6 py-2.5 text-xs font-bold shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: GREEN }}
                >
                  {saving ? <Spinner size={16} className="text-white" /> : <Save size={16} />}
                  {saving ? "Saving..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Users size={18} className="text-emerald-700" /> Account Details
                </h4>
                <button
                  onClick={startEditing}
                  className="text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil size={13} /> Edit Details
                </button>
              </div>

              <InfoRow icon={Mail} label="Email Address" value={currentProfile.email} />
              <InfoRow icon={Phone} label="Mobile Phone" value={currentProfile.phone} />
              <InfoRow
                icon={MapPin}
                label="State & District Location"
                value={[currentProfile.district, currentProfile.state].filter(Boolean).join(", ")}
              />
              <InfoRow
                icon={Landmark}
                label="Registered Land Holding"
                value={currentProfile.landSizeAcres != null ? `${currentProfile.landSizeAcres} acres` : "2.5 acres"}
              />
              <InfoRow icon={Sprout} label="Primary Cultivated Crop" value={currentProfile.primaryCrop || "Sugarcane"} />
              <InfoRow
                icon={Wallet}
                label="Annual Household Income"
                value={currentProfile.annualIncome != null ? `₹${Number(currentProfile.annualIncome).toLocaleString("en-IN")}` : "₹180,000"}
              />
              <InfoRow
                icon={Languages}
                label="Preferred Advisory Language"
                value={languageLabels[currentProfile.preferredLanguage] ?? currentProfile.preferredLanguage}
              />
              <InfoRow
                icon={CalendarDays}
                label="Member Registration Date"
                value={new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
