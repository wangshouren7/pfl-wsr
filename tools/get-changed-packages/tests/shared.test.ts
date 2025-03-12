import { comparePath, filterChangedPkgs, type IPkg } from "@/shared";
import { name } from "../package.json";

describe(name, () => {
  test(comparePath.name, () => {
    expect(["a/b", "a/b/c"].sort(comparePath)).toEqual(["a/b/c", "a/b"]);
  });

  describe(filterChangedPkgs.name, () => {
    const doTest = (
      pkgs: IPkg[],
      unCommitFiles: string[],
      expectedResult: string[]
    ) => {
      expect(filterChangedPkgs(pkgs, unCommitFiles)).toEqual(expectedResult);
    };

    test("should filter pkgs", () => {
      const pkgs = [
        {
          name: "web",
          path: "/web",
        },
        {
          name: "api",
          path: "/api",
        },
      ];

      const unCommitFiles = ["/web/src/index.ts", "/api/src/index.ts"];
      doTest(pkgs, unCommitFiles, ["web", "api"]);
    });

    test("should not include root", () => {
      const pkgs = [
        {
          name: "root",
          path: "/",
        },
        {
          name: "web",
          path: "/web",
        },
      ];

      const unCommitFiles = ["/web/src/index.ts"];
      doTest(pkgs, unCommitFiles, ["web"]);
    });

    test("should include root", () => {
      const pkgs = [
        {
          name: "root",
          path: "/",
        },
        {
          name: "web",
          path: "/web",
        },
      ];

      const unCommitFiles = ["/index.ts"];
      doTest(pkgs, unCommitFiles, ["root"]);
    });
  });
});
