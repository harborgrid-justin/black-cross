#!/usr/bin/env node

/**
 * Black-Cross Setup Script
 * Automated setup for complete installation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log('='.repeat(60) + '\n');
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

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function copyFile(src, dest) {
  if (!fileExists(src)) {
    logError(`Source file not found: ${src}`);
    return false;
  }
  
  if (fileExists(dest)) {
    logWarning(`File already exists: ${dest} (skipping)`);
    return true;
  }
  
  try {
    fs.copyFileSync(src, dest);
    logSuccess(`Created ${dest}`);
    return true;
  } catch (error) {
    logError(`Failed to copy ${src} to ${dest}: ${error.message}`);
    return false;
  }
}

function checkPrerequisites() {
  logSection('Checking Prerequisites');
  
  let allGood = true;
  
  // Check Node.js version
  const nodeVersion = process.version;
  const nodeVersionNum = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (nodeVersionNum >= 16) {
    logSuccess(`Node.js ${nodeVersion} (requires 16+)`);
  } else {
    logError(`Node.js ${nodeVersion} is too old. Requires 16+`);
    allGood = false;
  }
  
  // Check npm
  const npmCheck = execCommand('npm --version', { silent: true });
  if (npmCheck.success) {
    logSuccess(`npm ${npmCheck.output.trim()}`);
  } else {
    logError('npm not found');
    allGood = false;
  }
  
  // Check git
  const gitCheck = execCommand('git --version', { silent: true });
  if (gitCheck.success) {
    logSuccess(`git installed`);
  } else {
    logWarning('git not found (optional but recommended)');
  }
  
  // Check PostgreSQL (optional)
  const pgCheck = execCommand('psql --version', { silent: true });
  if (pgCheck.success) {
    logSuccess(`PostgreSQL installed`);
  } else {
    logInfo('PostgreSQL not found locally (you can use Docker instead)');
  }
  
  // Check Docker (optional)
  const dockerCheck = execCommand('docker --version', { silent: true });
  if (dockerCheck.success) {
    logSuccess(`Docker installed`);
  } else {
    logInfo('Docker not found (optional - needed for running services)');
  }
  
  return allGood;
}

function installDependencies() {
  logSection('Installing Dependencies');
  
  // Install root dependencies
  logInfo('Installing root dependencies...');
  const rootInstall = execCommand('npm install');
  if (!rootInstall.success) {
    logError('Failed to install root dependencies');
    return false;
  }
  logSuccess('Root dependencies installed');
  
  // Install backend dependencies
  logInfo('Installing backend dependencies...');
  const backendInstall = execCommand('cd backend && npm install');
  if (!backendInstall.success) {
    logError('Failed to install backend dependencies');
    return false;
  }
  logSuccess('Backend dependencies installed');
  
  // Install frontend dependencies
  logInfo('Installing frontend dependencies...');
  const frontendInstall = execCommand('cd frontend && npm install');
  if (!frontendInstall.success) {
    logError('Failed to install frontend dependencies');
    return false;
  }
  logSuccess('Frontend dependencies installed');
  
  return true;
}

function setupEnvironmentFiles() {
  logSection('Setting Up Environment Files');
  
  let allGood = true;
  
  // Setup backend .env
  if (!copyFile('backend/.env.example', 'backend/.env')) {
    allGood = false;
  }
  
  // Setup frontend .env
  if (!copyFile('frontend/.env.example', 'frontend/.env')) {
    allGood = false;
  }
  
  if (allGood) {
    logInfo('\nEnvironment files created with default values.');
    logWarning('Important: Review and update these files with your configuration:');
    log('  - backend/.env  (database credentials, API keys, secrets)', colors.yellow);
    log('  - frontend/.env (API URL)', colors.yellow);
  }
  
  return allGood;
}

function setupPrisma() {
  logSection('Setting Up Prisma ORM');
  
  // Generate Prisma Client
  logInfo('Generating Prisma Client...');
  const generateResult = execCommand('cd backend && npm run prisma:generate');
  if (!generateResult.success) {
    logError('Failed to generate Prisma Client');
    logInfo('This is usually because DATABASE_URL is not set in backend/.env');
    return false;
  }
  logSuccess('Prisma Client generated');
  
  // Ask about running migrations
  logInfo('\nDatabase migrations can be run with: npm run prisma:migrate');
  logWarning('Note: This requires a PostgreSQL database to be running.');
  logInfo('You can start PostgreSQL with Docker: docker-compose up -d postgres');
  
  return true;
}

function verifySetup() {
  logSection('Verifying Setup');
  
  const checks = [
    { name: 'Root package.json', path: 'package.json' },
    { name: 'Backend package.json', path: 'backend/package.json' },
    { name: 'Frontend package.json', path: 'frontend/package.json' },
    { name: 'Backend .env', path: 'backend/.env' },
    { name: 'Frontend .env', path: 'frontend/.env' },
    { name: 'Prisma schema', path: 'prisma/schema.prisma' },
    { name: 'Backend node_modules', path: 'backend/node_modules' },
    { name: 'Frontend node_modules', path: 'frontend/node_modules' },
  ];
  
  let allGood = true;
  checks.forEach(check => {
    if (fileExists(check.path)) {
      logSuccess(check.name);
    } else {
      logError(`${check.name} not found`);
      allGood = false;
    }
  });
  
  return allGood;
}

function printNextSteps() {
  logSection('Setup Complete! 🎉');
  
  console.log('Next steps to get Black-Cross running:\n');
  
  log('1. Configure Environment Variables', colors.bright);
  log('   Edit backend/.env with your settings:', colors.cyan);
  log('   - DATABASE_URL (PostgreSQL connection string)');
  log('   - JWT_SECRET, ENCRYPTION_KEY, SESSION_SECRET (security)');
  log('   - API keys for threat intelligence feeds (optional)\n');
  
  log('2. Start PostgreSQL Database', colors.bright);
  log('   Option A - Using Docker (recommended):', colors.cyan);
  log('   $ docker-compose up -d postgres\n');
  log('   Option B - Use your own PostgreSQL server', colors.cyan);
  log('   Make sure it\'s running and accessible\n');
  
  log('3. Run Database Migrations', colors.bright);
  log('   $ npm run prisma:migrate', colors.cyan);
  log('   This creates all necessary database tables\n');
  
  log('4. Start the Application', colors.bright);
  log('   $ npm run dev', colors.cyan);
  log('   This starts both frontend and backend\n');
  
  log('5. Access the Application', colors.bright);
  log('   Frontend: http://localhost:3000', colors.green);
  log('   Backend:  http://localhost:8080', colors.green);
  log('   Default credentials: admin@black-cross.io / admin', colors.yellow);
  log('   ⚠️  Change password immediately after first login!\n');
  
  log('Optional: View Database with Prisma Studio', colors.bright);
  log('   $ npm run prisma:studio\n', colors.cyan);
  
  log('For detailed documentation, see:', colors.bright);
  log('   - README.md', colors.cyan);
  log('   - GETTING_STARTED.md', colors.cyan);
  log('   - docs/INSTALLATION.md', colors.cyan);
  
  console.log('\n' + '='.repeat(60));
  log('Need help? Check the documentation or open an issue on GitHub', colors.blue);
  console.log('='.repeat(60) + '\n');
}

function printHeader() {
  console.log('\n' + '═'.repeat(60));
  log('  🚀 Black-Cross Setup Wizard', colors.bright + colors.cyan);
  log('  Enterprise Cyber Threat Intelligence Platform', colors.cyan);
  console.log('═'.repeat(60) + '\n');
}

// Main setup function
async function main() {
  printHeader();
  
  let exitCode = 0;
  
  try {
    // Step 1: Check prerequisites
    if (!checkPrerequisites()) {
      logError('\nPrerequisite check failed. Please install required software.');
      process.exit(1);
    }
    
    // Step 2: Install dependencies
    if (!installDependencies()) {
      logError('\nDependency installation failed.');
      exitCode = 1;
    }
    
    // Step 3: Setup environment files
    if (!setupEnvironmentFiles()) {
      logWarning('\nEnvironment file setup had issues, but continuing...');
    }
    
    // Step 4: Setup Prisma
    if (!setupPrisma()) {
      logWarning('\nPrisma setup had issues. You may need to run it manually.');
      logInfo('Run: npm run prisma:generate after setting up DATABASE_URL');
    }
    
    // Step 5: Verify setup
    if (!verifySetup()) {
      logWarning('\nSetup verification found some issues.');
      exitCode = 1;
    }
    
    // Print next steps
    printNextSteps();
    
  } catch (error) {
    logError(`\nSetup failed with error: ${error.message}`);
    console.error(error);
    exitCode = 1;
  }
  
  process.exit(exitCode);
}

// Run the setup
main();
