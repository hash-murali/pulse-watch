import { lazy, Suspense } from "react";
import App from "./App";
const Explore = lazy(() => import("./discover/Explore"));
export default function Root() {
  return window.location.pathname === "/explore" ||
    window.location.pathname.startsWith("/explore/") ? (
    <Suspense
      fallback={
        <div className="state-panel" role="status">
          Loading a little curiosity…
        </div>
      }
    >
      <Explore />
    </Suspense>
  ) : (
    <App />
  );
}
