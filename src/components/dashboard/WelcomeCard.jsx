export default function WelcomeCard({ name, subtitle }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-card sm:p-8">
      <h1 className="text-xl font-bold sm:text-2xl">Hello, {name}!</h1>
      <p className="mt-1 max-w-md text-sm text-brand-100">{subtitle}</p>
    </div>
  );
}
