const fs = require('fs')
const path = require('path')

function walk(dir) {
  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath)
    } else if (file.endsWith('.vue')) {
      const content = fs.readFileSync(fullPath, 'utf8')
      const scripts = content.match(/<script/g)
      if (scripts && scripts.length > 1) {
        console.log(`MULTIPLE SCRIPTS: ${fullPath}`)
      }
    }
  })
}

walk('src')
