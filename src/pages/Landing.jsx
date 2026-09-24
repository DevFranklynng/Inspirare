import LandingNav from "../features/landing/components/LandingNav";
import Hero from "../features/landing/components/Hero";
import FeatureCards from "../features/landing/components/FeatureCards";
import RolesTabs from "../features/landing/components/RolesTabs";
import HowItWorks from "../features/landing/components/HowItWorks";
import FinalCta from "../features/landing/components/FinalCta";
import LandingFooter from "../features/landing/components/LandingFooter";

// Public marketing page shown at "/" to signed-out visitors. Fully static:
// it makes no API calls, and every call to action goes to /login (accounts
// are created by an admin, so there is deliberately no sign-up link).
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f3f2fb] p-3 sm:p-6">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-white px-5 pb-4 pt-6 shadow-panel sm:px-10 sm:pt-8 lg:px-14">
        <LandingNav />
        <main>
          <Hero />
          <FeatureCards />
          <RolesTabs />
          <HowItWorks />
          <FinalCta />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
