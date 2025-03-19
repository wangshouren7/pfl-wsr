import { HomeLink } from "@/domains/navigation/nav-link";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      {children}

      <HomeLink className="fixed top-4 left-4" />
    </main>
  );
}
