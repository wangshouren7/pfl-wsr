import { IComponentBaseProps, IQuestion, mp } from "@/shared";
import Link from "next/link";
import React from "react";

export interface IQuestionTitleProps extends IComponentBaseProps {
  level: 2 | 3;
  question: IQuestion;
}

export const QuestionTitle: React.FC<IQuestionTitleProps> = (props) => {
  const {
    level,
    question: { title, id },
  } = props;

  let node: React.ReactElement<any> = <></>;
  if (level === 2) {
    node = (
      <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
        {title}
      </h2>
    );
  } else if (level === 3) {
    node = (
      <h3 className="sm:h3-semibold base-semibold text-dark200_light900">
        {title}
      </h3>
    );
  }

  return mp(props, <Link href={`/question/${id}`}>{node}</Link>);
};
