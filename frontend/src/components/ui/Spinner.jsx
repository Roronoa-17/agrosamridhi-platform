import { Loader2 } from "lucide-react";
import clsx from "clsx";

export default function Spinner({ className, size = 20 }) {
  return <Loader2 className={clsx("animate-spin text-brand-600", className)} size={size} />;
}

export function PageSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
      <Spinner size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
