const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outputsDir = path.join(__dirname, '..', 'outputs');

// Files for Phase 5 Pack
const phase5Files = [
  'phase5_migration.sql',
  'LessonQA.tsx',
  'AdminCMS.tsx',
  'manifest.json',
  'sw.js',
  'PWAInstall.tsx'
];

// Files for Phase 6 Pack
const phase6Files = [
  'phase6_migration.sql',
  'email_sequence_route.ts',
  'leaderboard_page.tsx',
  'certificates_page.tsx'
];

// Files for Phase 7 Pack
const phase7Files = [
  'phase7_lessons.sql',
  'AdminDashboard.tsx'
];

// Files for All Phases Complete Master Pack
const allPhasesFiles = [
  'phase0_reality_audit.sql',
  'phase0_audit_checklist.md',
  'phase1_migration.sql',
  'razorpay_order_route.ts',
  'razorpay_webhook_route.ts',
  'RazorpayButton.tsx',
  'Skeletons.tsx',
  'ErrorBoundary.tsx',
  'onboarding_page.tsx',
  'search_route.ts',
  'SearchBar.tsx',
  'FinanceDisclaimer.tsx',
  'seo.ts',
  'ai_rate_limit_analytics.ts',
  'phase2_migration.sql',
  'glossary_page.tsx',
  'review_page.tsx',
  'ConceptCard.tsx',
  'KnowledgeGraph.tsx',
  'phase3_migration.sql',
  'NetWorthTracker.tsx',
  'GoalPlanner.tsx',
  'AIMentor_route.ts',
  'AIMentor.tsx',
  'phase4_migration.sql',
  'legal_terms_page.tsx',
  'legal_privacy_page.tsx',
  'legal_disclaimer_page.tsx',
  'phase5_migration.sql',
  'LessonQA.tsx',
  'AdminCMS.tsx',
  'manifest.json',
  'sw.js',
  'PWAInstall.tsx',
  'phase6_migration.sql',
  'email_sequence_route.ts',
  'leaderboard_page.tsx',
  'certificates_page.tsx',
  'phase7_lessons.sql',
  'AdminDashboard.tsx',
  'DEPLOYMENT_WALKTHROUGH.md'
];

// Use archiver or PowerShell Compress-Archive
console.log("Creating ZIP files using PowerShell Compress-Archive...");

// Phase 5 Pack
const phase5FilesPS = phase5Files.filter(f => fs.existsSync(path.join(outputsDir, f))).map(f => `'${path.join(outputsDir, f)}'`).join(',');
const phase5Zip = path.join(outputsDir, 'FinanceHub_Phase5_Pack.zip');
if (fs.existsSync(phase5Zip)) fs.unlinkSync(phase5Zip);
if (phase5FilesPS) {
  execSync(`powershell -Command "Compress-Archive -Path ${phase5FilesPS} -DestinationPath '${phase5Zip}' -Force"`);
}

// Phase 6 Pack
const phase6FilesPS = phase6Files.filter(f => fs.existsSync(path.join(outputsDir, f))).map(f => `'${path.join(outputsDir, f)}'`).join(',');
const phase6Zip = path.join(outputsDir, 'FinanceHub_Phase6_Pack.zip');
if (fs.existsSync(phase6Zip)) fs.unlinkSync(phase6Zip);
if (phase6FilesPS) {
  execSync(`powershell -Command "Compress-Archive -Path ${phase6FilesPS} -DestinationPath '${phase6Zip}' -Force"`);
}

// Phase 7 Pack
const phase7FilesPS = phase7Files.filter(f => fs.existsSync(path.join(outputsDir, f))).map(f => `'${path.join(outputsDir, f)}'`).join(',');
const phase7Zip = path.join(outputsDir, 'FinanceHub_Phase7_Pack.zip');
if (fs.existsSync(phase7Zip)) fs.unlinkSync(phase7Zip);
if (phase7FilesPS) {
  execSync(`powershell -Command "Compress-Archive -Path ${phase7FilesPS} -DestinationPath '${phase7Zip}' -Force"`);
}

// All Phases Pack
const allPhasesFilesPS = allPhasesFiles
  .filter(f => fs.existsSync(path.join(outputsDir, f)))
  .map(f => `'${path.join(outputsDir, f)}'`).join(',');
const allPhasesZip = path.join(outputsDir, 'FinanceHub_AllPhases_Complete.zip');
if (fs.existsSync(allPhasesZip)) fs.unlinkSync(allPhasesZip);
if (allPhasesFilesPS) {
  execSync(`powershell -Command "Compress-Archive -Path ${allPhasesFilesPS} -DestinationPath '${allPhasesZip}' -Force"`);
}

console.log("\n=== ZIP Files Created Successfully ===");
if (fs.existsSync(phase5Zip)) {
  const p5Stat = fs.statSync(phase5Zip);
  console.log(`FinanceHub_Phase5_Pack.zip: ${(p5Stat.size / 1024).toFixed(1)} KB`);
}
if (fs.existsSync(phase6Zip)) {
  const p6Stat = fs.statSync(phase6Zip);
  console.log(`FinanceHub_Phase6_Pack.zip: ${(p6Stat.size / 1024).toFixed(1)} KB`);
}
if (fs.existsSync(phase7Zip)) {
  const p7Stat = fs.statSync(phase7Zip);
  console.log(`FinanceHub_Phase7_Pack.zip: ${(p7Stat.size / 1024).toFixed(1)} KB`);
}
if (fs.existsSync(allPhasesZip)) {
  const masterStat = fs.statSync(allPhasesZip);
  console.log(`FinanceHub_AllPhases_Complete.zip: ${(masterStat.size / 1024).toFixed(1)} KB`);
}
