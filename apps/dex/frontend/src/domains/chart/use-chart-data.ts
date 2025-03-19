import { first, groupBy, last, maxBy, minBy } from "lodash-es";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useMemo } from "react";
import { useTrades } from "../trades/use-trades";

dayjs.extend(utc);

export const useChartData = () => {
  const { trades } = useTrades();

  const chartData = useMemo(() => {
    const grouped = groupBy(trades?.all ?? [], (trade) => {
      return dayjs.utc(trade.time).set("minute", 0).set("second", 0).valueOf();
    });
    return Object.values(grouped).map((trades) => {
      const time = dayjs.utc(trades[0].time).set("minute", 0).set("second", 0);
      return {
        open: first(trades)?.tokenPrice ?? 0,
        high: maxBy(trades, "tokenPrice")?.tokenPrice ?? 0,
        low: minBy(trades, "tokenPrice")?.tokenPrice ?? 0,
        close: last(trades)?.tokenPrice ?? 0,
        time: time.valueOf() / 1000,
        timeFormatted: time.format("YYYY-MM-DD HH:mm"),
      };
    });
  }, [trades]);

  return { chartData };
};
