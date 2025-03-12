"use client";

import { Note } from ".prisma/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  cn,
  IComponentBaseProps,
  mp,
} from "@pfl-wsr/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { IconTrash } from "../icon/trash";

export interface INoteCardProps extends IComponentBaseProps {
  note: Note;
  actions?: {
    remove: (note: Note, pathname: string) => Promise<void> | void;
  };
}

export const NoteCard: React.FC<INoteCardProps> = (props) => {
  const { note, actions } = props;
  const pathname = usePathname();

  return mp(
    props,
    <Carousel className="mb-7 w-full">
      <CarouselContent>
        <CarouselItem key={"card"}>
          <Link href={`/view/${note.id}`}>
            <div
              className="rounded-md px-11 py-7 text-xl text-black"
              style={{ background: note.color }}
            >
              {note.title}
            </div>
          </Link>
        </CarouselItem>

        <CarouselItem key={"trash"}>
          <div
            className={cn(
              "rounded-md size-full bg-red-300 flex cursor-pointer"
            )}
            onClick={() => actions?.remove(note, pathname)}
          >
            <IconTrash className="m-auto" />
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
};

export interface INoteCardsProps {
  notes: Note[];
  actions?: {
    remove: (note: Note, pathname: string) => Promise<void>;
  };
}

export const NoteCards: React.FC<INoteCardsProps> = ({ notes, actions }) => {
  return (
    <>
      {notes.map((note) => {
        return <NoteCard key={note.id} actions={actions} note={note} />;
      })}
    </>
  );
};
