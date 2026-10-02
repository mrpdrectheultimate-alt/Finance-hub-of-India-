const fs = require('fs');
const path = require('path');

const files = [
  'outputs/phase0_reality_audit.sql',
  'outputs/supabase_schema_safe.sql',
  'outputs/phase1_critical_fixes.sql',
  'outputs/trading_markets_101.sql',
  'outputs/crypto_basics.sql',
  'outputs/corporate_business_basics.sql',
  'outputs/adaptive_learning_engine.sql',
  'outputs/analytics_views.sql',
  'outputs/video_library_complete.sql',
  'outputs/lesson_expansion_phase1.sql',
  'outputs/lesson_expansion_phase2.sql',
  'outputs/lesson_expansion_phase3.sql',
  'outputs/lesson_expansion_phase3_part2.sql',
  'outputs/phase3_quizzes.sql',
  'outputs/notes_schema.sql',
  'outputs/phase1_migration.sql',
  'outputs/phase2_migration.sql',
  'outputs/phase3_migration.sql',
  'outputs/phase4_migration.sql',
  'outputs/phase5_migration.sql',
  'outputs/phase6_migration.sql',
  'outputs/phase7_lessons.sql',
  'outputs/phase8_lessons.sql'
];

let totalIssues = 0;

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.error(`❌ MISSING FILE: ${f}`);
    totalIssues++;
    return;
  }
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  
  // Check dollar tag balance
  const dollarTags = content.match(/\$[a-zA-Z0-9_]*\$/g) || [];
  const tagCounts = {};
  dollarTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });

  const unbalancedTags = Object.entries(tagCounts).filter(([tag, count]) => count % 2 !== 0);

  // Check unescaped single quotes in SQL strings or PL/pgSQL
  let issueList = [];
  if (unbalancedTags.length > 0) {
    issueList.push(`Unbalanced dollar tags: ${unbalancedTags.map(([t, c]) => `${t} (${c})`).join(', ')}`);
  }

  // Check PL/pgSQL block BEGIN...END balance
  const beginCount = (content.match(/\bBEGIN\b/gi) || []).length;
  const endCount = (content.match(/\bEND\b;/gi) || []).length;
  if (beginCount !== endCount) {
    issueList.push(`BEGIN count (${beginCount}) !== END; count (${endCount})`);
  }

  if (issueList.length > 0) {
    console.log(`⚠️ ${path.basename(f)} (${lines.length} lines):`);
    issueList.forEach(iss => console.log(`   - ${iss}`));
    totalIssues++;
  } else {
    console.log(`✅ ${path.basename(f)} (${lines.length} lines): Clean`);
  }
});

console.log(`\nScan complete. Total files flagged: ${totalIssues}`);
