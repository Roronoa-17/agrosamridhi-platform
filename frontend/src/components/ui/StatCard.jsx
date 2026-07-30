import clsx from "clsx";

const toneStyles = {
  brand: "bg-brand-50 text-brand-700",
  earth: "bg-earth-50 text-earth-700",
  sky: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
};

export default function StatCard({ icon: Icon, label, value, hint, tone = "brand" }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      {Icon && (
        <div className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", toneStyles[tone])}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-lg font-semibold text-slate-900">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
