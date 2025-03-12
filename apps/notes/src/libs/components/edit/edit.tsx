"use client";

import { Note } from ".prisma/client";
import { ButtonIcon } from "@libs/components/button/icon";
import { IconEdit } from "@libs/components/icon/edit";
import { IconPreview } from "@libs/components/icon/preview";
import { InputContent } from "@libs/components/input/content";
import { InputTitle } from "@libs/components/input/title";
import { Back } from "@libs/router/back";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  useForm,
  useRouter,
} from "@pfl-wsr/ui";
import { useControllableValue, useRequest } from "ahooks";
import React from "react";
import { HeaderLayout } from "../layout/header";
import { SaveButtonForAdd, SaveButtonForEdit } from "./save-button";
import { ENoteEditMode } from "./types";
import { INoteValidationInfer, noteValidation } from "./validation";

interface INoteEditProps {
  defaultMode?: ENoteEditMode;
  note?: Note;
  actions?: {
    save: (note: INoteValidationInfer) => Promise<void> | void;
  };
}

export const NoteEdit: React.FC<INoteEditProps> = (props) => {
  const { defaultMode = ENoteEditMode.Edit, note, actions } = props;

  const [mode, changeMode] = useControllableValue(props, {
    defaultValue: defaultMode,
    defaultValuePropName: "defaultMode",
  });

  const readOnly = mode === ENoteEditMode.Preview;
  const form = useForm<INoteValidationInfer>({
    schema: noteValidation,
    defaultValues: note,
  });
  const { router } = useRouter();

  const { run: submit, loading } = useRequest(
    async (note) => {
      const isDirty = form.formState.isDirty;
      if (!isDirty) {
        return router?.back();
      }

      return actions?.save(note);
    },
    {
      manual: true,
    }
  );

  const isEdit = !!note;
  const isAdd = !note;
  return (
    <Form {...form}>
      <form
        className="flex size-full flex-col gap-10"
        onSubmit={form.handleSubmit(submit)}
      >
        <HeaderLayout
          left={<Back />}
          right={
            <>
              <ButtonIcon
                hidden={!readOnly}
                type="button"
                onClick={() => changeMode(ENoteEditMode.Edit)}
              >
                <IconEdit />
              </ButtonIcon>

              <ButtonIcon
                hidden={readOnly}
                type="button"
                onClick={() => changeMode(ENoteEditMode.Preview)}
              >
                <IconPreview />
              </ButtonIcon>

              {isEdit && (
                <SaveButtonForEdit
                  disabled={!form.formState.isValid}
                  type={!form.formState.isDirty ? "submit" : undefined}
                />
              )}
              {isAdd && (
                <SaveButtonForAdd
                  // disabled={!form.formState.isValid}
                  type="submit"
                />
              )}
            </>
          }
        />

        {/* <FormField
          key={"title"}
          control={form.control}
          name={"title"}
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <InputTitle {...field} autoFocus readOnly={readOnly} />
                </FormControl>
              </FormItem>
            );
          }}
        /> */}

        <FormField
          key={"content"}
          control={form.control}
          name={"content"}
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <InputContent
                    {...field}
                    className="flex-1"
                    readOnly={readOnly}
                  />
                </FormControl>
              </FormItem>
            );
          }}
        />
      </form>
    </Form>
  );
};
