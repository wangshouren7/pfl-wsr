"use client";
import { Balance } from "@/ui/balance";
import { MyTransactions } from "@/ui/my-transactions";
import { NewOrder } from "@/ui/new-order";
import { OrderBook } from "@/ui/order-book";
import { PriceChart } from "@/ui/price-chart";
import { Trades } from "@/ui/trades";
import { useAccount } from "wagmi";

function Page() {
  const { address: account } = useAccount();
  return (
    <div className="max-lg::!grid-cols-2 grid h-full grid-cols-5 gap-2 max-2xl:grid-cols-3">
      <div className="flex flex-col gap-2">
        <div>{account && <Balance account={account} />}</div>
        <div>
          <NewOrder />
        </div>
      </div>

      <div>
        <OrderBook />
      </div>

      <div>
        <Trades />
      </div>

      <div className="col-span-2 flex flex-col gap-2 max-2xl:col-span-3">
        <div>
          <PriceChart />
        </div>

        <div>
          <MyTransactions />
        </div>
      </div>
    </div>
  );
}

export default Page;
