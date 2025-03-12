"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  IComponentBaseProps,
  mp,
} from "@pfl-wsr/ui";
import React, { useEffect, useRef, useState } from "react";

import "@klinecharts/pro/dist/klinecharts-pro.css";
import {
  type CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  type Time,
  type ISeriesApi,
} from "lightweight-charts";
import { useChartData } from "@/domains/chart/use-chart-data";
import { logger } from "@/lib/logger";

const PriceChart: React.FC<IComponentBaseProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [series, setSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);

  const { chartData } = useChartData();

  useEffect(() => {
    if (!chartData || !series) return;

    series?.setData(chartData as unknown as CandlestickData<Time>[]);
  }, [chartData, series]);

  useEffect(() => {
    const chart = createChart(ref.current!, {
      layout: {
        textColor: "black",
        background: { type: ColorType.Solid, color: "white" },
      },

      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    setSeries(candlestickSeries);

    chart.timeScale().fitContent();

    const handleResize = () => {
      logger.log("resize", ref.current?.clientWidth, ref.current?.clientHeight);
      chart.applyOptions({
        width: ref.current?.clientWidth,
        height: ref.current?.clientHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return mp(
    props,
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full" ref={ref}></div>
      </CardContent>
    </Card>,
  );
};

export default PriceChart;
