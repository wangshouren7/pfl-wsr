import { ButtonFixed } from "@libs/components/button/float";
import { ButtonIcon } from "@libs/components/button/icon";
import { NoteCardsRSC } from "@libs/components/card/rsc";
import { IconPlus } from "@libs/components/icon/plus";
import { IconSearch } from "@libs/components/icon/search";
import { ImageFirstNote } from "@libs/components/image/first-note";
import { InfoButton } from "@libs/components/info";
import { HeaderLayout } from "@libs/components/layout/header";
import { prisma } from "@libs/prisma/client";
import { IPageProps } from "@pfl-wsr/ui";
import Link from "next/link";
import React from "react";

const Page: React.FC<IPageProps> = async (props) => {
  const notes = await prisma.note.findMany();
  return (
    <div className="flex size-full flex-col">
      <HeaderLayout
        left={<h1 className="text-3xl font-semibold">Notes</h1>}
        right={
          <>
            <Link href={"/search"}>
              <ButtonIcon>
                <IconSearch />
              </ButtonIcon>
            </Link>

            <InfoButton />
          </>
        }
      />

      <NoteCardsRSC notes={notes} />

      {notes.length === 0 && (
        <div
          className="mt-[-10px] flex flex-1 flex-col justify-center"
          hidden={notes.length > 0}
        >
          <ImageFirstNote className="mx-auto" height={286} width={350} />
          <div className="text-center text-lg">Create your first note !</div>
        </div>
      )}

      <Link className="fixed bottom-[60px] right-[46px]" href={"/add"}>
        <ButtonFixed>
          <IconPlus />
        </ButtonFixed>
      </Link>
    </div>
  );
};

export default Page;
