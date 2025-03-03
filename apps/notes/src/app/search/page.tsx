import { NoteCardsRSC } from "@libs/components/card/rsc";
import { ImageNotFound } from "@libs/components/image/not-found";
import { InputSearch } from "@libs/components/input/search";
import { HeaderLayout } from "@libs/components/layout/header";
import { prisma } from "@libs/prisma/client";
import { Back } from "@libs/router/back";
import { migratePage } from "@libs/utils/migrations";
import { IPageProps } from "@npcs/ui";
import React from "react";

export const dynamic = "force-dynamic";

const SearchPage: React.FC<IPageProps<{}, { q: string }>> = migratePage(
  async (props) => {
    const q = (await props.searchParams).q;
    const notes = q
      ? await prisma.note.findMany({
          where: {
            title: {
              contains: (await props.searchParams).q,
              mode: "insensitive",
            },
          },
        })
      : [];

    return (
      <div className="flex size-full flex-col">
        <HeaderLayout
          left={<Back />}
          right={<InputSearch className="w-full" searchParamKey="q" />}
          rightClassName="flex-1 overflow-hidden"
        />

        <NoteCardsRSC notes={notes} />

        {notes.length === 0 && q && (
          <div
            className="mt-[-10px] flex flex-1 flex-col justify-center"
            hidden={notes.length > 0}
          >
            <ImageNotFound className="mx-auto" height={286} width={350} />
            <div className="text-center text-lg">
              File not found. Try searching again.
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default SearchPage;
