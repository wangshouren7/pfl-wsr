const scopes = import("@pfl-wsr/get-changed-packages/esm/pnpm.js")
  .then((x) => x.getChangedPackages())
  .then((res) => res.map((x) => x.split("/")[1] ?? "pfl-wsr"));

/** @type {import('cz-git').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"], // this is a list of rules for commit message, so it's required
  prompt: {
    scopes,
    enableMultipleScopes: true,
    defaultScope: scopes.then((x) => (x.join(",").length > 70 ? [] : x)),
    allowEmptyScopes: false,
    defaultSubject: "update",
  },
};
