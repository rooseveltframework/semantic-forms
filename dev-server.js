const { spawn, spawnSync } = require('child_process')

spawnSync('sh', ['-c', 'npm run build'], {
  stdio: 'inherit'
})

spawnSync('sh', ['-c', 'node build.js --development-mode'], {
  stdio: 'inherit',
  cwd: 'docs'
})

const child = spawn('sh', ['-c', 'http-server public/'], {
  stdio: 'inherit',
  cwd: 'docs'
})

process.on('SIGINT', () => {
  child.kill('SIGINT')
  process.exit()
})

process.on('SIGTERM', () => {
  child.kill('SIGTERM')
  process.exit()
})
