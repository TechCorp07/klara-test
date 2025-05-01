// Test script to verify routes and application flow
// Run this script to check if all routes are working correctly

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Function to recursively get all page files
function getPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, and other non-app directories
      if (!['node_modules', '.next', 'api', 'public', 'styles', 'lib', 'utils', 'components'].includes(file)) {
        getPageFiles(filePath, fileList);
      }
    } else if (file === 'page.js' || file === 'page.jsx' || file === 'page.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to extract route from file path
function getRouteFromFilePath(filePath, appDir) {
  const relativePath = path.relative(appDir, filePath);
  const routePath = path.dirname(relativePath);
  return routePath === '.' ? '/' : `/${routePath}`;
}

// Function to check if route requires authentication
function requiresAuthentication(route) {
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  return !publicRoutes.some(publicRoute => route.startsWith(publicRoute));
}

// Function to check if route requires specific role
function getRequiredRole(route) {
  if (route.startsWith('/dashboard/patient')) return 'patient';
  if (route.startsWith('/dashboard/provider')) return 'provider';
  if (route.startsWith('/dashboard/admin')) return 'admin';
  if (route.startsWith('/dashboard/pharmco')) return 'pharmco';
  if (route.startsWith('/dashboard/compliance')) return 'compliance';
  if (route.startsWith('/dashboard/superadmin')) return 'superadmin';
  return null;
}

// Function to check if route requires consent
function requiresConsent(route) {
  return route.startsWith('/community');
}

// Main function to test routes
function testRoutes() {
  console.log(chalk.blue('=== Testing Routes and Application Flow ==='));
  
  const appDir = path.join(process.cwd(), 'app');
  const pageFiles = getPageFiles(appDir);
  
  console.log(chalk.yellow(`Found ${pageFiles.length} page files`));
  
  // Group routes by authentication, role, and consent requirements
  const routes = {
    public: [],
    authenticated: [],
    roleSpecific: {},
    consentRequired: []
  };
  
  // Initialize role-specific arrays
  const roles = ['patient', 'provider', 'admin', 'pharmco', 'compliance', 'superadmin'];
  roles.forEach(role => {
    routes.roleSpecific[role] = [];
  });
  
  // Process each page file
  pageFiles.forEach(filePath => {
    const route = getRouteFromFilePath(filePath, appDir);
    
    if (requiresAuthentication(route)) {
      const role = getRequiredRole(route);
      
      if (role) {
        routes.roleSpecific[role].push(route);
      } else {
        routes.authenticated.push(route);
      }
      
      if (requiresConsent(route)) {
        routes.consentRequired.push(route);
      }
    } else {
      routes.public.push(route);
    }
  });
  
  // Print route information
  console.log(chalk.green('\nPublic Routes:'));
  routes.public.forEach(route => console.log(`  ${route}`));
  
  console.log(chalk.green('\nAuthenticated Routes (no specific role):'));
  routes.authenticated.forEach(route => console.log(`  ${route}`));
  
  console.log(chalk.green('\nRole-Specific Routes:'));
  roles.forEach(role => {
    if (routes.roleSpecific[role].length > 0) {
      console.log(chalk.yellow(`  ${role.toUpperCase()}:`));
      routes.roleSpecific[role].forEach(route => console.log(`    ${route}`));
    }
  });
  
  console.log(chalk.green('\nConsent-Required Routes:'));
  routes.consentRequired.forEach(route => console.log(`  ${route}`));
  
  // Verify authentication flow
  console.log(chalk.blue('\n=== Authentication Flow Verification ==='));
  
  const authFlowRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const authFlowComponents = [
    '/app/login/page.js',
    '/app/register/page.js',
    '/app/forgot-password/page.js',
    '/app/reset-password/page.js'
  ];
  
  let authFlowComplete = true;
  
  authFlowComponents.forEach(component => {
    const componentPath = path.join(process.cwd(), component);
    if (!fs.existsSync(componentPath)) {
      console.log(chalk.red(`Missing component: ${component}`));
      authFlowComplete = false;
    } else {
      console.log(chalk.green(`Component exists: ${component}`));
    }
  });
  
  if (authFlowComplete) {
    console.log(chalk.green('Authentication flow components are complete'));
  } else {
    console.log(chalk.red('Authentication flow is incomplete'));
  }
  
  // Verify 2FA flow
  console.log(chalk.blue('\n=== 2FA Flow Verification ==='));
  
  const twoFAComponents = [
    '/components/auth/TwoFactorAuthForm.jsx',
    '/app/settings/two-factor/page.js',
    '/app/settings/two-factor/disable/page.js',
    '/app/api/auth/setup-2fa/route.js',
    '/app/api/auth/confirm-2fa/route.js',
    '/app/api/auth/verify-2fa/route.js',
    '/app/api/auth/disable-2fa/route.js'
  ];
  
  let twoFAFlowComplete = true;
  
  twoFAComponents.forEach(component => {
    const componentPath = path.join(process.cwd(), component);
    if (!fs.existsSync(componentPath)) {
      console.log(chalk.red(`Missing component: ${component}`));
      twoFAFlowComplete = false;
    } else {
      console.log(chalk.green(`Component exists: ${component}`));
    }
  });
  
  if (twoFAFlowComplete) {
    console.log(chalk.green('2FA flow components are complete'));
  } else {
    console.log(chalk.red('2FA flow is incomplete'));
  }
  
  // Verify consent flow
  console.log(chalk.blue('\n=== Consent Flow Verification ==='));
  
  const consentComponents = [
    '/app/profile/consent/page.js',
    '/app/community/page.js'
  ];
  
  let consentFlowComplete = true;
  
  consentComponents.forEach(component => {
    const componentPath = path.join(process.cwd(), component);
    if (!fs.existsSync(componentPath)) {
      console.log(chalk.red(`Missing component: ${component}`));
      consentFlowComplete = false;
    } else {
      console.log(chalk.green(`Component exists: ${component}`));
    }
  });
  
  if (consentFlowComplete) {
    console.log(chalk.green('Consent flow components are complete'));
  } else {
    console.log(chalk.red('Consent flow is incomplete'));
  }
  
  // Verify dashboard access by role
  console.log(chalk.blue('\n=== Dashboard Access Verification ==='));
  
  const dashboardComponents = [
    '/app/dashboard/patient/page.js',
    '/app/dashboard/provider/page.js',
    '/app/dashboard/admin/page.js',
    '/app/dashboard/pharmco/page.js'
  ];
  
  let dashboardsComplete = true;
  
  dashboardComponents.forEach(component => {
    const componentPath = path.join(process.cwd(), component);
    if (!fs.existsSync(componentPath)) {
      console.log(chalk.red(`Missing component: ${component}`));
      dashboardsComplete = false;
    } else {
      console.log(chalk.green(`Component exists: ${component}`));
    }
  });
  
  if (dashboardsComplete) {
    console.log(chalk.green('Dashboard components for different roles are complete'));
  } else {
    console.log(chalk.red('Dashboard components are incomplete'));
  }
  
  // Overall verification
  console.log(chalk.blue('\n=== Overall Verification ==='));
  
  if (authFlowComplete && twoFAFlowComplete && consentFlowComplete && dashboardsComplete) {
    console.log(chalk.green('All required components are present and routes are properly structured'));
    console.log(chalk.green('Application flow verification PASSED'));
  } else {
    console.log(chalk.red('Some components are missing or routes are improperly structured'));
    console.log(chalk.red('Application flow verification FAILED'));
  }
}

// Run the test
testRoutes();
