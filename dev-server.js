const fs = require('fs')
const { spawn, spawnSync } = require('child_process')

if (!fs.existsSync('docs/node_modules')) {
  spawnSync('npm', ['ci'], {
    stdio: 'inherit',
    cwd: 'docs'
  })
}

if (!fs.existsSync('docs/public')) {
  spawnSync('npm', ['run', 'd'], {
    stdio: 'inherit',
    cwd: 'docs'
  })
}

spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit'
})

spawnSync('node', ['build.js', '--development-mode'], {
  stdio: 'inherit',
  cwd: 'docs'
})

spawn('http-server', ['public/'], {
  stdio: 'inherit',
  cwd: 'docs',
  shell: true
})
