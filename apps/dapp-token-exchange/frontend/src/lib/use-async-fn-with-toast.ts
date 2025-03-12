import { toast, useMemoizedFn } from "@pfl-wsr/ui";
import { isObject, isPlainObject, isString } from "lodash-es";
import React from "react";

type IOptions<T> = Parameters<typeof toast.promise<T>>[1];

export function useAsyncFnWithToast<
  TData,
  T extends (...args: any) => Promise<TData>,
>(fn: T, options?: IOptions<TData>) {
  return useMemoizedFn((...args: Parameters<T>) => {
    return new Promise<TData>((resolve, reject) => {
      const fnWrapper = async (...args: Parameters<T>) => {
        try {
          const data = await fn(...args);
          resolve(data);
          return data;
        } catch (error) {
          reject(error);
          throw error;
        }
      };

      toast.promise(fnWrapper(...args), {
        loading: "Loading...",
        ...options,
      });
    });
  });
}
