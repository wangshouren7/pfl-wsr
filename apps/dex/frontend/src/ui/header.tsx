import React from "react";
import { ConnectWallet } from "./connect-wallet";
import { ThemeSwitch } from "./theme-switch";

export const Header: React.FC = () => {
  return (
    <header className="flex w-full items-center justify-between border-b p-4">
      <h1>Dex</h1>

      <div className="flex items-center gap-4">
        <ThemeSwitch />
        <ConnectWallet />
      </div>
    </header>
  );
};
