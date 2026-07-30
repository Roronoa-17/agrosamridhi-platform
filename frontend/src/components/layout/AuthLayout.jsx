import { Leaf, CloudSun, LineChart, ShieldCheck } from "lucide-react";

const features = [
  { icon: CloudSun, text: "Hyperlocal weather advisories for your district" },
  { icon: LineChart, text: "Live mandi prices and crop trend insights" },
  { icon: ShieldCheck, text: "Personalised government scheme matching" },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-[#f6f8f4]">
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 35%), radial-gradient(circle at 80% 70%, white 0, transparent 40%)",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Leaf size={20} />
          </div>
          <span className="text-lg font-bold">AgroSamridhi</span>
        </div>

        <div className="relative">
          <h1 className="text-3xl font-bold leading-tight">
            Smarter farming decisions, backed by data.
          </h1>
          <p className="mt-3 max-w-md text-brand-100">
            One platform for weather, mandi prices, government schemes and AI-powered
            crop &amp; soil insights — built for Indian farmers.
          </p>

          <ul className="mt-8 space-y-4">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm text-brand-50">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <f.icon size={16} />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-100/80">
          &copy; {new Date().getFullYear()} AgroSamridhi. Empowering farmers with technology.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Leaf size={18} />
            </div>
            <span className="text-lg font-bold text-slate-900">AgroSamridhi</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
