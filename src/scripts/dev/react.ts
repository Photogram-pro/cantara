import webpack from 'webpack';

import WebpackDevServer from 'webpack-dev-server';

import getGlobalConfig, { getActiveApp } from '../../cantara-config';
import createReactWebpackConfig from '../../util/config/webpackReactConfig';
import clearConsole from '../../util/clearConsole';

export function startReactAppDevelopmentServer() {
  const {
    allPackages: { include },
    runtime: {
      aliases: { packageAliases },

      projectDir,
    },
  } = getGlobalConfig();
  const activeApp = getActiveApp();
  const webpackConfig = createReactWebpackConfig({
    alias: packageAliases,
    app: activeApp,
    projectDir,
    env: activeApp.env,
    include,
  });

  const compiler = webpack(webpackConfig);
  const devServer = new WebpackDevServer(compiler, {
    contentBase: activeApp.paths.build,
    historyApiFallback: true,
    quiet: true,
    hot: true,
    // Enable gzip compression of generated files.
    compress: true,
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: 'none',
  });
  devServer.listen(8080, '::', err => {
    clearConsole();
    if (err) {
      console.log('Error starting webpack dev server:', err);
    }
  });
}
