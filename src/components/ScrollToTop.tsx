import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // 1. Grab the current "Path" (e.g., /shop)
  const { pathname } = useLocation();

  useEffect(() => {
    // 2. Every time the path changes, scroll to X:0, Y:0 (the top-left corner)
    window.scrollTo(0, 0);
  }, [pathname]); // This array tells React: "Run this only when the path changes"

  // 3. This component doesn't show anything on screen, it just performs the action
  return null;
};

export default ScrollToTop;