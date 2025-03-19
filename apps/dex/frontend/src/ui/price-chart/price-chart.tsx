"use client";
import { type IComponentBaseProps, mp } from "@pfl-wsr/ui";
import React, { useEffect, useRef, useState } from "react";

import {
  type CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  type Time,
  type ISeriesApi,
  type IChartApi,
} from "lightweight-charts";
import { useChartData } from "@/domains/chart/use-chart-data";
import { logger } from "@/lib/logger";
import { PanelCard } from "../panel-card";
import { useTheme } from "next-themes";
import dayjs from "dayjs";

const PriceChart: React.FC<IComponentBaseProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [series, setSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const { theme } = useTheme();
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    open: string;
    high: string;
    low: string;
    close: string;
    time: string;
    position: { x: number; y: number };
  }>({
    visible: false,
    open: "",
    high: "",
    low: "",
    close: "",
    time: "",
    position: { x: 0, y: 0 },
  });

  const { chartData } = useChartData();

  // Add ref for tooltip container
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartData || !series) return;

    series?.setData(chartData as unknown as CandlestickData<Time>[]);
  }, [chartData, series]);

  useEffect(() => {
    const chart = createChart(ref.current!, {
      layout: {
        textColor: "white",
        background: { type: ColorType.Solid, color: "#121212" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        visible: true,
        borderColor: theme === "dark" ? "#333" : "#ccc",
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: "#758696",
          style: 0,
        },
        horzLine: {
          width: 1,
          color: "#758696",
          style: 0,
        },
      },
    });
    setChart(chart);

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    setSeries(candlestickSeries);

    chart.timeScale().fitContent();

    // Subscribe to crosshair move to show tooltip
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        setTooltip((prev) => ({ ...prev, visible: false }));
        return;
      }

      const data = param.seriesData.get(candlestickSeries) as CandlestickData;
      if (!data) {
        setTooltip((prev) => ({ ...prev, visible: false }));
        return;
      }

      // Find the actual chart data point to get the timeFormatted
      const timestamp = param.time as number;
      const currentPoint = chartData?.find((point) => point.time === timestamp);

      debugger;
      // Calculate position, but don't apply yet - we'll adjust in the useEffect below
      setTooltip({
        visible: true,
        open: data.open !== undefined ? data.open.toFixed(6) : "",
        high: data.high !== undefined ? data.high.toFixed(6) : "",
        low: data.low !== undefined ? data.low.toFixed(6) : "",
        close: data.close !== undefined ? data.close.toFixed(6) : "",
        time:
          currentPoint?.timeFormatted ||
          dayjs.utc(timestamp * 1000).format("YYYY-MM-DD HH:mm"),
        position: {
          x: param.point.x,
          y: param.point.y,
        },
      });
    });

    const handleResize = () => {
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

  logger.withTag("price-chart").info("theme", theme);

  useEffect(() => {
    if (!chart) return;

    logger.withTag("price-chart").info("apply theme", theme);

    chart.applyOptions({
      layout: {
        textColor: theme === "dark" ? "white" : "black",
        background: {
          type: ColorType.Solid,
          color: theme === "dark" ? "#121212" : "white",
        },
      },
    });
  }, [chart, theme]);

  // Add useEffect to adjust tooltip position
  useEffect(() => {
    if (!tooltip.visible || !tooltipRef.current || !containerRef.current)
      return;

    const tooltipElement = tooltipRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Get tooltip dimensions
    const tooltipRect = tooltipElement.getBoundingClientRect();

    // Default position (10px offset)
    let left = tooltip.position.x + 10;
    let top = tooltip.position.y + 10;

    // Check if tooltip goes beyond right edge
    if (left + tooltipRect.width > containerRect.width) {
      left = tooltip.position.x - tooltipRect.width - 10; // Position to the left of cursor
    }

    // Check if tooltip goes beyond bottom edge
    if (top + tooltipRect.height > containerRect.height) {
      top = tooltip.position.y - tooltipRect.height - 10; // Position above cursor
    }

    // Ensure tooltip doesn't go beyond left or top edge
    left = Math.max(0, left);
    top = Math.max(0, top);

    // Apply position
    tooltipElement.style.left = `${left}px`;
    tooltipElement.style.top = `${top}px`;
  }, [tooltip.visible, tooltip.position]);

  return mp(
    props,
    <PanelCard title="Price Chart">
      <div ref={containerRef} className="relative h-full overflow-hidden">
        <div ref={ref} className="h-full"></div>
        {tooltip.visible && (
          <div
            ref={tooltipRef}
            className="absolute z-10 rounded-md bg-black/80 p-2 text-sm text-white shadow-lg dark:bg-white/80 dark:text-black"
          >
            <div className="font-semibold">{tooltip.time}</div>
            <div className="grid grid-cols-2 gap-x-3">
              <div>Open:</div>
              <div className="text-right">{tooltip.open}</div>
              <div>High:</div>
              <div className="text-right text-green-400">{tooltip.high}</div>
              <div>Low:</div>
              <div className="text-right text-red-400">{tooltip.low}</div>
              <div>Close:</div>
              <div className="text-right font-medium">{tooltip.close}</div>
            </div>
          </div>
        )}
      </div>
    </PanelCard>,
  );
};

export default PriceChart;
