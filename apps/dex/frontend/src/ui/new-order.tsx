"use client";

import { contracts } from "@/contracts";
import { useNewOrder } from "@/domains/order/use-new-order";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  type IComponentBaseProps,
  Input,
  mp,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@pfl-wsr/ui";
import React from "react";
import { PanelCard } from "./panel-card";
import { AsyncButton } from "./async-button";

export const NewOrder: React.FC<IComponentBaseProps> = (props) => {
  const { tab, setTab, form, onSubmit } = useNewOrder();

  return mp(
    props,
    <PanelCard requireConnect title={"New Order"}>
      <Tabs
        value={tab}
        onValueChange={(x) => setTab(x as contracts.Exchange.EOrderType)}
      >
        <TabsList>
          <TabsTrigger value={contracts.Exchange.EOrderType.BUY}>
            Buy
          </TabsTrigger>
          <TabsTrigger value={contracts.Exchange.EOrderType.SELL}>
            Sell
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <FormLabel className="w-[90px] capitalize">
                      {tab} Price
                    </FormLabel>
                    <FormControl className="flex-1">
                      <Input
                        placeholder="Price of the token"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                  </div>

                  <div className="flex flex-col pl-[90px]">
                    <FormDescription>
                      Describe the <span className="lowercase">{tab}</span>{" "}
                      price of the token.
                    </FormDescription>
                  </div>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <FormLabel className="w-[90px] capitalize">
                      {tab} Amount
                    </FormLabel>
                    <FormControl className="flex-1">
                      <Input
                        placeholder="Amount of the token"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                  </div>

                  <div className="flex flex-col pl-[90px]">
                    <FormDescription>
                      Describe the <span className="lowercase">{tab}</span>{" "}
                      amount of the token.
                    </FormDescription>
                  </div>
                </div>
              </FormItem>
            )}
          />

          <AsyncButton
            disabled={!form.formState.isValid}
            loading={form.formState.isSubmitting}
            type="submit"
          >
            Create <span className="capitalize">{tab}</span> Order
          </AsyncButton>
        </form>
      </Form>
    </PanelCard>,
  );
};
