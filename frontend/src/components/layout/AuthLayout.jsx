import AgroLogo from "../ui/AgroLogo";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#0b5134] flex items-center justify-center p-4 md:p-8 font-sans select-none">
      <div className="w-full max-w-[440px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/10 flex flex-col items-center">
        {/* Brand Logo Header with Yellow Sprout Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <AgroLogo size={44} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0e4d2f] tracking-tight mt-1">
            AgroSamridhi
          </h1>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5 tracking-wide">
            Smart Farmer Platform &amp; Farm Intelligence
          </p>
        </div>

        {/* Children Form */}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
