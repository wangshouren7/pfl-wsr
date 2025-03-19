import { toast, useMemoizedFn } from "@pfl-wsr/ui";
import { type Hash, isHash } from "viem";
import { useGetTransactionUrl } from "./use-get-transaction-url";

export const useTransactionFnWithToast = <
  T extends (...args: any) => Promise<Hash>,
>(
  fn: T,
) => {
  const runTransactionFn = useRunTransactionFnWithToast();

  return useMemoizedFn((...args: Parameters<T>) =>
    runTransactionFn(() => fn(...args)),
  );
};

export const useRunTransactionFnWithToast = () => {
  const getTransactionUrl = useGetTransactionUrl();

  return useMemoizedFn(async (fn: () => Promise<Hash>) => {
    const toastId = toast.loading("Sending transaction, please wait...");

    try {
      const tx = String(await fn());
      if (!isHash(tx)) {
        toast.success("Transaction sent successfully", { id: toastId });
        return;
      }

      const url = getTransactionUrl(tx);
      toast.success(
        <a className="!underline" href={url} rel="noreferrer" target="_blank">
          Transaction sent successfully
        </a>,
        { id: toastId },
      );
    } catch (error) {
      toast.error("Transaction sent failed", { id: toastId });
      throw error;
    }
  });
};
