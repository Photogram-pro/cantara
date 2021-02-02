import webpack from 'webpack';

import WebpackDevServer from 'webpack-dev-server';

import createReactWebpackConfig from '../../util/config/webpackReactConfig';
import clearConsole from '../../util/clearConsole';
import getGlobalConfig from '../../cantara-config/global-config';
import getRuntimeConfig from '../../cantara-config/runtime-config';

export function startReactAppDevelopmentServer() {
  const {
    includes: { internalPackages },
    aliases: { packageAliases },
    projectDir,
  } = getGlobalConfig();

  const {
    aliases: { linkedPackageAliases },
    includes: { linkedPackages },
  } = getRuntimeConfig();

  const {
    env,
    currentCommand: { app: activeApp },
    resolveModulesInDevelopment,
  } = getRuntimeConfig();
  const webpackConfig = createReactWebpackConfig({
    alias: {
      ...packageAliases,
      ...linkedPackageAliases,
    },
    app: activeApp,
    projectDir,
    env,
    include: [...internalPackages, ...linkedPackages],
    resolveModules: resolveModulesInDevelopment,
  });

  const compiler = webpack(webpackConfig);
  const devServerConfig = activeApp.meta.devServer || { port: 8080 };
  const devServer = new WebpackDevServer(compiler, {
    contentBase: activeApp.paths.build,
    publicPath: '/',
    historyApiFallback: true,
    quiet: true,
    hot: true,
    // Enable gzip compression of generated files.
    compress: true,
    open: true,
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: 'none',
    ...devServerConfig,
  });
  devServer.listen(devServerConfig.port || 8080, '::', (err) => {
    clearConsole();
    if (err) {
      console.log('Error starting webpack dev server:', err);
    }
  });
}
