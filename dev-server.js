const { spawn, spawnSync } = require('child_process')

spawnSync('sh', ['-c', 'npm run build'], {
  stdio: 'inherit'
})

spawnSync('sh', ['-c', 'node build.js --development-mode'], {
  stdio: 'inherit',
  cwd: 'docs'
})

spawn('sh', ['-c', 'http-server public/'], {
  stdio: 'inherit',
  cwd: 'docs'
})
