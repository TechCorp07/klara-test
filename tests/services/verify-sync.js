// Sync and congruency verification script
// This script checks for consistency across components, routes, and API endpoints
export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Function to check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Function to read file content
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Function to check if a string contains a pattern
function containsPattern(content, pattern) {
  return content && content.includes(pattern);
}

// Main verification function
function verifySync() {
  console.log(chalk.blue('=== Verifying Sync and Congruency ==='));
  
  const projectRoot = process.cwd();
  let allPassed = true;
  
  // 1. Check for logo consistency
  console.log(chalk.yellow('\nChecking logo consistency:'));
  
  const logoPath = path.join(projectRoot, 'public', 'images', 'klararety-logo.png');
  if (fileExists(logoPath)) {
    console.log(chalk.green('✓ Logo file exists in public/images directory'));
  } else {
    console.log(chalk.red('✗ Logo file missing from public/images directory'));
    allPassed = false;
  }
  
  // Check if logo is used consistently
  const headerComponent = readFileContent(path.join(projectRoot, 'components', 'layout', 'Header.jsx'));
  const loginPage = readFileContent(path.join(projectRoot, 'app', 'login', 'page.js'));
  
  if (containsPattern(headerComponent, 'klararety-logo.png')) {
    console.log(chalk.green('✓ Logo is used in Header component'));
  } else {
    console.log(chalk.red('✗ Logo is not used in Header component'));
    allPassed = false;
  }
  
  if (containsPattern(loginPage, 'klararety-logo.png')) {
    console.log(chalk.green('✓ Logo is used in Login page'));
  } else {
    console.log(chalk.red('✗ Logo is not used in Login page'));
    allPassed = false;
  }
  
  // 2. Check for theme consistency
  console.log(chalk.yellow('\nChecking theme consistency:'));
  
  const tailwindConfig = readFileContent(path.join(projectRoot, 'tailwind.config.js'));
  const globalCss = readFileContent(path.join(projectRoot, 'styles', 'global.css'));
  
  if (containsPattern(tailwindConfig, 'theme: {') && 
      containsPattern(tailwindConfig, 'colors: {') && 
      containsPattern(tailwindConfig, 'primary:')) {
    console.log(chalk.green('✓ Tailwind config contains theme colors'));
  } else {
    console.log(chalk.red('✗ Tailwind config missing theme colors'));
    allPassed = false;
  }
  
  if (containsPattern(globalCss, ':root') && 
      containsPattern(globalCss, '--color-primary')) {
    console.log(chalk.green('✓ Global CSS contains theme color variables'));
  } else {
    console.log(chalk.red('✗ Global CSS missing theme color variables'));
    allPassed = false;
  }
  
  // 3. Check for authentication flow consistency
  console.log(chalk.yellow('\nChecking authentication flow consistency:'));
  
  const authContext = readFileContent(path.join(projectRoot, 'contexts', 'AuthContext.js'));
  const authApi = readFileContent(path.join(projectRoot, 'api', 'auth.js'));
  const loginApi = readFileContent(path.join(projectRoot, 'app', 'api', 'auth', 'login', 'route.js'));
  
  if (authContext && authApi && loginApi) {
    console.log(chalk.green('✓ Authentication files exist'));
    
    // Check for login function in AuthContext
    if (containsPattern(authContext, 'login') && 
        containsPattern(authContext, 'logout') && 
        containsPattern(authContext, 'user')) {
      console.log(chalk.green('✓ AuthContext contains required authentication functions'));
    } else {
      console.log(chalk.red('✗ AuthContext missing required authentication functions'));
      allPassed = false;
    }
    
    // Check for API methods in auth.js
    if (containsPattern(authApi, 'login:') && 
        containsPattern(authApi, 'logout:') && 
        containsPattern(authApi, 'getCurrentUser:')) {
      console.log(chalk.green('✓ Auth API contains required methods'));
    } else {
      console.log(chalk.red('✗ Auth API missing required methods'));
      allPassed = false;
    }
  } else {
    console.log(chalk.red('✗ Some authentication files are missing'));
    allPassed = false;
  }
  
  // 4. Check for 2FA consistency
  console.log(chalk.yellow('\nChecking 2FA consistency:'));
  
  const twoFAForm = readFileContent(path.join(projectRoot, 'components', 'auth', 'TwoFactorAuthForm.jsx'));
  const setup2FAApi = readFileContent(path.join(projectRoot, 'app', 'api', 'auth', 'setup-2fa', 'route.js'));
  const verify2FAApi = readFileContent(path.join(projectRoot, 'app', 'api', 'auth', 'verify-2fa', 'route.js'));
  
  if (twoFAForm && setup2FAApi && verify2FAApi) {
    console.log(chalk.green('✓ 2FA files exist'));
    
    // Check for 2FA functions in AuthContext
    if (containsPattern(authContext, 'setup2FA') && 
        containsPattern(authContext, 'verify2FA') && 
        containsPattern(authContext, 'confirm2FA')) {
      console.log(chalk.green('✓ AuthContext contains required 2FA functions'));
    } else {
      console.log(chalk.red('✗ AuthContext missing required 2FA functions'));
      allPassed = false;
    }
    
    // Check for 2FA methods in auth.js
    if (containsPattern(authApi, 'setup2FA:') && 
        containsPattern(authApi, 'verify2FA:') && 
        containsPattern(authApi, 'confirm2FA:')) {
      console.log(chalk.green('✓ Auth API contains required 2FA methods'));
    } else {
      console.log(chalk.red('✗ Auth API missing required 2FA methods'));
      allPassed = false;
    }
  } else {
    console.log(chalk.red('✗ Some 2FA files are missing'));
    allPassed = false;
  }
  
  // 5. Check for dashboard consistency
  console.log(chalk.yellow('\nChecking dashboard consistency:'));
  
  const dashboardFiles = [
    'patient/page.js',
    'provider/page.js',
    'admin/page.js',
    'pharmco/page.js'
  ];
  
  let dashboardsExist = true;
  
  dashboardFiles.forEach(file => {
    const filePath = path.join(projectRoot, 'app', 'dashboard', file);
    if (fileExists(filePath)) {
      console.log(chalk.green(`✓ Dashboard file exists: ${file}`));
    } else {
      console.log(chalk.red(`✗ Dashboard file missing: ${file}`));
      dashboardsExist = false;
      allPassed = false;
    }
  });
  
  if (dashboardsExist) {
    // Check for role-based access in dashboards
    const patientDashboard = readFileContent(path.join(projectRoot, 'app', 'dashboard', 'patient', 'page.js'));
    const providerDashboard = readFileContent(path.join(projectRoot, 'app', 'dashboard', 'provider', 'page.js'));
    
    if (containsPattern(patientDashboard, 'role="patient"') && 
        containsPattern(providerDashboard, 'role="provider"')) {
      console.log(chalk.green('✓ Dashboards contain role-specific attributes'));
    } else {
      console.log(chalk.red('✗ Dashboards missing role-specific attributes'));
      allPassed = false;
    }
  }
  
  // 6. Check for consent functionality consistency
  console.log(chalk.yellow('\nChecking consent functionality consistency:'));
  
  const consentPage = readFileContent(path.join(projectRoot, 'app', 'profile', 'consent', 'page.js'));
  const communityPage = readFileContent(path.join(projectRoot, 'app', 'community', 'page.js'));
  
  if (consentPage && communityPage) {
    console.log(chalk.green('✓ Consent and community pages exist'));
    
    // Check for consent check in community page
    if (containsPattern(communityPage, 'data_sharing_consent') && 
        containsPattern(communityPage, 'hasConsent')) {
      console.log(chalk.green('✓ Community page checks for user consent'));
    } else {
      console.log(chalk.red('✗ Community page missing consent check'));
      allPassed = false;
    }
    
    // Check for consent toggle in consent page
    if (containsPattern(consentPage, 'data_sharing_consent') && 
        containsPattern(consentPage, 'handleConsentChange')) {
      console.log(chalk.green('✓ Consent page contains consent toggle functionality'));
    } else {
      console.log(chalk.red('✗ Consent page missing consent toggle functionality'));
      allPassed = false;
    }
  } else {
    console.log(chalk.red('✗ Consent or community page is missing'));
    allPassed = false;
  }
  
  // 7. Check for middleware consistency
  console.log(chalk.yellow('\nChecking middleware consistency:'));
  
  const middleware = readFileContent(path.join(projectRoot, 'app', 'middleware.js'));
  
  if (middleware) {
    console.log(chalk.green('✓ Middleware file exists'));
    
    // Check for authentication check in middleware
    if (containsPattern(middleware, 'accessToken') && 
        containsPattern(middleware, 'publicRoutes') && 
        containsPattern(middleware, 'NextResponse.redirect')) {
      console.log(chalk.green('✓ Middleware contains authentication checks'));
    } else {
      console.log(chalk.red('✗ Middleware missing authentication checks'));
      allPassed = false;
    }
  } else {
    console.log(chalk.red('✗ Middleware file is missing'));
    allPassed = false;
  }
  
  // 8. Check for API route consistency
  console.log(chalk.yellow('\nChecking API route consistency:'));
  
  const apiRoutes = [
    'auth/login/route.js',
    'auth/logout/route.js',
    'auth/me/route.js',
    'auth/forgot-password/route.js',
    'auth/reset-password/route.js',
    'auth/verify-2fa/route.js',
    'auth/setup-2fa/route.js',
    'auth/confirm-2fa/route.js',
    'auth/disable-2fa/route.js'
  ];
  
  let apiRoutesExist = true;
  
  apiRoutes.forEach(route => {
    const filePath = path.join(projectRoot, 'app', 'api', route);
    if (fileExists(filePath)) {
      console.log(chalk.green(`✓ API route exists: ${route}`));
    } else {
      console.log(chalk.red(`✗ API route missing: ${route}`));
      apiRoutesExist = false;
      allPassed = false;
    }
  });
  
  // 9. Final verification
  console.log(chalk.yellow('\nFinal verification:'));
  
  if (allPassed) {
    console.log(chalk.green('✓ All sync and congruency checks PASSED'));
    console.log(chalk.green('The application is consistent across components, routes, and API endpoints'));
  } else {
    console.log(chalk.red('✗ Some sync and congruency checks FAILED'));
    console.log(chalk.red('Please fix the issues highlighted above before deploying the application'));
  }
  
  return allPassed;
}

// Run the verification
verifySync();
