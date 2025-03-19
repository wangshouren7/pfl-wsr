import { Button, useAsyncFn } from "@pfl-wsr/ui";
import React, { type ComponentProps } from "react";

interface IAsyncButtonProps
  extends Omit<ComponentProps<typeof Button>, "onClick"> {
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
  loading?: boolean;
}

export const AsyncButton: React.FC<IAsyncButtonProps> = ({
  loading: propLoading,
  onClick: propOnClick,
  disabled: propDisabled,
  ...props
}) => {
  const [{ loading }, onClick] = useAsyncFn(
    propOnClick ?? (() => Promise.resolve()),
  );

  const finalLoading = loading || propLoading;
  const finalDisabled = finalLoading || propDisabled;

  return (
    <Button {...props} disabled={finalDisabled} onClick={onClick}>
      {finalLoading && <span className="loading loading-spinner"></span>}
      {props.children}
    </Button>
  );
};
