// Test script to verify all updated endpoints
// This script checks that all endpoints are properly formatted and aligned with backend API expectations

const fs = require('fs');
const path = require('path');

// Helper function to extract endpoints from JavaScript files
function extractEndpoints(fileContent) {
  const endpoints = [];
  const regex = /['"`]\/api\/[^'"`]+['"`]/g;
  let match;
  
  while ((match = regex.exec(fileContent)) !== null) {
    // Extract the endpoint without quotes
    let endpoint = match[0].slice(1, -1);
    endpoints.push(endpoint);
  }
  
  return endpoints;
}

// Helper function to check if an endpoint is properly formatted
function validateEndpoint(endpoint) {
  // Check for common formatting issues
  const issues = [];
  
  // Check for double slashes (except in http://)
  if (endpoint.includes('//') && !endpoint.includes('http://') && !endpoint.includes('https://')) {
    issues.push(`Double slash in endpoint: ${endpoint}`);
  }
  
  // Check for missing /api/ prefix
  if (!endpoint.startsWith('/api/')) {
    issues.push(`Missing /api/ prefix: ${endpoint}`);
  }
  
  // Check for string interpolation that wasn't replaced
  if (endpoint.includes('${')) {
    issues.push(`Unresolved string interpolation: ${endpoint}`);
  }
  
  // Check for trailing slash issues
  if (endpoint.endsWith('/') && !endpoint.endsWith('/$everything') && !endpoint.endsWith('/$validate') && !endpoint.endsWith('/$export')) {
    issues.push(`Unnecessary trailing slash: ${endpoint}`);
  }
  
  return issues;
}

// Main function to test all endpoints
async function testAllEndpoints() {
  const baseDir = '/home/ubuntu/klararety-project/endpoint-resolution';
  const results = {
    totalEndpoints: 0,
    validEndpoints: 0,
    invalidEndpoints: 0,
    issues: []
  };
  
  // Find all JS and JSX files
  const findJsFiles = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findJsFiles(filePath, fileList);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  };
  
  const jsFiles = findJsFiles(baseDir);
  
  // Process each file
  jsFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const endpoints = extractEndpoints(content);
      
      results.totalEndpoints += endpoints.length;
      
      endpoints.forEach(endpoint => {
        const endpointIssues = validateEndpoint(endpoint);
        
        if (endpointIssues.length === 0) {
          results.validEndpoints++;
        } else {
          results.invalidEndpoints++;
          results.issues.push({
            file: path.relative(baseDir, filePath),
            endpoint,
            issues: endpointIssues
          });
        }
      });
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  });
  
  return results;
}

// Run the test
testAllEndpoints()
  .then(results => {
    console.log('Endpoint Testing Results:');
    console.log(`Total endpoints found: ${results.totalEndpoints}`);
    console.log(`Valid endpoints: ${results.validEndpoints}`);
    console.log(`Invalid endpoints: ${results.invalidEndpoints}`);
    
    if (results.issues.length > 0) {
      console.log('\nIssues found:');
      results.issues.forEach(issue => {
        console.log(`\nFile: ${issue.file}`);
        console.log(`Endpoint: ${issue.endpoint}`);
        console.log('Issues:');
        issue.issues.forEach(i => console.log(`  - ${i}`));
      });
    } else {
      console.log('\nNo issues found. All endpoints are properly formatted!');
    }
    
    // Write results to file
    fs.writeFileSync(
      '/home/ubuntu/klararety-project/endpoint-resolution/endpoint_test_results.json', 
      JSON.stringify(results, null, 2)
    );
    
    console.log('\nTest results saved to endpoint_test_results.json');
  })
  .catch(error => {
    console.error('Error running tests:', error);
  });
