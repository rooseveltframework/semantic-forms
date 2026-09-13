// this file runs the visual regression tests inside the official playwright container
//
// screenshots depend on the operating system, the browser and the fonts installed, so a baseline is only comparable with the environment that produced it. running them in a pinned container gives every contributor, and CI, the same one
//
// any arguments are passed through to playwright, so `--update-snapshots` rewrites the baselines

const { spawnSync } = require('child_process')
const { devDependencies } = require('./package.json')

// the image has to match the installed playwright, which resolves browsers by revision and will not find them in an image built for a different version. taking the tag from the dependency means the version is written down once rather than repeated everywhere it is needed
const image = `mcr.microsoft.com/playwright:v${devDependencies['@playwright/test']}-noble`

// the ubuntu flavour is pinned too: the base image supplies the fonts, so changing it changes how text rasterizes and every baseline along with it
const dockerArguments = [
  'run', '--rm',
  '--volume', `${process.cwd()}:/work`,
  '--workdir', '/work',
  // chromium needs more shared memory than docker's default allocation
  '--ipc=host'
]

// on linux the container writes into the mounted folder as whoever it runs as, which is root by default, leaving baselines that cannot be committed without chowning them first. docker desktop maps ownership itself on macos and windows, where there is also no uid to pass
if (process.platform === 'linux') {
  dockerArguments.push('--user', `${process.getuid()}:${process.getgid()}`)

  // that user has no home directory in the image, so point npm somewhere writable
  dockerArguments.push('--env', 'HOME=/tmp', '--env', 'npm_config_cache=/tmp/npm-cache')
}

// --install reinstalls the dependencies inside the container first. nothing in this project needs it today, because the only native dependency on this path ships a prebuild for every platform, but a future one might not. it writes into the same folder the host uses, so whoever runs it needs `npm ci` again afterwards to get their own platform's build back
const reinstall = process.argv.includes('--install')
const playwrightArguments = process.argv.slice(2).filter(argument => argument !== '--install')

const command = reinstall
  ? ['sh', '-c', `npm ci && npm ci --prefix docs && npm run test-visual -- ${playwrightArguments.join(' ')}`]
  : ['npm', 'run', 'test-visual', '--', ...playwrightArguments]

const { error, status } = spawnSync('docker', [...dockerArguments, image, ...command], { stdio: 'inherit' })

if (error) {
  if (error.code === 'ENOENT') {
    console.error('\nThe visual regression tests run in a container and docker was not found. See the visual regression tests section of CONTRIBUTING.md for how to install it.')
    process.exit(1)
  }
  throw error
}

process.exit(status ?? 1)
