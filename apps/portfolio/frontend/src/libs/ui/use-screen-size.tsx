"use client";

import { useEffect, useState } from "react";

const breaks = {
  md: (x: number) => x > 768,
  lg: (x: number) => x > 1024,
};

const initialState = {
  /** The screen size, if the screen size is not detected, it will be 0 */
  size: 0,
  /** Whether the screen size is larger than 768px */
  md: false,
  /** Whether the screen size is larger than 1024px */
  lg: false,
  /** Whether the screen size is detected */
  detected: false,
  isMobile: false,
  isTablet: false,
  isDesktop: false,
};

/**
 * Detect screen size
 *
 * The initial State is: {@link initialState}
 */
export function useScreenSize() {
  const [ret, setRet] = useState(initialState);

  useEffect(() => {
    function getScreenSize() {
      return window.innerWidth;
    }

    function handleResize() {
      const size = getScreenSize();

      const md = breaks.md(size);
      const lg = breaks.lg(size);

      setRet({
        size,
        md,
        lg,
        detected: true,
        isMobile: !md,
        isTablet: md && !lg,
        isDesktop: lg,
      });
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return ret;
}
