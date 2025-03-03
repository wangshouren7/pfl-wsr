"use client";
import { useRequest } from "ahooks";
import { capitalCase } from "change-case";
import { capitalize, lowerCase } from "lodash-es";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { z } from "zod";
import { EFormTopic, EFormType } from "../constants";
import { ISafeAny } from "../types";
import {
  Button,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form as FormUI,
  IComponentBaseProps,
  Input,
  toast,
  useForm,
} from "../ui";
import { cn, mp, removeNilKeys } from "../utils";

import type { JSX } from "react";

type _IFormItem<
  TValues extends FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> =
  TName extends Path<TValues>
    ? {
        name: TName;
        label?: string;
        renderControl?: (
          field: ControllerRenderProps<TValues, TName>,
        ) => JSX.Element;
        description?: string;
        disabled?: boolean;
      }
    : never;

export type IFormItem<TValues extends FieldValues> = _IFormItem<TValues>;

export type IFormItems<TValues extends FieldValues> = IFormItem<TValues>[];

export type IFormPropsOnSubmit<TValues extends FieldValues> = (
  values: TValues,
) => void | Promise<void>;

export interface IFormProps<TSchema extends z.ZodObject<ISafeAny>>
  extends IComponentBaseProps {
  items: IFormItem<z.infer<TSchema>>[];
  onSubmit?: IFormPropsOnSubmit<z.infer<TSchema>>;
  getSubmitText?: (loading: boolean, type: EFormType) => React.ReactNode;
  /**
   * @default 'left'
   */
  submitAlign?: "left" | "right";
  extra?: React.ReactNode;
  defaultValues?: {
    [K in keyof z.infer<TSchema>]: z.infer<TSchema>[K] | null;
  };
  schema: TSchema;
  /**
   * @default EFormType.Post
   */
  type?: EFormType;
  topic?: EFormTopic;
}

export const FormBuilder = <TSchema extends z.ZodObject<ISafeAny>>(
  props: IFormProps<TSchema>,
) => {
  const {
    items,
    onSubmit,
    submitAlign = "left",
    extra,
    defaultValues,
    schema,
    type = EFormType.Post,
    getSubmitText = getDefaultSubmitText,
    topic,
  } = props;
  const { run, loading } = useRequest(async (values) => onSubmit?.(values), {
    manual: true,
    onSuccess() {
      if (topic) {
        toast({
          title: capitalize(`${topic} ${lowerCase(type)}ed successfully!`),
          variant: "default",
        });
      } else {
        toast({
          title: capitalize(`${lowerCase(type)}ed successfully!`),
          variant: "default",
        });
      }
    },
  });

  const form = useForm<z.infer<TSchema>>({
    schema,
    defaultValues: removeNilKeys(defaultValues ?? {}),
  });

  return (
    <FormUI {...form}>
      {mp(
        props,
        <form
          className="flex w-full flex-col gap-10"
          onSubmit={form.handleSubmit(run)}
        >
          {items.map(
            ({
              name,
              description,
              label,
              renderControl = defaultRenderControl,
              disabled,
            }) => (
              <FormField
                key={name}
                control={form.control}
                disabled={disabled === true}
                name={name}
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col gap-3">
                    <FormLabel className="paragraph-semibold text-dark400_light800">
                      {label && capitalCase(label)}
                      {!schema.shape[name]?.isOptional() && (
                        <span className="text-primary-500">*</span>
                      )}
                    </FormLabel>

                    <FormControl className="mt-3.5">
                      {renderControl(field as ISafeAny)}
                    </FormControl>
                    <FormDescription className="body-regular text-light-500 mt-2.5">
                      {description || schema.shape[name]?.description}
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            ),
          )}

          <div className="flex flex-wrap gap-4">
            <Button
              className={cn(submitAlign === "right" && "ml-auto", "capitalize")}
              disabled={loading}
              variant="primary-gradient"
            >
              {getSubmitText(loading, type)}
            </Button>
            {extra}
          </div>
        </form>,
      )}
    </FormUI>
  );
};

const getDefaultSubmitText = (loading: boolean, type: EFormType) => {
  return loading ? `${type}...` : type;
};

const defaultRenderControl = (
  field: ControllerRenderProps<ISafeAny, string>,
) => <Input {...field} />;
