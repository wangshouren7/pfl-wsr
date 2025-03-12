import { IComponentBaseProps } from "@pfl-wsr/ui";

export interface IOptions<TValue extends string> {
  defaultValue: TValue;
  ui: Array<{ icon: React.ReactNode; value: TValue }>;
}

export interface IStore<T> {
  value: T;
  set: (theme: T) => void;
  toggle: () => void;
  getIndex: () => number;
  setIndex: (index: number) => void;
}

export type ISyncElementClass = React.FC<{ getContainer?: () => HTMLElement }>;

export type IToggleTheme = React.FC<IComponentBaseProps>;

export type IUseTheme<TValue extends string = any> = () => IStore<TValue>;
