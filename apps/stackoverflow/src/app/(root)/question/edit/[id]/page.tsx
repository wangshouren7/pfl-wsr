import { actions } from "@/actions";
import { prisma } from "@/prisma";
import { QuestionForm } from "@/question";
import { EFormType, IPageProps, migratePage } from "@/shared";
import { redirect } from "next/navigation";
import React from "react";

const QuestionEditPage: React.FC<IPageProps<{ id: string }>> = migratePage(
  async (props) => {
    const {
      params: { id },
    } = props;
    const user = await actions.user.getCurrentOrRedirectSignIn();
    const question = await prisma.question.findUniqueOrThrow({
      where: {
        id,
        authorId: user.id,
      },
      include: {
        tags: true,
      },
    });

    return (
      <div>
        <h1 className="h1-bold text-dark100_light900">Edit Question</h1>
        <QuestionForm
          className="mt-9"
          defaultValues={{
            explanation: question.content,
            tags: question.tags,
            title: question.title,
          }}
          type={EFormType.Edit}
          onSubmit={async (values) => {
            "use server";
            await actions.question.update(question, values);
            redirect(`/question/${question.id}`);
          }}
        />
      </div>
    );
  },
);

export default QuestionEditPage;
