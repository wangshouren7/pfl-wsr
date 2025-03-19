"use client";
import dynamic from "next/dynamic";
import { PanelCard } from "../panel-card";

const PriceChart = dynamic(() => import("@/ui/price-chart/price-chart"), {
  ssr: false,
  loading: () => (
    <PanelCard centerContent title="Price Chart">
      <div className="flex h-full items-center justify-center">loading...</div>
    </PanelCard>
  ),
});

export { PriceChart };
