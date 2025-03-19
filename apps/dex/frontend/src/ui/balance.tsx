"use client";

import React from "react";
import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  ReloadIcon,
  type IComponentBaseProps,
  mp,
} from "@pfl-wsr/ui";
import { useBalanceUI } from "@/domains/balance/use-balance-ui";
import { PanelCard } from "./panel-card";
import { AsyncButton } from "./async-button";

const Balance: React.FC<IComponentBaseProps> = (props) => {
  const { getValue, onDeposit, onWithDraw, onChangeValue, tokens, refresh } =
    useBalanceUI();

  return mp(
    props,
    <PanelCard
      requireConnect
      action={<ReloadIcon cursor="pointer" onClick={refresh} />}
      title={"Balance"}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Exchange</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead>Operations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => (
            <TableRow key={token.address}>
              <TableCell className="font-medium">{token.name}</TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{token.exchangeAmountFormatted}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {token.exchangeAmountFormatted}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{token.walletAmountFormatted}</span>
                  </TooltipTrigger>
                  <TooltipContent>{token.walletAmountFormatted}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Input
                    className="min-w-20"
                    type="number"
                    value={getValue(token.address) ?? ""}
                    onChange={(e) =>
                      onChangeValue(token.address, +e.target.value)
                    }
                  />
                  <AsyncButton
                    disabled={!((getValue(token.address) ?? 0) > 0)}
                    variant={"secondary"}
                    onClick={() => onDeposit(token.address)}
                  >
                    Deposit
                  </AsyncButton>
                  <AsyncButton
                    disabled={!((getValue(token.address) ?? 0) > 0)}
                    variant={"secondary"}
                    onClick={() => onWithDraw(token.address)}
                  >
                    Withdraw
                  </AsyncButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PanelCard>,
  );
};

export { Balance };
