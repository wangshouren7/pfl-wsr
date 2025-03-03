import Link from "next/link";

import { prisma } from "@/prisma";
import { MODEL_NAME } from "@/prisma/model-config";
import { QuestionList } from "@/question";
import { Button, IPageProps, migratePage, NoResults } from "@/shared";

export default migratePage(async function Home(props: IPageProps) {
  const { searchParams } = props;

  const { items: questions, total } = await prisma.question.search({
    searchParams,
    include: {
      author: true,
      tags: true,
      upvotes: true,
    },
  });

  return (
    <QuestionList
      empty={
        <NoResults
          description="Be the first to break the silence! 🚀 Ask a Question and kickstart the
        discussion. our query could be the next big thing others learn from. Get
        involved! 💡"
          link="/ask-question"
          linkTitle="Ask a Question"
          topic="questions"
        />
      }
      getAuthor={(question) => question.author}
      getTags={(question) => question.tags}
      getVotes={(question) => question.upvotes}
      modelFilter={{
        name: MODEL_NAME.Question,
      }}
      questions={questions}
      search={{
        placeholder: "Search for amazing minds",
      }}
      title={"All Questions"}
      titleExtra={
        <Link className="flex justify-end max-sm:w-full" href="/ask-question">
          <Button className="min-h-[46px] w-full" variant={"primary-gradient"}>
            Ask a Question
          </Button>
        </Link>
      }
      total={total}
    />
  );
});
