import { Card } from "@npcs/ui";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

export const Header: React.FC = (props) => {
  return (
    <header className="flex w-full items-center justify-between border-b p-4">
      <h1>Dapp Token Exchange</h1>

      <div>
        <ConnectButton />
      </div>
    </header>
  );
};
