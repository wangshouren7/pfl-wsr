import { Card, CardContent, CardTitle } from "@npcs/ui";
import React from "react";

interface IMyTransactionsProps {}

export const MyTransactions: React.FC<IMyTransactionsProps> = (props) => {
  return (
    <Card>
      <CardTitle>My Transactions</CardTitle>
      <CardContent>My Transactions</CardContent>
    </Card>
  );
};
