const fs = require('fs');

const file = process.argv[2];
const content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');

let fdbLineIndex = -1;
let fdbLine = '';
let targetLineIndex = -1;

for (let i = 0; i < lines.length; i++) {
  // Ignore comments
  if (lines[i].trim().startsWith('#')) {
    continue;
  }
  
  // We need to match the new HEAD which is d610294 instead of fdb8b68
  // Or just match " 1 " as the commit message to be safe.
  // Let's match the exact commit d610294 (the new HEAD)
  if (lines[i].includes('d610294')) {
    fdbLineIndex = i;
    fdbLine = lines[i];
  }
  if (lines[i].includes('1d9c0f7')) {
    targetLineIndex = i;
  }
}

if (fdbLineIndex !== -1 && targetLineIndex !== -1) {
  // Remove the fdb line
  lines.splice(fdbLineIndex, 1);
  
  // Transform it to fixup
  fdbLine = fdbLine.replace(/^pick /, 'fixup ');

  // Insert the squash line right after the target line
  // If target line is at index 0, we insert at 1.
  // Wait, if fdbLineIndex was removed, and it was AFTER targetLineIndex, targetLineIndex is unaffected.
  lines.splice(targetLineIndex + 1, 0, fdbLine);

  fs.writeFileSync(file, lines.join('\n'), 'utf-8');
  console.log('Rebase plan updated successfully!');
} else {
  console.log('Could not find the target commits in the rebase plan.', {fdbLineIndex, targetLineIndex});
  process.exit(1);
}
