import { Prisma } from ".prisma/client";
import { ac, actions } from "@/actions";
import { Answer, AnswerForm } from "@/answer";
import { MarkdownViewer } from "@/markdown";
import { prisma } from "@/prisma";
import {
  Collect,
  QuestionDate,
  QuestionMetrics,
  QuestionTitle,
} from "@/question";
import { ISearchParams } from "@/search-params";
import {
  DownVote,
  EditAndDelete,
  IActionFn,
  IAnswer,
  IPageProps,
  migratePage,
  ModelFilter,
  PagePagination,
  ScrollIntoHashElement,
  UpVote,
} from "@/shared";
import { Tags } from "@/tag";
import { UserAvatar } from "@/user";
import { NextPage } from "next";
import { redirect } from "next/navigation";

interface IQuestionDetailPageProps
  extends IPageProps<{ id: string }, ISearchParams> {}

const QuestionDetailPage: NextPage<IQuestionDetailPageProps> = migratePage(
  async (props) => {
    const { params, searchParams } = props;
    const { id } = params;

    const user = await actions.user.getCurrent();
    const [question, { items: answers, total: answerTotal }] =
      await Promise.all([
        prisma.question.update({
          where: {
            id,
          },
          data: {
            views: {
              increment: 1,
            },
          },
          include: {
            author: true,
            tags: true,
            upvotes: true,
            downvotes: true,
            collectors: true,
          },
        }),
        prisma.answer.search({
          include: {
            author: true,
            downvotes: true,
            upvotes: true,
          },
          where: {
            question: {
              id,
            },
          },
          searchParams,
        }),
      ]);

    const answer = searchParams.answerId
      ? await prisma.answer.findUnique({
          where: {
            id: searchParams.answerId,
          },
          include: {
            author: true,
            downvotes: true,
            upvotes: true,
          },
        })
      : null;

    const { author, tags, upvotes, downvotes, collectors, views } = question;

    const upVoted = !!(user && upvotes.find((x) => x.id === user.id));
    const downVoted = !!(user && downvotes.find((x) => x.id === user.id));
    const collected = !!(user && collectors.find((x) => x.id === user.id));

    const bindQuestionAction = (actionFn: IActionFn) => {
      return ac(actionFn)
        .bindArgs(question)
        .bindRevalidatePath(`/question/${id}`);
    };

    const onEdit = async () => {
      "use server";
      redirect(`/question/edit/${question.id}`);
    };

    const bindAnswerAction = (actionFn: IActionFn, answer: IAnswer) => {
      return ac(actionFn)
        .bindArgs(answer)
        .bindRevalidatePath(`/question/${id}`);
    };

    const editable = user?.id === author.id;

    return (
      <div>
        <div className="flex flex-wrap justify-between gap-4">
          <UserAvatar size="large" user={author} />

          <div className="flex gap-5">
            <UpVote
              count={question.upvotes.length}
              voted={upVoted}
              onChange={bindQuestionAction(actions.question.upVote)}
            />

            <DownVote
              count={question.downvotes.length}
              voted={downVoted}
              onChange={bindQuestionAction(actions.question.downVote)}
            />

            <Collect
              collected={collected}
              onChange={bindQuestionAction(actions.question.collect)}
            />
          </div>
        </div>

        <QuestionTitle className="mt-3.5" level={2} question={question} />

        <div className="mb-8 mt-5 flex flex-wrap gap-4">
          <QuestionDate question={question} variant="with-icon" />
          <QuestionMetrics answers={answers.length} views={views} />
        </div>

        <MarkdownViewer value={question.content} />

        <div className="mt-3.5 flex justify-between gap-6 max-sm:flex-col">
          <Tags tags={tags} />
          {editable && (
            <EditAndDelete
              className="h-[30px]"
              onDelete={ac(actions.question.remove).bindArgs(question)}
              onEdit={onEdit}
            />
          )}
        </div>

        {answer && (
          <Answer
            answer={answer}
            author={answer.author}
            downVote={{
              count: answer.downvotes.length,
              voted: user
                ? !!answer.downvotes.find((x) => x.id === user.id)
                : false,
              onChange: bindAnswerAction(actions.answer.downVote, answer),
            }}
            editable={editable}
            upVote={{
              count: answer.upvotes.length,
              voted: user
                ? !!answer.upvotes.find((x) => x.id === user.id)
                : false,
              onChange: bindAnswerAction(actions.answer.upVote, answer),
            }}
            onAnswerSave={bindAnswerAction(actions.answer.update, answer)}
            onDelete={bindAnswerAction(actions.answer.remove, answer)}
          />
        )}

        <div
          className="mt-8 flex flex-wrap items-center justify-between"
          id="answer-filter"
        >
          <h3 className="primary-text-gradient">{answerTotal} Answers</h3>
          <ModelFilter name={Prisma.ModelName.Answer} />
        </div>

        {answers.map((answer) => {
          const editable = answer.authorId === user?.id;
          return (
            <Answer
              key={answer.id}
              answer={answer}
              author={answer.author}
              downVote={{
                count: answer.downvotes.length,
                voted: user
                  ? !!answer.downvotes.find((x) => x.id === user.id)
                  : false,
                onChange: bindAnswerAction(actions.answer.downVote, answer),
              }}
              editable={editable}
              upVote={{
                count: answer.upvotes.length,
                voted: user
                  ? !!answer.upvotes.find((x) => x.id === user.id)
                  : false,
                onChange: bindAnswerAction(actions.answer.upVote, answer),
              }}
              onAnswerSave={bindAnswerAction(actions.answer.update, answer)}
              onDelete={bindAnswerAction(actions.answer.remove, answer)}
            />
          );
        })}

        <PagePagination
          className="mt-10"
          hrefHash="answer-filter"
          total={answerTotal}
        />

        <AnswerForm onSubmit={bindQuestionAction(actions.answer.create)} />
        <ScrollIntoHashElement />
      </div>
    );
  },
);

export default QuestionDetailPage;
