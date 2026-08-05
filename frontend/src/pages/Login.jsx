import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../components/layout/AuthLayout";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back to AgroSamridhi!");
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 block" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="farmer@example.com"
            className="w-full rounded-2xl bg-[#edf4fe] px-4 py-3 text-xs font-bold text-slate-900 outline-none border border-transparent focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 block" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full rounded-2xl bg-[#edf4fe] px-4 py-3 text-xs font-bold text-slate-900 outline-none border border-transparent focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#066f44] hover:bg-[#045936] text-white py-3.5 text-xs font-black tracking-wide flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer mt-2"
        >
          {loading ? <Spinner size={16} className="text-white" /> : null}
          {loading ? "Signing in..." : "Secure Sign In →"}
        </button>
      </form>

      <div className="mt-8 text-center text-xs font-bold text-slate-500">
        First time visiting the portal?{" "}
        <Link to="/register" className="text-[#066f44] hover:underline font-extrabold ml-1">
          Create Farmer Account
        </Link>
      </div>
    </AuthLayout>
  );
}
