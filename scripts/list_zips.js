const fs = require('fs');
const path = require('path');
const outputs = path.join(__dirname, '..', 'outputs');
const zips = fs.readdirSync(outputs).filter(f => f.endsWith('.zip'));

console.log('=== All phase zips ===');
zips.forEach(z => {
  const stat = fs.statSync(path.join(outputs, z));
  console.log(`${(stat.size / 1024).toFixed(1).padStart(7)} KB   ${z}`);
});

console.log('\n=== Master zip ===');
const masterStat = fs.statSync(path.join(outputs, 'FinanceHub_AllPhases_Complete.zip'));
console.log(`${(masterStat.size / 1024).toFixed(1)} KB   FinanceHub_AllPhases_Complete.zip`);
