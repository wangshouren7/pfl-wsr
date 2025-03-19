import { Balance } from "@/ui/balance";
import { MyTransactions } from "@/ui/my-transactions";
import { NewOrder } from "@/ui/new-order";
import { OrderBook } from "@/ui/order-book";
import { PriceChart } from "@/ui/price-chart";
import { Trades } from "@/ui/trades";

export default function Page() {
  return (
    <div className="grid h-full min-h-[800px] min-w-[1600px] grid-cols-3 gap-4 overflow-auto p-4">
      <div className="grid grid-rows-2 gap-4 overflow-auto">
        <Balance />
        <NewOrder />
      </div>

      <div className="grid grid-rows-2 gap-4 overflow-auto">
        <OrderBook />
        <Trades />
      </div>

      <div className="grid grid-rows-2 gap-4 overflow-auto">
        <PriceChart />
        <MyTransactions />
      </div>
    </div>
  );
}
