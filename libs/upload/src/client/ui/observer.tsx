import { useObservable } from "rcrx";
import React from "react";
import { Observable } from "rxjs";

export type IObservableOrValue<T> = Observable<T> | T;

export interface IObserverProps<T> {
  observable: IObservableOrValue<T>;
  children: (value: T) => React.ReactNode;
}

/**
 * A Component wrapper to render Rx observables
 * @param props
 * @returns
 */
export const Observer = <T,>(props: IObserverProps<T>) => {
  const { observable } = props;
  if (observable instanceof Observable) {
    return <ObserverObservable {...props} />;
  }

  return <ObserverValue {...props} />;
};

const ObserverValue = <T,>(props: IObserverProps<T>) => {
  const { observable, children } = props;

  return children(observable as T);
};

const ObserverObservable = <T,>(props: IObserverProps<T>) => {
  const { observable, children } = props;

  const value = useObservable(observable as Observable<T>, undefined);
  return value === undefined ? null : children(value);
};
