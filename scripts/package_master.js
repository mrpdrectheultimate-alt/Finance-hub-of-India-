const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outputsDir = path.join(__dirname, '..', 'outputs');
if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir, { recursive: true });
}

// Master mapping
const fileMappings = [
  { src: 'sql/phase5_migration.sql', dest: 'phase5_migration.sql' },
  { src: 'components/community/LessonQA.tsx', dest: 'LessonQA.tsx' },
  { src: 'app/admin/cms/page.tsx', dest: 'AdminCMS.tsx' },
  { src: 'public/manifest.json', dest: 'manifest.json' },
  { src: 'public/sw.js', dest: 'sw.js' },
  { src: 'components/pwa/PWAInstall.tsx', dest: 'PWAInstall.tsx' },
  { src: 'sql/phase1_migration.sql', dest: 'phase1_migration.sql' },
  { src: 'sql/phase2_migration.sql', dest: 'phase2_migration.sql' },
  { src: 'sql/phase3_migration.sql', dest: 'phase3_migration.sql' },
  { src: 'sql/phase4_migration.sql', dest: 'phase4_migration.sql' },
  { src: 'app/onboarding/page.tsx', dest: 'onboarding_page.tsx' },
  { src: 'app/glossary/page.tsx', dest: 'glossary_page.tsx' },
  { src: 'app/review/page.tsx', dest: 'review_page.tsx' },
  { src: 'components/flashcards/ConceptCard.tsx', dest: 'ConceptCard.tsx' },
  { src: 'components/knowledge/KnowledgeGraph.tsx', dest: 'KnowledgeGraph.tsx' },
  { src: 'app/legal/terms/page.tsx', dest: 'legal_terms_page.tsx' },
  { src: 'app/legal/privacy/page.tsx', dest: 'legal_privacy_page.tsx' },
  { src: 'app/legal/disclaimer/page.tsx', dest: 'legal_disclaimer_page.tsx' },
  { src: 'app/api/search/route.ts', dest: 'search_route.ts' },
  { src: 'app/api/ai-tutor/route.ts', dest: 'AIMentor_route.ts' },
  { src: 'components/ai/AIMentor.tsx', dest: 'AIMentor.tsx' },
  { src: 'lib/seo.ts', dest: 'seo.ts' },
  { src: 'sql/phase6_migration.sql', dest: 'phase6_migration.sql' },
  { src: 'app/api/email/send-sequence/route.ts', dest: 'email_sequence_route.ts' },
  { src: 'app/leaderboard/page.tsx', dest: 'leaderboard_page.tsx' },
  { src: 'app/certificates/page.tsx', dest: 'certificates_page.tsx' }
];

console.log("Copying files to outputs/...");
fileMappings.forEach(mapping => {
  const fullSrc = path.join(__dirname, '..', mapping.src);
  const fullDest = path.join(outputsDir, mapping.dest);
  if (fs.existsSync(fullSrc)) {
    fs.copyFileSync(fullSrc, fullDest);
    console.log(`  ✓ ${mapping.src} -> ${mapping.dest}`);
  } else {
    console.warn(`  x File not found: ${mapping.src}`);
  }
});

console.log("\nFiles in outputs/:");
const filesInOutputs = fs.readdirSync(outputsDir);
filesInOutputs.forEach(file => {
  const stat = fs.statSync(path.join(outputsDir, file));
  console.log(`  ${file} (${stat.size} bytes)`);
});
