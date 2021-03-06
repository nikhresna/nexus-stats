process.env.NODE_ENV = 'production'
process.env.NEXUS_TARGET_NODE = 'ui-core'
process.env.NEXUS_STAGING = process.argv.includes('staging')
const webpack = require('webpack')
const enabled = require(`${process.cwd()}/.webpack.json`).enable
const config = require(`${process.cwd()}/config/cubic/ui.js`)
const rm = require('rimraf')

/**
 * Bundle webpack for production. This will imitate a cubic-ui node to auto-
 * generate all routes and get the required default config during build.
 */
async function build () {
  /**
   * Only keep one build at a time. This way files are always there for
   * production builds and test units.
   */
  console.log('* Removing old builds...')
  rm.sync(`${process.cwd()}/assets/bundles/*`)

  /**
   * We should now have a clear bundle history and actual commit to the build.
   */
  console.log('* Starting webpack build process. This might take a while...')
  const timer = new Date()

  /**
   * Load up Cubic to generate routes config file.
   */
  const loader = require('cubic-loader')
  loader({ logLevel: 'silent', skipAuthCheck: true })

  /**
   * Load up UI node. No Auth needed, we only need to register the endpoints
   * as routes.
   */
  const Ui = require('cubic-ui')
  await cubic.use(new Ui(config))

  /**
   * Trigger endpoint mapping which will also create the custom routes.
   */
  await cubic.nodes.ui.core.webpackServer.registerEndpoints()
  const client = require(cubic.config.ui.webpack.clientConfig)
  const server = require(cubic.config.ui.webpack.serverConfig)

  /**
   * Actual webpack build process.
   */
  await new Promise((resolve, reject) => {
    webpack([client, server], (err, stats) => {
      if (err || stats.hasErrors()) {
        return reject(err || stats.toJson().errors)
      }
      console.log(`> Webpack build successful (${new Date() - timer}ms)`)
      resolve()
    })
  })
  process.exit()
}

if (enabled) {
  build()
}
