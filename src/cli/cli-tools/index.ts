import dotenv from 'dotenv';

import { setupCliContext } from '../util';
import initalizeCantara from '../../bootstrap/init';

if (process.env.NODE_ENV === 'development') {
  dotenv.config();
}

const userProjectPath =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_PROJECT_PATH
    : process.cwd();

if (!userProjectPath) {
  throw new Error(
    `No project path was set. Set DEV_PROJECT_PATH in .env file to continue development!`,
  );
}

export interface CantaraCommand {
  /** If true, skip onPreBootstrap */
  noSetup?: boolean;
  /** e.g. dev, build, run, ... */
  actionName: string;
  /** Parameters value depends on position in command */
  parameters?: {
    name: string;
    required?: boolean;
  }[];
  exec: (parameters: {
    parameters: { [key: string]: string };
    originalCommand: string[];
    stage: string;
  }) => any;
}

interface PrepareCantaraOptions {
  appname?: string;
  cmdName: string;
  additionalCliOptions: string;
  stage: string;
  skipBootstrap?: boolean;
}

/** Execute this function before each command */
export async function prepareCantara({
  appname,
  cmdName,
  additionalCliOptions,
  stage,
  skipBootstrap,
}: PrepareCantaraOptions) {
  setupCliContext();
  await initalizeCantara({
    additionalCliOptions,
    appname,
    cmdName,
    stage,
    userProjectPath: userProjectPath!,
    skipBootstrap,
  });
}

interface ExecCantaraCommandParams {
  allCantaraCommands: CantaraCommand[];
  parsedCommand: CliCommand;
  originalCommand: string[];
}

export async function execCantaraCommand({
  allCantaraCommands,
  parsedCommand,
  originalCommand,
}: ExecCantaraCommandParams) {
  if (parsedCommand.commands.length === 0) {
    throw new Error(`You must specify an action, e.g.: cantara e2e`);
  }
  const userDefinedStage = parsedCommand.flags.find(
    flag => flag.name === 'stage',
  );
  const stage = userDefinedStage ? userDefinedStage.value : 'not_set';

  const [actionName, ...parameters] = parsedCommand.commands;
  const foundAction = allCantaraCommands.find(
    cmd => cmd.actionName === actionName,
  );
  if (!foundAction) {
    throw new Error(`There is no command named '${actionName}'.`);
  }

  const [, , ...additionalCliOptionsUnsanitized] = originalCommand;
  const additionalCliOptions = additionalCliOptionsUnsanitized
    .join(' ')
    .replace(/--stage [^\s\\]*/, '');

  const actionParameters = parsedCommand.commands
    .slice(1)
    .reduce((obj, cmd, i) => {
      const foundParam = foundAction.parameters && foundAction.parameters[i];
      if (foundParam) {
        return {
          ...obj,
          [foundParam.name]: cmd,
        };
      }
      return obj;
    }, {} as { [key: string]: string });

  await prepareCantara({
    appname: actionParameters.appname,
    cmdName: actionName,
    stage: stage.toString(),
    additionalCliOptions,
    skipBootstrap: foundAction.noSetup,
  });
  await Promise.resolve(
    foundAction.exec({
      parameters: actionParameters,
      originalCommand,
      stage: stage.toString(),
    }),
  );
}

export interface CliCommand {
  commands: string[];
  flags: {
    name: string;
    value: boolean | string;
  }[];
}

export function parseCliCommand(command: string[]) {
  const parsed = command.reduce(
    (acc, str, i) => {
      const wasStringPartAlreadyHandled =
        acc.commands.includes(str) ||
        !!acc.flags.find(
          flag => str.startsWith(`--${flag.name}`) || str === flag.value,
        );
      if (wasStringPartAlreadyHandled) {
        return acc;
      }
      const isFlag = str.startsWith('--');
      if (isFlag) {
        let flagValue: boolean | string = true;
        let flagName = str.replace('--', '');
        const hasFlagValue =
          command[i + 1] !== undefined && command[i + 1] !== null;
        if (hasFlagValue) {
          flagValue = command[i + 1];
          if (flagValue === 'false') {
            flagValue = false;
          }
        }
        return {
          ...acc,
          flags: [...acc.flags, { name: flagName, value: flagValue }],
        };
      }
      return {
        ...acc,
        commands: [...acc.commands, str],
      };
    },
    { commands: [], flags: [] } as CliCommand,
  );
  return parsed;
}
