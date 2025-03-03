import { actions } from "@/actions";
import { prisma } from "@/prisma";
import { MODEL_NAME } from "@/prisma/model-config";
import {
  Button,
  IPageProps,
  List,
  migratePage,
  NoResults,
  REPUTATION_CAN_CREATE_TAGS,
} from "@/shared";
import { TagCard } from "@/tag";
import Link from "next/link";
import React from "react";

const TagsPage: React.FC<IPageProps<{}, { q: string }>> = migratePage(
  async (props) => {
    const { searchParams } = props;

    const { items: tags, total } = await prisma.tag.search({
      include: { questions: true },
      searchParams,
    });

    const user = await actions.user.getCurrent();

    return (
      <List
        empty={
          <NoResults
            description="It appears that there are not tags found at the moment 😔. Ask a Question and kickstart the
          discussion with tags. our query could be the next big thing others learn from. Get
          involved! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
            topic="Tags"
          />
        }
        items={tags}
        modelFilter={{
          name: MODEL_NAME.Tag,
        }}
        renderItem={(tag) => (
          <TagCard tag={tag} totalQuestions={tag.questions.length} />
        )}
        search={{ placeholder: "Search by tag name..." }}
        title={"Tags"}
        titleExtra={
          user &&
          user.reputation > REPUTATION_CAN_CREATE_TAGS && (
            <Link
              className="flex justify-end max-sm:w-full"
              href="/tags/create"
            >
              <Button
                className="min-h-[46px] w-full"
                variant={"primary-gradient"}
              >
                Create New Tag
              </Button>
            </Link>
          )
        }
        total={total}
      />
    );
  },
);

export default TagsPage;
