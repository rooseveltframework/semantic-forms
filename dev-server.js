require('child_process').spawn('sh', ['-c', 'node build.js --development-mode && http-server public/'], {
  stdio: 'inherit',
  cwd: 'docs'
})
