import path from 'path';

import getAllApps, { loadSecrets } from './util';
import { CantaraApplication } from '../util/types';

import getAllPackageAliases, { getDependencyAliases } from './aliases';
import { reactDependencies } from './dependencies/react';
import { typescriptDependencies } from './dependencies/types';
import { testingDependencies } from './dependencies/testing';
import { commonDependencies } from './dependencies/common';

interface CantaraInitialConfig {
  /** Where the cantara package itself lives */
  packageRootDir: string;
  /** Path of Cantara project */
  projectDir?: string;
  currentCommand: {
    name: string;
    appname: string;
  };
  stage: string;
  /** Unknown options for 3rd party CLI programs, e.g. Jest.
   * Options which are foreign to Cantara are included
   * in this string.
   */
  additionalCliOptions?: string;
}

type Dependencies = { [key: string]: string };

interface CantaraGlobalConfig {
  allApps: CantaraApplication[];
  allPackages: {
    /** Include all those paths into webpack configs */
    include: string[];
  };
  aliases: {
    packageAliases: { [key: string]: string };
    appDependencyAliases: { [key: string]: string };
  };
  dependencies: {
    /** Current React and React DOM version */
    react: Dependencies;
    /** Dependencies needed for TS
     * (including all type declarations packages)
     */
    typescript: Dependencies;
    /** Dependecies needed for testing */
    testing: Dependencies;
    /** Commonly needed, global dependencies. E.g. prettier */
    common: Dependencies;
  };
  /** Paths used internally by Cantara */
  internalPaths: {
    static: string;
    /** Where the cantara package itself lives */
    root: string;
    /** Folder for temporary files (excluded from version control) */
    temp: string;
  };
  /** Current runtime configuration (e.g. the command the user executed, the location of it etc.) */
  runtime: {
    /** Working directory where user executed Cantara */
    projectDir: string;
    /** Information about current command */
    currentCommand: {
      name: string;
      additionalCliOptions: string;
      app: CantaraApplication;
    };
    /** Secrets from user's .secrets.json file */
    secrets: {
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
    };
  };
}

let globalConfig: CantaraGlobalConfig | undefined = undefined;

export default function getGlobalConfig() {
  if (!globalConfig)
    throw new Error("Cantara's global configuration was not set yet!");
  return globalConfig;
}

/** Config can only be set once */
export function configureCantara(config: CantaraInitialConfig) {
  const staticFilesPath = path.join(config.packageRootDir, 'static');
  const tempFolder = path.join(staticFilesPath, '.temp');
  const projectDir = config.projectDir || process.cwd();
  const allApps = getAllApps({ rootDir: projectDir, stage: config.stage });
  const currentActiveApp = allApps.find(
    app => app.name === config.currentCommand.appname,
  );
  if (!currentActiveApp) {
    throw new Error(
      `The app "${config.currentCommand.appname}" does not exist.`,
    );
  }
  const configToUse: CantaraGlobalConfig = {
    allApps,
    allPackages: {
      include: allApps
        .filter(
          app => app.type === 'js-package' || app.type === 'react-component',
        )
        .map(app => app.paths.src),
    },
    aliases: {
      packageAliases: getAllPackageAliases({
        allApps,
        activeApp: currentActiveApp,
      }),
      appDependencyAliases: getDependencyAliases(currentActiveApp),
    },
    dependencies: {
      react: reactDependencies,
      typescript: typescriptDependencies,
      testing: testingDependencies,
      common: commonDependencies,
    },
    internalPaths: {
      root: config.packageRootDir,
      static: staticFilesPath,
      temp: tempFolder,
    },
    runtime: {
      projectDir,
      currentCommand: {
        name: config.currentCommand.name,
        app: currentActiveApp,
        additionalCliOptions: config.additionalCliOptions || '',
      },
      secrets: loadSecrets(projectDir),
    },
  };
  globalConfig = Object.freeze(configToUse);
  return globalConfig;
}
