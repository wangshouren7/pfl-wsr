import { Card, CardContent, CardTitle } from "@npcs/ui";
import React from "react";

interface IOrderBookProps {}

export const OrderBook: React.FC<IOrderBookProps> = (props) => {
  return (
    <Card>
      <CardTitle>Order Book</CardTitle>
      <CardContent>Order Book</CardContent>
    </Card>
  );
};
