import SkeletonLoadingState from "./SkeletonLoadingState";

export default function LoadingState({ label = "Loading…", variant = "panel", count, className }) {
  return <SkeletonLoadingState label={label} variant={variant} count={count} className={className} />;
}
