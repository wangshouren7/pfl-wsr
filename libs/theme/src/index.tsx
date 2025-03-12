"use client";

import { mp } from "@pfl-wsr/ui";
import { useEffect, useRef, useTransition } from "react";
import { useStore } from "zustand";
import { IOptions, ISyncElementClass, IToggleTheme, IUseTheme } from "./shared";
import { createStore } from "./store";

function createTheme<TValue extends string>(options: IOptions<TValue>) {
  const { ui } = options;

  const store = createStore(options);

  const SyncElementClass: ISyncElementClass = ({ getContainer }) => {
    const { value } = useTheme();
    const lastValueRef = useRef<TValue | null>(null);

    useEffect(() => {
      const container = getContainer?.() ?? document.documentElement;
      const lastTheme = lastValueRef.current;
      if (lastTheme) {
        container.classList.remove(lastTheme);
      }
      container.classList.add(value);
      lastValueRef.current = value;
    }, [value, getContainer]);
    return null;
  };

  const useTheme: IUseTheme<TValue> = () => {
    return useStore(store);
  };

  const ToggleTheme: IToggleTheme = (props) => {
    const theme = useTheme();
    const [_, startTransition] = useTransition();

    return mp(
      props,
      <span
        className="cursor-pointer"
        onClick={() => {
          startTransition(theme.toggle);
        }}
      >
        {ui[theme.getIndex()].icon}
      </span>
    );
  };

  return {
    ToggleTheme,
    SyncElementClass,
    useTheme,
  };
}

export { createTheme };
