import { prisma } from "@/prisma";
import { QuestionList } from "@/question";
import { IPageProps, NoResults } from "@/shared";
import Link from "next/link";
import React from "react";

const TagsDetailPage: React.FC<IPageProps<{ id: string }>> = async (props) => {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { id } = params;

  const [tag, { items: questions, total }] = await Promise.all([
    prisma.tag.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        creator: true,
      },
    }),
    prisma.question.search({
      where: {
        tags: {
          some: {
            id,
          },
        },
      },
      include: {
        author: true,
        tags: true,
        upvotes: true,
      },
      searchParams,
    }),
  ]);
  return (
    <QuestionList
      description={tag.description}
      empty={
        <NoResults
          description="Be the first to break the silence! 🚀 Ask a Question and kickstart the
        discussion. our query could be the next big thing others learn from. Get
        involved! 💡"
          link="/ask-question"
          linkTitle="Ask a question"
          topic="Tag Questions"
        />
      }
      getAuthor={(question) => question.author}
      getTags={(question) => question.tags}
      getVotes={(question) => question.upvotes}
      questions={questions}
      search={{
        placeholder: "Search tag questions...",
      }}
      title={<Link href={`/tags/${tag.id}`}>{tag.name}</Link>}
      total={total}
    />
  );
};

export default TagsDetailPage;
