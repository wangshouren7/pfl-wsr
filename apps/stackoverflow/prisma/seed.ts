import { mock } from "@/mock";
import { prisma } from "@/prisma";
import { type IQuestion, type IUser } from "@/shared";
import { createLog } from "@pfl-wsr/log";
import { random } from "lodash-es";
import { createLogUpdate } from "log-update";
import os from "node:os";

const log = createLog("seed");

const TAG_COUNT_EACH_USER = 5;
const BUILTIN_TAG_NAMES = ["react", "vue", "next.js", "javascript"];

async function getCounts() {
  const ANSWER_COUNT = 125000;
  const USER_COUNT = 50;
  const QUESTION_COUNT = 2500;
  const TAG_COUNT = 50 + BUILTIN_TAG_NAMES.length;

  const createdUserCount = USER_COUNT - (await prisma.user.count());
  const shouldCreateUser = createdUserCount > 0;

  const createdQuestionCount = QUESTION_COUNT - (await prisma.question.count());
  const shouldCreateQuestion = createdQuestionCount > 0;

  const createdAnswerCount = ANSWER_COUNT - (await prisma.answer.count());
  const shouldCreateAnswer = createdAnswerCount > 0;

  const createdTagCount = TAG_COUNT - (await prisma.tag.count());
  const shouldCreateTag = createdTagCount > 0;

  return {
    createdUserCount,
    createdQuestionCount,
    createdAnswerCount,
    createdTagCount,
    shouldCreateUser,
    shouldCreateQuestion,
    shouldCreateAnswer,
    shouldCreateTag,
  };
}
async function main() {
  if (process.env.__SEEDED__) {
    return;
  }

  process.env.__SEEDED__ = "true";

  await prisma.$transaction(async () => {
    const {
      createdAnswerCount,
      createdQuestionCount,
      createdTagCount,
      createdUserCount,
      shouldCreateAnswer,
      shouldCreateQuestion,
      shouldCreateTag,
      shouldCreateUser,
    } = await getCounts();

    let createdUsers: IUser[] = [];
    if (shouldCreateUser) {
      log.log("Creating users...");

      createdUsers = await prisma.user.createManyAndReturn({
        data: mock.user.createMany(createdUserCount),
        skipDuplicates: true,
      });
    }

    const users = await prisma.user.findMany({});
    const getRandomUser = () => users[random(0, users.length - 1)];

    if (shouldCreateTag) {
      log.log("Creating tags...");
      await prisma.tag.createMany({
        data: BUILTIN_TAG_NAMES.map((name) => ({
          name,
          description: `${name} tag`,
        }))
          .concat(
            mock.tag.createMany(createdTagCount - BUILTIN_TAG_NAMES.length),
          )
          .map((x) => ({
            ...x,
            creatorId: getRandomUser().id,
          })),
        skipDuplicates: true,
      });
    }

    const tags = await prisma.tag.findMany({});

    let createdQuestions: IQuestion[] = [];
    if (shouldCreateQuestion) {
      log.log("Creating questions...");
      createdQuestions = await prisma.question.createManyAndReturn({
        data: mock.question.createMany(createdQuestionCount).map((q) => ({
          ...q,
          authorId: getRandomUser().id,
        })),
        skipDuplicates: true,
      });
    }

    const questions = await prisma.question.findMany({});
    const getRandomQuestion = () => questions[random(0, questions.length - 1)];

    if (shouldCreateAnswer) {
      log.log("Creating answers...");
      await prisma.answer.createMany({
        data: mock.answer.createMany(createdAnswerCount).map((a) => ({
          ...a,
          authorId: getRandomUser().id,
          questionId: getRandomQuestion().id,
        })),
        skipDuplicates: true,
      });
    }

    const answers = await prisma.answer.findMany({});

    if (shouldCreateUser) {
      log.log("Updating users...");
      const updateUserLog = createLogUpdate(process.stdout, {
        showCursor: true,
      });
      const randomRange = (count: number) => [
        random(0, Math.floor(count / 4) - 1),
        random(Math.floor(count / 4), Math.floor(count / 2)),
        random(Math.floor(count / 2), Math.floor((count * 3) / 4) - 1),
        random(Math.floor((count * 3) / 4), count),
      ];
      const updateUserTasks = createdUsers.map((user, index) => async () => {
        updateUserLog(
          `Updating user ${index + 1} of ${createdUsers.length}...`,
        );
        const [
          upVoteQuestionStart,
          upVoteQuestionEnd,
          downVotesQuestionStart,
          downVotesQuestionEnd,
        ] = randomRange(questions.length);
        const [
          upVoteAnswerStart,
          upVoteAnswerEnd,
          downVoteAnswerStart,
          downVoteAnswerEnd,
        ] = randomRange(answers.length);
        const tagStart = random(0, tags.length - TAG_COUNT_EACH_USER);

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            followedTags: {
              connect: tags
                .slice(tagStart, tagStart + TAG_COUNT_EACH_USER)
                .map(({ id }) => ({ id })),
            },
            collections: {
              connect: questions
                .slice(upVoteQuestionStart, upVoteQuestionEnd)
                .map(({ id }) => ({ id })),
            },
            upvoteQuestions: {
              connect: questions
                .slice(upVoteQuestionStart, upVoteQuestionEnd)
                .map(({ id }) => ({ id })),
            },
            downvoteQuestions: {
              connect: questions
                .slice(downVotesQuestionStart, downVotesQuestionEnd)
                .map(({ id }) => ({ id })),
            },
            upvoteAnswers: {
              connect: answers
                .slice(
                  upVoteAnswerStart,
                  Math.min(upVoteAnswerStart + 50, upVoteAnswerEnd),
                )
                .map(({ id }) => ({ id })),
            },
            downVoteAnswers: {
              connect: answers
                .slice(
                  downVoteAnswerStart,
                  Math.min(upVoteAnswerStart + 50, downVoteAnswerEnd),
                )
                .map(({ id }) => ({ id })),
            },
          },
        });
      });

      await runTasks(updateUserTasks);
    }

    if (shouldCreateQuestion) {
      log.log("Updating questions...");
      const updateQuestionLog = createLogUpdate(process.stdout, {
        showCursor: true,
      });
      const updateQuestionTasks = createdQuestions.map(
        (question, index) => async () => {
          updateQuestionLog(
            `Updating question ${index + 1} of ${questions.length}...`,
          );
          const tagStart = random(0, tags.length - TAG_COUNT_EACH_USER);
          await prisma.question.update({
            where: {
              id: question.id,
            },
            data: {
              tags: {
                connect: tags
                  .slice(tagStart, tagStart + TAG_COUNT_EACH_USER)
                  .map((tag) => ({ id: tag.id })),
              },
            },
          });
        },
      );
      await runTasks(updateQuestionTasks);
    }
  });
}

async function runTasks(
  tasks: Array<() => Promise<void>>,
  parallelCount = os.cpus().length,
) {
  let start = 0;
  while (start < tasks.length) {
    const tasksToRun = tasks.slice(start, start + parallelCount);
    await Promise.all(tasksToRun.map((task) => task().catch(task)));
    start += parallelCount;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    log.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
