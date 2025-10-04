#!/usr/bin/env node

/**
 * Black-Cross Setup Verification Script
 * Verifies that the setup was completed successfully
 */

const fs = require('fs');
const path = require('path');

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function directoryExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

function printHeader() {
  console.log('\n' + '═'.repeat(60));
  log('  🔍 Black-Cross Setup Verification', colors.bright + colors.cyan);
  console.log('═'.repeat(60) + '\n');
}

function verifySetup() {
  let allChecks = true;
  let warnings = 0;

  // Check package.json files
  log('Checking package.json files...', colors.bright);
  const packageJsons = [
    'package.json',
    'backend/package.json',
    'frontend/package.json',
  ];
  
  packageJsons.forEach(file => {
    if (fileExists(file)) {
      logSuccess(`${file}`);
    } else {
      logError(`${file} not found`);
      allChecks = false;
    }
  });
  
  console.log();
  
  // Check environment files
  log('Checking environment files...', colors.bright);
  const envFiles = [
    { path: 'backend/.env.example', required: true },
    { path: 'backend/.env', required: false },
    { path: 'frontend/.env.example', required: true },
    { path: 'frontend/.env', required: false },
  ];
  
  envFiles.forEach(file => {
    if (fileExists(file.path)) {
      logSuccess(`${file.path}`);
    } else {
      if (file.required) {
        logError(`${file.path} not found (required)`);
        allChecks = false;
      } else {
        logWarning(`${file.path} not found (run: npm run setup)`);
        warnings++;
      }
    }
  });
  
  console.log();
  
  // Check dependencies
  log('Checking dependencies...', colors.bright);
  const nodeDirs = [
    { path: 'node_modules', name: 'Root dependencies' },
    { path: 'backend/node_modules', name: 'Backend dependencies' },
    { path: 'frontend/node_modules', name: 'Frontend dependencies' },
  ];
  
  nodeDirs.forEach(dir => {
    if (directoryExists(dir.path)) {
      logSuccess(`${dir.name}`);
    } else {
      logWarning(`${dir.name} not installed (run: npm run setup)`);
      warnings++;
    }
  });
  
  console.log();
  
  // Check Prisma
  log('Checking Prisma setup...', colors.bright);
  const prismaFiles = [
    'prisma/schema.prisma',
    'backend/node_modules/.prisma/client/index.js',
  ];
  
  if (fileExists(prismaFiles[0])) {
    logSuccess('Prisma schema found');
  } else {
    logError('Prisma schema not found');
    allChecks = false;
  }
  
  if (fileExists(prismaFiles[1])) {
    logSuccess('Prisma Client generated');
  } else {
    logWarning('Prisma Client not generated (run: npm run prisma:generate)');
    warnings++;
  }
  
  console.log();
  
  // Check documentation
  log('Checking documentation...', colors.bright);
  const docs = [
    'README.md',
    'SETUP.md',
    'GETTING_STARTED.md',
    'CONTRIBUTING.md',
    'backend/README.md',
    'prisma/README.md',
    'docs/INSTALLATION.md',
  ];
  
  docs.forEach(doc => {
    if (fileExists(doc)) {
      logSuccess(`${doc}`);
    } else {
      logError(`${doc} not found`);
      allChecks = false;
    }
  });
  
  console.log();
  
  // Check scripts
  log('Checking npm scripts...', colors.bright);
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const requiredScripts = [
      'setup',
      'dev',
      'dev:backend',
      'dev:frontend',
      'prisma:generate',
      'prisma:migrate',
      'prisma:studio',
      'install:all',
    ];
    
    requiredScripts.forEach(script => {
      if (pkg.scripts && pkg.scripts[script]) {
        logSuccess(`npm run ${script}`);
      } else {
        logError(`npm run ${script} not defined`);
        allChecks = false;
      }
    });
  } catch (error) {
    logError(`Failed to read package.json: ${error.message}`);
    allChecks = false;
  }
  
  console.log();
  
  // Summary
  console.log('═'.repeat(60));
  if (allChecks && warnings === 0) {
    log('✅ All verification checks passed!', colors.bright + colors.green);
    log('\nYour Black-Cross setup is complete and ready to use!', colors.green);
    log('\nNext steps:', colors.bright);
    log('  1. docker-compose up -d postgres', colors.cyan);
    log('  2. npm run prisma:migrate', colors.cyan);
    log('  3. npm run dev', colors.cyan);
  } else if (allChecks && warnings > 0) {
    log(`✅ Structure verified but ${warnings} warning(s) found`, colors.bright + colors.yellow);
    log('\nRun the following to complete setup:', colors.yellow);
    log('  npm run setup', colors.cyan);
  } else {
    log('❌ Verification failed!', colors.bright + colors.red);
    log('\nSome required files or configurations are missing.', colors.red);
    process.exit(1);
  }
  console.log('═'.repeat(60) + '\n');
}

// Main
printHeader();
verifySetup();
