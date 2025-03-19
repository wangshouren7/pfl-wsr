import type React from "react";

export interface IComponentBaseProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface IControllableComponentProps<TValue> {
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value: TValue) => void;
  disabled?: boolean;
}

export interface IPageProps<
  TParams = Record<string, string>,
  TSearchParams = Record<string, string>,
> {
  params: TParams;
  searchParams: TSearchParams;
}
