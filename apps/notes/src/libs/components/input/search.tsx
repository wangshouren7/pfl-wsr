"use client";

import { IconClose } from "@libs/components/icon/close";
import { IComponentBaseProps, mp, useRouter } from "@pfl-wsr/ui";
import { useControllableValue, useDebounceEffect } from "ahooks";
import { omit } from "lodash-es";
import React, { ComponentProps, useTransition } from "react";

interface ISearchInputProps
  extends IComponentBaseProps,
    ComponentProps<"input"> {
  searchParamKey?: string;
}

export const InputSearch: React.FC<ISearchInputProps> = (props) => {
  const { searchParamKey } = props;

  const { replaceSearchParams, searchParams } = useRouter();
  const [value, onChange] = useControllableValue(props, {
    defaultValue:
      props.defaultValue ??
      (searchParamKey ? (searchParams.get(searchParamKey) ?? "") : ""),
  });

  const [_, startTransition] = useTransition();
  useDebounceEffect(() => {
    if (searchParamKey) {
      startTransition(() => {
        replaceSearchParams?.({ [searchParamKey]: value });
      });
    }
  }, [value, startTransition, replaceSearchParams, searchParamKey]);

  return mp(
    props,
    <div className="bg-secondary flex items-center overflow-hidden rounded-2xl px-10 py-3">
      <input
        {...omit(props, ["className", "style"])}
        className="bg-secondary text-secondary placeholder:text-secondary flex-1 overflow-hidden border-none text-lg focus:outline-none"
        placeholder="Search by keyword..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <IconClose
        className="cursor-pointer"
        hidden={!value}
        onClick={() => onChange("")}
      />
    </div>
  );
};
