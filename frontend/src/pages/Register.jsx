import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../components/layout/AuthLayout";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  state: "",
  district: "",
  landSizeAcres: "",
  annualIncome: "",
  primaryCrop: "",
  casteCategory: "GENERAL",
  preferredLanguage: "EN",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        landSizeAcres: form.landSizeAcres ? Number(form.landSizeAcres) : null,
        annualIncome: form.annualIncome ? Number(form.annualIncome) : null,
      };
      await register(payload);
      toast.success("Account created! Welcome to AgroSamridhi.");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not create account"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join thousands of farmers using AgroSamridhi">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Ramesh Patil" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Mobile number</label>
            <input id="phone" name="phone" required pattern="^[6-9]\d{9}$" title="Enter a valid 10-digit mobile number" value={form.phone} onChange={handleChange} placeholder="98XXXXXXXX" className="input" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className="input" />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} placeholder="Create a strong password" className="input" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="state">State</label>
            <input id="state" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="district">District</label>
            <input id="district" name="district" value={form.district} onChange={handleChange} placeholder="Nashik" className="input" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="landSizeAcres">Land size (acres)</label>
            <input id="landSizeAcres" name="landSizeAcres" type="number" step="0.01" min="0" value={form.landSizeAcres} onChange={handleChange} placeholder="2.5" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="annualIncome">Annual income (₹)</label>
            <input id="annualIncome" name="annualIncome" type="number" min="0" value={form.annualIncome} onChange={handleChange} placeholder="150000" className="input" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="primaryCrop">Primary crop</label>
          <input id="primaryCrop" name="primaryCrop" value={form.primaryCrop} onChange={handleChange} placeholder="e.g. Onion" className="input" />
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

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner size={18} className="text-white" /> : <UserPlus size={18} />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
