import { actions } from "@/actions";
import { prisma } from "@/prisma";
import { MODEL_NAME } from "@/prisma/model-config";
import { QuestionList } from "@/question";
import { IPageProps, migratePage, NoResults } from "@/shared";

export default migratePage(async function CollectionPage(
  props: IPageProps<{}, { q: string }>,
) {
  const { searchParams } = props;
  const user = await actions.user.getCurrentOrRedirectSignIn();
  const { items: questions, total } = await prisma.question.search({
    searchParams,
    where: {
      collectors: {
        some: {
          id: user.id,
        },
      },
    },
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
      title={"Saved Questions"}
      total={total}
    />
  );
});
