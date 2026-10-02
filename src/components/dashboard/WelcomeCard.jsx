import { Sparkles, ArrowUpRight } from "lucide-react";

export default function WelcomeCard({ name, subtitle }) {
  return (
    <div className="relative flex min-h-[190px] h-full flex-col justify-center overflow-hidden rounded-[1.6rem] bg-[#f0edfc] px-5 py-6 text-[#22213a] sm:px-7">
      <div className="pointer-events-none absolute -right-5 top-1/2 grid h-36 w-36 -translate-y-1/2 place-items-center rounded-full border border-[#ded8f6] bg-white/55 text-[#7563d6] sm:right-5 sm:h-40 sm:w-40">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-[0_12px_35px_rgba(92,74,174,.12)]"><Sparkles className="h-10 w-10" strokeWidth={1.5} /></div>
      </div>
      <p className="text-xs font-semibold text-[#776aa8]">Your learning workspace</p>
      <h1 className="mt-2 max-w-[68%] text-[1.65rem] font-extrabold leading-[1.1] tracking-[-0.045em] sm:text-[2rem]">Hi, {name}!<br />What are your plans for today?</h1>
      <p className="mt-2 max-w-[63%] text-xs leading-relaxed text-[#77728e] sm:text-sm">{subtitle}</p>
      <span className="mt-4 flex items-center gap-1 text-[11px] font-bold text-brand-600">Pick up where you left off <ArrowUpRight className="h-3.5 w-3.5" /></span>
    </div>
  );
}
