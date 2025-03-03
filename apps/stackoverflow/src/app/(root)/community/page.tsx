import { prisma } from "@/prisma";
import { MODEL_NAME } from "@/prisma/model-config";
import { IPageProps, List, migratePage, NoResults } from "@/shared";
import { UserCard } from "@/user";
import React from "react";

const CommunityPage: React.FC<IPageProps<{}>> = migratePage(async (props) => {
  const { searchParams } = props;

  const { items: users, total } = await prisma.user.search({
    include: {
      followedTags: true,
    },
    searchParams,
  });

  return (
    <List
      empty={
        <NoResults
          description="Be the first to break the silence! 🚀 Sign up to be the first and kickstart the community. Get involved! 💡"
          link="/sign-up"
          linkTitle="Sign Up"
          topic="Users"
        />
      }
      items={users}
      modelFilter={{
        name: MODEL_NAME.User,
      }}
      renderItem={(user) => (
        <UserCard key={user.id} tags={user.followedTags} user={user} />
      )}
      search={{
        placeholder: "Search amazing minds here...",
      }}
      title={"All Users"}
      total={total}
    />
  );
});

export default CommunityPage;
