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
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { PageSpinner } from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { getMyProfile } from "../api/auth";
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

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div>
      <PageHeader title="My Profile" description="Your farmer account details." />

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
        </div>
      </div>
    </div>
  );
}
