import { toast, useForm, useMemoizedFn } from "@pfl-wsr/ui";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { z } from "zod";
import { type Address, parseEther } from "viem";
import { contracts } from "@/contracts";
import { useAsyncFnWithToast } from "@/lib/use-async-fn-with-toast";

const NEW_ORDER_FORM_VALIDATION = z.object({
  price: z.coerce.number().gt(0),
  amount: z.coerce.number().gt(0),
});

export function useNewOrder() {
  const [tab, setTab] = useState<contracts.Exchange.EOrderType>(
    contracts.Exchange.EOrderType.BUY,
  );
  const form = useForm<z.infer<typeof NEW_ORDER_FORM_VALIDATION>>({
    defaultValues: {},
    schema: NEW_ORDER_FORM_VALIDATION,
  });
  const { writeContractAsync } = useWriteContract();

  const onSubmit = useAsyncFnWithToast(
    form.handleSubmit(
      async (values: z.infer<typeof NEW_ORDER_FORM_VALIDATION>) => {
        const { price, amount } = values;
        let tokenGet: Address;
        let amountGet: bigint;
        let tokenGive: Address;
        let amountGive: bigint;

        if (tab === contracts.Exchange.EOrderType.BUY) {
          tokenGet = contracts.Token.config.address;
          amountGet = parseEther(String(amount));
          tokenGive = contracts.ETHER_ADDRESS;
          amountGive = parseEther(String(price * amount)); // price here is how many ether per token
        } else {
          tokenGet = contracts.ETHER_ADDRESS;
          amountGet = parseEther(String(price * amount));
          tokenGive = contracts.Token.config.address;
          amountGive = parseEther(String(amount));
        }

        await writeContractAsync({
          ...contracts.Exchange.config,
          functionName: "makeOrder",
          args: [tokenGet, amountGet, tokenGive, amountGive],
        });
      },
    ),
    {
      success: "Order created",
    },
  );

  return {
    tab,
    setTab,
    form,
    onSubmit,
  };
}
