import { Component } from "react";
import ErrorState from "./ErrorState";

// Granular per-section boundary so one broken widget can't blank the whole
// page. Used around the main route content.
export default class SectionErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.error(err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          message="Something went wrong loading this section."
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}
