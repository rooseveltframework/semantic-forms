const fs = require('fs')
const path = require('path')
const { spawn, spawnSync } = require('child_process')

const docsDir = path.join(__dirname, 'docs')
const port = process.env.PORT || '6588'

// npm ships as a .cmd shim on windows, which cannot be spawned without the extension, and which node refuses to run directly at all, so on windows those commands are handed to the shell instead
const isWindows = process.platform === 'win32'
const npm = isWindows ? 'npm.cmd' : 'npm'

// node's watch mode marks the environment so the process it runs reports its loaded modules back to the watcher. that marker is inherited by every descendant, and it corrupts the worker threads the minifier uses during the build, so keep it out of the child processes.
const { WATCH_REPORT_DEPENDENCIES, ...env } = process.env

// runs a command to completion, aborting the dev server if it fails
//
// windows goes through the shell, as a single string rather than a command and a list of arguments. node refuses to start a .cmd shim by itself, and passing the arguments separately to a shell is deprecated because nothing escapes them. every argument here is written out in this file, so joining them is safe
const run = (command, args, options) => {
  const { error, status } = isWindows
    ? spawnSync([command, ...args].join(' '), { stdio: 'inherit', env, shell: true, ...options })
    : spawnSync(command, args, { stdio: 'inherit', env, ...options })
  if (error) throw error
  if (status !== 0) process.exit(status ?? 1)
}

// install the docs dependencies the first time the dev server is run
if (!fs.existsSync(path.join(docsDir, 'node_modules'))) run(npm, ['ci'], { cwd: docsDir })

// build the library that the docs site consumes. this is skipped when the caller has already produced the bundles, so that a coverage run's instrumented bundle is not overwritten here
if (!process.argv.includes('--skip-library-build')) run(npm, ['run', 'build'])

// roosevelt builds the docs site and serves it. development mode is deliberate: production mode sends a content security policy that forbids eval, and the istanbul instrumented bundle that `npm run coverage` builds needs eval in order to run at all. the html validator is turned off because it replaces the page with a report when markup is invalid, which the tests would then be asserting against instead of the demo itself
const server = spawn(process.execPath, ['test-server.js', '--development-mode', '--disable-validator'], {
  stdio: 'inherit',
  env: { ...env, HTTP_PORT: port },
  cwd: docsDir
})

// don't leave the server holding the port after a watch restart or a ctrl+c
const shutDown = () => server.kill()
process.on('exit', shutDown)
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    shutDown()
    process.exit(0)
  })
}
