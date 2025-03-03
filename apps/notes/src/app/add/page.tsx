import { faker } from "@faker-js/faker";
import { getCurrentUserOrThrow } from "@libs/actions/user";
import { NoteEdit } from "@libs/components/edit/edit";
import { ENoteEditMode } from "@libs/components/edit/types";
import { INoteValidationInfer } from "@libs/components/edit/validation";
import { prisma } from "@libs/prisma/client";
import { IPageProps } from "@npcs/ui";
import { redirect } from "next/navigation";
import React from "react";

const AddPage: React.FC<IPageProps> = async (props) => {
  const save = async ({ title, content }: INoteValidationInfer) => {
    "use server";

    await prisma.note.create({
      data: {
        title,
        content,
        // TODO user pick a color
        color: faker.color.rgb(),
        author: {
          connect: await getCurrentUserOrThrow(),
        },
      },
    });

    redirect("/");
  };

  return <NoteEdit actions={{ save }} defaultMode={ENoteEditMode.Edit} />;
};

export default AddPage;
