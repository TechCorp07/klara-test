const fs = require('fs');
const path = require('path');

// Define the paths to check
const appDir = path.join(__dirname);
const componentsDir = path.join(appDir, 'components');
const pagesDir = path.join(appDir, 'app');
const apiDir = path.join(appDir, 'api');

console.log('\n=== KLARARETY FEATURE VERIFICATION ===\n');

// Check for key files and features
const featuresToVerify = [
  {
    name: 'Authentication Flow',
    files: [
      'app/login/page.js',
      'app/register/page.js',
      'app/forgot-password/page.js',
      'app/reset-password/page.js',
      'contexts/AuthContext.js'
    ],
    status: 'Pending'
  },
  {
    name: 'Two-Factor Authentication',
    files: [
      'app/settings/two-factor/page.js',
      'app/settings/two-factor/disable/page.js',
      'components/auth/TwoFactorAuthForm.jsx',
      'components/auth/QRCodeScanner.jsx'
    ],
    status: 'Pending'
  },
  {
    name: 'Role-Based Dashboards',
    files: [
      'app/dashboard/patient/page.js',
      'app/dashboard/provider/page.js',
      'app/dashboard/admin/page.js',
      'app/dashboard/pharmco/page.js'
    ],
    status: 'Pending'
  },
  {
    name: 'Community Consent Management',
    files: [
      'app/profile/consent/page.js',
      'app/community/page.js'
    ],
    status: 'Pending'
  },
  {
    name: 'Wearable Integration',
    files: [
      'app/wearables/page.js'
    ],
    status: 'Pending'
  },
  {
    name: 'Healthcare Data Management',
    files: [
      'app/medical-records/page.js'
    ],
    status: 'Pending'
  },
  {
    name: 'Telemedicine Features',
    files: [
      'app/telemedicine/page.js'
    ],
    status: 'Pending'
  },
  {
    name: 'Real-time Capabilities',
    files: [
      'app/notifications/page.js'
    ],
    status: 'Pending'
  },
  {
    name: 'Admin Tools',
    files: [
      'app/admin/dashboard/page.js',
      'app/admin/user-approval/page.js'
    ],
    status: 'Pending'
  },
  {
    name: 'FHIR Compatibility',
    files: [
      'app/fhir-integration/page.js'
    ],
    status: 'Pending'
  },
  {
    name: 'Branding and Theme',
    files: [
      'public/images/klararety-logo.png',
      'styles/global.css',
      'tailwind.config.js'
    ],
    status: 'Pending'
  }
];

// Verify each feature
featuresToVerify.forEach(feature => {
  console.log(`Checking ${feature.name}...`);
  
  let missingFiles = [];
  let existingFiles = [];
  
  feature.files.forEach(filePath => {
    const fullPath = path.join(appDir, filePath);
    if (fs.existsSync(fullPath)) {
      existingFiles.push(filePath);
      console.log(`  ✓ Found ${filePath}`);
    } else {
      missingFiles.push(filePath);
      console.log(`  ✗ Missing ${filePath}`);
    }
  });
  
  if (missingFiles.length === 0) {
    feature.status = 'Implemented';
    console.log(`  ✓ ${feature.name} is fully implemented`);
  } else if (existingFiles.length > 0) {
    feature.status = 'Partial';
    console.log(`  ⚠ ${feature.name} is partially implemented`);
  } else {
    feature.status = 'Missing';
    console.log(`  ✗ ${feature.name} is not implemented`);
  }
  
  console.log('');
});

// Generate summary
console.log('=== VERIFICATION SUMMARY ===\n');

const implemented = featuresToVerify.filter(f => f.status === 'Implemented').length;
const partial = featuresToVerify.filter(f => f.status === 'Partial').length;
const missing = featuresToVerify.filter(f => f.status === 'Missing').length;

console.log(`Total features: ${featuresToVerify.length}`);
console.log(`Fully implemented: ${implemented}`);
console.log(`Partially implemented: ${partial}`);
console.log(`Not implemented: ${missing}`);
console.log(`Implementation rate: ${Math.round((implemented / featuresToVerify.length) * 100)}%`);

console.log('\n=== FEATURE STATUS ===\n');

featuresToVerify.forEach(feature => {
  const statusSymbol = feature.status === 'Implemented' ? '✓' : 
                       feature.status === 'Partial' ? '⚠' : '✗';
  console.log(`${statusSymbol} ${feature.name}: ${feature.status}`);
});

console.log('\n=== VERIFICATION COMPLETE ===\n');
