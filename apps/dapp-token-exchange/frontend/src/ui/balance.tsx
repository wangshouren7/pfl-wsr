"use client";

import React from "react";
import {
  Button,
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
  IComponentBaseProps,
  mp,
} from "@pfl-wsr/ui";
import { useBalanceUI } from "@/domains/balance/use-balance-ui";
import { PanelCard } from "./panel-card";

const Balance: React.FC<IComponentBaseProps> = (props) => {
  const { getValue, onDeposit, onWithDraw, onChangeValue, tokens, refresh } =
    useBalanceUI();

  return mp(
    props,
    <PanelCard
      title={"Balance"}
      extra={<ReloadIcon cursor="pointer" onClick={refresh} />}
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
                  <Button
                    disabled={!((getValue(token.address) ?? 0) > 0)}
                    onClick={() => onDeposit(token.address)}
                  >
                    Deposit
                  </Button>
                  <Button
                    disabled={!((getValue(token.address) ?? 0) > 0)}
                    onClick={() => onWithDraw(token.address)}
                  >
                    Withdraw
                  </Button>
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
