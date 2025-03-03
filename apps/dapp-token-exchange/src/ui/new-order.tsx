import { Card, CardContent, CardTitle } from "@npcs/ui";
import React from "react";

interface INewOrderProps {}

export const NewOrder: React.FC<INewOrderProps> = (props) => {
  return (
    <Card>
      <CardTitle>New Order</CardTitle>
      <CardContent>New Order</CardContent>
    </Card>
  );
};
