import { findWorkspacePackages } from "@pnpm/workspace.find-packages";
import { filterChangedPkgs, getUnCommitFiles } from "./shared";

const getChangedPackages = async () => {
  const pkgs = await getPnpmWorkspacePkgs(process.cwd());
  const unCommitFiles = getUnCommitFiles();

  return filterChangedPkgs(pkgs, unCommitFiles);
};

async function getPnpmWorkspacePkgs(cwd: string) {
  return (await findWorkspacePackages(cwd))
    .filter((x) => !!x.manifest.name)
    .map(({ rootDir: path, manifest: { name } }) => ({
      path,
      name: name!,
    }));
}

export { getChangedPackages };

export default getChangedPackages;
