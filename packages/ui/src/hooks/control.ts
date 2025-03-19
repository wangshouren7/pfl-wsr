import { useEventTarget } from "ahooks";
import type { Options } from "ahooks/lib/useEventTarget";

interface EventTarget<U> {
  target: {
    value: U;
  };
}

export function useControl<T, U = T>(options?: Options<T, U>) {
  const [value, { onChange, reset }] = useEventTarget<T, U>(options);

  /**
   * Directly use onChange as return value will cause error and no dts file
   * emitted:
   *
   * @pfl-wsr/ui:compile:watch: (!) [plugin typescript] src/hooks/control.ts (4:17): @rollup/plugin-typescript TS4058: Return type of exported function has or is using name 'EventTarget' from external module "/Users/wangshouren/workspace/private/pfl-wsr/node_modules/.pnpm/ahooks@3.8.4_react@19.0.0/node_modules/ahooks/lib/useEventTarget/index" but cannot be named.
   */
  return [
    { value, onChange: onChange as (e: EventTarget<U>) => void },
    reset,
  ] as const;
}
