import { useForm, useMemoizedFn } from "@pfl-wsr/ui";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { z } from "zod";
import { type Address, parseEther } from "viem";
import { contracts } from "@/contracts";
import { useTransactionFnWithToast } from "@/lib/use-async-fn-with-toast";
import { useContractConfig } from "@/contract-config";

const NEW_ORDER_FORM_VALIDATION = z.object({
  price: z.coerce.number().gt(0),
  amount: z.coerce.number().gt(0),
});

export function useNewOrder() {
  const contractConfig = useContractConfig();
  const [tab, setTab] = useState<contracts.Exchange.EOrderType>(
    contracts.Exchange.EOrderType.BUY,
  );
  const form = useForm<z.infer<typeof NEW_ORDER_FORM_VALIDATION>>({
    defaultValues: {},
    schema: NEW_ORDER_FORM_VALIDATION,
  });
  const { writeContractAsync } = useWriteContract();

  const onSubmit = useMemoizedFn(
    form.handleSubmit(
      useTransactionFnWithToast(
        async (values: z.infer<typeof NEW_ORDER_FORM_VALIDATION>) => {
          const { price, amount } = values;
          let tokenGet: Address;
          let amountGet: bigint;
          let tokenGive: Address;
          let amountGive: bigint;

          if (tab === contracts.Exchange.EOrderType.BUY) {
            tokenGet = contractConfig.token.address;
            amountGet = parseEther(String(amount));
            tokenGive = contracts.ETHER_ADDRESS;
            amountGive = parseEther(String(price * amount)); // price here is how many ether per token
          } else {
            tokenGet = contracts.ETHER_ADDRESS;
            amountGet = parseEther(String(price * amount));
            tokenGive = contractConfig.token.address;
            amountGive = parseEther(String(amount));
          }

          const tx = await writeContractAsync({
            ...contractConfig.exchange,
            functionName: "makeOrder",
            args: [tokenGet, amountGet, tokenGive, amountGive],
          });

          return tx;
        },
      ),
    ),
  );

  return {
    tab,
    setTab,
    form,
    onSubmit,
  };
}
