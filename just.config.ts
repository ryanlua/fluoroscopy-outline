import { argv, parallel, series, task } from "just-scripts";
import {
  CopyTaskParameters,
  cleanTask,
  cleanCollateralTask,
  copyTask,
  coreLint,
  setupEnvironment,
  zipTask,
  STANDARD_CLEAN_PATHS,
  DEFAULT_CLEAN_DIRECTORIES,
  getOrThrowFromProcess,
  watchTask,
} from "@minecraft/core-build-tasks";
import path from "path";
setupEnvironment(path.resolve(__dirname, ".env"));
const projectName = getOrThrowFromProcess("PROJECT_NAME");
const copyTaskOptions: CopyTaskParameters = {
  copyToBehaviorPacks: [],
  copyToScripts: [],
  copyToResourcePacks: [`./resource_packs/${projectName}`],
};
task("lint", coreLint(["resource_packs/**/*.json"], argv().fix));
task("clean-local", cleanTask(DEFAULT_CLEAN_DIRECTORIES));
task("clean-collateral", cleanCollateralTask(STANDARD_CLEAN_PATHS));
task("clean", parallel("clean-local", "clean-collateral"));
task("copyArtifacts", copyTask(copyTaskOptions));
task("package", series("clean-collateral", "copyArtifacts"));
task("local-deploy", watchTask(["resource_packs/**/*.{json,lang,tga,ogg,png}"], series("clean-local", "package")));
task(
  "createMcpackFile",
  zipTask(`./dist/packages/${projectName}.mcpack`, [{ contents: [`./resource_packs/${projectName}`] }])
);
task("mcpack", series("clean-local", "createMcpackFile"));
