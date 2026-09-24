// A genuine sequence, so numbered markers are meaningful here.
const steps = [
  { title: "Get your account", text: "Your admin creates your account and hands you your sign-in details." },
  { title: "Enroll in Web Development", text: "It's the one course open for enrollment right now." },
  { title: "Learn and submit", text: "Complete lessons and send in assignments before they're due." },
  { title: "See your progress", text: "Track completion and read feedback on every graded submission." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-12 md:py-16">
      <h2 className="max-w-lg text-2xl font-extrabold leading-tight tracking-tight text-brand-950 sm:text-3xl">
        From first sign-in to finished course
      </h2>

      <ol className="relative mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div
          aria-hidden="true"
          className="absolute left-[12%] right-[12%] top-6 hidden border-t-2 border-dashed border-lilac-300 lg:block"
        />
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-lilac-600 shadow-soft ring-4 ring-[#f3f2fb]">
              {i + 1}
            </span>
            <h3 className="mt-4 text-base font-bold text-brand-950">{s.title}</h3>
            <p className="mt-1.5 max-w-[16rem] text-sm leading-relaxed text-slate-600">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
