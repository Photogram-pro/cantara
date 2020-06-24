import webpack from 'webpack';
import { CantaraApplication } from '../../util/types';
import createNodeWebpackConfig from '../../util/config/webpackNodeConfig';
import getGlobalConfig from '../../cantara-config/global-config';
import getRuntimeConfig from '../../cantara-config/runtime-config';

export default async function buildNodeApp(app: CantaraApplication) {
  const {
    allPackages: { include },
    projectDir,
    aliases: { packageAliases },
    additionalCliOptions,
  } = getGlobalConfig();
  const { env, aliases: { appDependencyAliases } } = getRuntimeConfig();

  const webpackConfig = createNodeWebpackConfig({
    alias: {...packageAliases, ...appDependencyAliases },
    app,
    env,
    mode: 'production',
    projectDir,
    include,
    nodemonOptions: additionalCliOptions ? [additionalCliOptions] : undefined,
  });

  const compiler = webpack(webpackConfig);
  compiler.run(err => {
    if (err) {
      throw new Error('Error while compiling.');
    }
    console.log('Successfully compiled!');
  });
}
