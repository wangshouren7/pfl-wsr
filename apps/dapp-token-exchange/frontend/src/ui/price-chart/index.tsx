"use client";
import dynamic from "next/dynamic";

const PriceChart = dynamic(() => import("@/ui/price-chart/price-chart"), {
  ssr: false,
});

export { PriceChart };
