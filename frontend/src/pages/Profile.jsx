import { useEffect, useState } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../components/ui/PageHeader";
import Spinner, { PageSpinner } from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { getMyProfile, updateProfile } from "../api/auth";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

const languageLabels = { EN: "English", HI: "हिन्दी (Hindi)", MR: "मराठी (Marathi)" };

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-black/5 py-3.5 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-slate-800">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function toFormState(profile) {
  return {
    name: profile.name ?? "",
    phone: profile.phone ?? "",
    state: profile.state ?? "",
    district: profile.district ?? "",
    landSizeAcres: profile.landSizeAcres ?? "",
    annualIncome: profile.annualIncome ?? "",
    primaryCrop: profile.primaryCrop ?? "",
    casteCategory: profile.casteCategory ?? "GENERAL",
    preferredLanguage: profile.preferredLanguage ?? "EN",
  };
}

export default function Profile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch((err) => setError(extractErrorMessage(err, "Could not load your profile")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner label="Loading your profile..." />;

  if (error || !profile) {
    return (
      <EmptyState
        icon={Users}
        title="Couldn't load profile"
        description={error || "Please try again later."}
      />
    );
  }

  const startEditing = () => {
    setForm(toFormState(profile));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setForm(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        landSizeAcres: form.landSizeAcres ? Number(form.landSizeAcres) : null,
        annualIncome: form.annualIncome ? Number(form.annualIncome) : null,
      };
      const updated = await updateProfile(payload);
      setProfile(updated);
      updateUser({ name: updated.name, state: updated.state, district: updated.district });
      setIsEditing(false);
      setForm(null);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update your profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Your farmer account details."
        action={
          isEditing ? (
            <button type="button" onClick={cancelEditing} className="btn-secondary">
              <X size={16} />
              Cancel
            </button>
          ) : (
            <button type="button" onClick={startEditing} className="btn-secondary">
              <Pencil size={16} />
              Edit profile
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card flex flex-col items-center p-8 text-center lg:col-span-1">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            {profile.name?.[0]?.toUpperCase() ?? "F"}
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">{profile.name}</h2>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <span className="mt-3 rounded-full bg-earth-50 px-3 py-1 text-xs font-medium text-earth-700">
            {profile.casteCategory ?? "—"} Category
          </span>
        </div>

        <div className="card p-6 lg:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="name">Full name</label>
                  <input id="name" name="name" required value={form.name} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="phone">Mobile number</label>
                  <input id="phone" name="phone" required pattern="^[6-9]\d{9}$" title="Enter a valid 10-digit mobile number" value={form.phone} onChange={handleChange} className="input" />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="email">Email address</label>
                <input id="email" value={profile.email} disabled className="input opacity-60" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="state">State</label>
                  <input id="state" name="state" value={form.state} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="district">District</label>
                  <input id="district" name="district" value={form.district} onChange={handleChange} className="input" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="landSizeAcres">Land size (acres)</label>
                  <input id="landSizeAcres" name="landSizeAcres" type="number" step="0.01" min="0" value={form.landSizeAcres} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="annualIncome">Annual income (₹)</label>
                  <input id="annualIncome" name="annualIncome" type="number" min="0" value={form.annualIncome} onChange={handleChange} className="input" />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="primaryCrop">Primary crop</label>
                <input id="primaryCrop" name="primaryCrop" value={form.primaryCrop} onChange={handleChange} className="input" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="casteCategory">Category</label>
                  <select id="casteCategory" name="casteCategory" value={form.casteCategory} onChange={handleChange} className="input">
                    <option value="GENERAL">General</option>
                    <option value="GEN">GEN</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="preferredLanguage">Preferred language</label>
                  <select id="preferredLanguage" name="preferredLanguage" value={form.preferredLanguage} onChange={handleChange} className="input">
                    <option value="EN">English</option>
                    <option value="HI">हिन्दी (Hindi)</option>
                    <option value="MR">मराठी (Marathi)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={cancelEditing} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving && <Spinner size={16} className="text-white" />}
                  Save changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone} />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={[profile.district, profile.state].filter(Boolean).join(", ")}
              />
              <InfoRow
                icon={Landmark}
                label="Land size"
                value={profile.landSizeAcres != null ? `${profile.landSizeAcres} acres` : null}
              />
              <InfoRow icon={Sprout} label="Primary crop" value={profile.primaryCrop} />
              <InfoRow
                icon={Wallet}
                label="Annual income"
                value={profile.annualIncome != null ? `₹${profile.annualIncome.toLocaleString("en-IN")}` : null}
              />
              <InfoRow
                icon={Languages}
                label="Preferred language"
                value={languageLabels[profile.preferredLanguage] ?? profile.preferredLanguage}
              />
              <InfoRow
                icon={CalendarDays}
                label="Member since"
                value={profile.createAt ? new Date(profile.createAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : null}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
