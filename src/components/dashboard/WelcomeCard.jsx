export default function WelcomeCard({ name, subtitle }) {
  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-xl3 bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-soft sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-14 right-16 h-28 w-28 rounded-full bg-white/10" />
      <p className="text-sm font-medium text-brand-100">Welcome back</p>
      <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Hi, {name}!</h1>
      <p className="mt-2 max-w-md text-sm text-brand-100">{subtitle}</p>
    </div>
  );
}
