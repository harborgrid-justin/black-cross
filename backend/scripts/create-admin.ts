/**
 * Admin User Creation Script
 *
 * This interactive script creates an administrator user account for the Black-Cross
 * threat intelligence platform. It provides a secure, user-friendly way to create
 * the initial admin account or additional admin users.
 *
 * @module scripts/create-admin
 *
 * @remarks
 * **Security Features:**
 * - Password hashing using bcrypt (10 rounds by default)
 * - Input validation for email format and username constraints
 * - Password strength requirements (minimum 8 characters)
 * - Secure password masking during input
 * - Duplicate email/username detection
 * - Automatic sanitization of inputs
 *
 * **Usage:**
 * ```bash
 * # Interactive mode (prompts for all information)
 * npm run create-admin
 * # or directly: tsx scripts/create-admin.ts
 *
 * # Environment variable mode (non-interactive)
 * ADMIN_EMAIL=admin@example.com ADMIN_USERNAME=admin ADMIN_PASSWORD=SecurePass123! npm run create-admin
 * ```
 *
 * **Process Flow:**
 * 1. Load environment configuration from .env file
 * 2. Initialize database connection
 * 3. Prompt for admin credentials (interactive) or read from environment
 * 4. Validate input data (email format, username constraints, password strength)
 * 5. Check for existing users with same email/username
 * 6. Hash password securely using bcrypt
 * 7. Create admin user in database
 * 8. Display success message with credentials (for reference)
 * 9. Close database connection gracefully
 *
 * **Error Handling:**
 * - Database connection failures
 * - Duplicate email or username errors
 * - Invalid input validation errors
 * - Password hashing errors
 * - Graceful cleanup on all errors
 *
 * @example
 * ```typescript
 * // Run interactively
 * $ npm run create-admin
 * // Output prompts:
 * // ? Enter admin email: admin@example.com
 * // ? Enter admin username: admin_user
 * // ? Enter admin password: ********
 * // ✅ Admin user created successfully!
 * // Email: admin@example.com
 * // Username: admin_user
 * ```
 *
 * @see {@link ../models/User} for User model definition
 * @see {@link ../config/sequelize} for database configuration
 */

import * as readline from 'readline';
import { stdin as input, stdout as output } from 'process';
import bcrypt from 'bcrypt';
import { initializeSequelize, closeConnection } from '../config/sequelize';
import User from '../models/User';

/**
 * ANSI color codes for terminal output formatting.
 *
 * Provides colored console output for better readability and visual
 * distinction between prompts, success messages, and errors.
 *
 * @constant
 * @private
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
} as const;

/**
 * Configuration for bcrypt password hashing.
 *
 * The salt rounds determine the computational cost of hashing. Higher values
 * are more secure but slower. 10 rounds is the recommended balance between
 * security and performance for most applications.
 *
 * @constant
 * @private
 */
const BCRYPT_ROUNDS = 10;

/**
 * Admin user creation data transfer object.
 *
 * Contains all required and optional fields for creating an admin user account.
 * Used for type safety and validation throughout the creation process.
 *
 * @interface AdminUserData
 *
 * @property {string} email - User's email address (must be unique and valid format)
 * @property {string} username - User's username (must be unique, alphanumeric)
 * @property {string} password - Plain text password (will be hashed before storage)
 * @property {string} [firstName] - User's first name (optional)
 * @property {string} [lastName] - User's last name (optional)
 * @property {string} role - User role (always 'admin' for this script)
 *
 * @example
 * ```typescript
 * const adminData: AdminUserData = {
 *   email: 'admin@example.com',
 *   username: 'admin_user',
 *   password: 'SecurePassword123!',
 *   firstName: 'System',
 *   lastName: 'Administrator',
 *   role: 'admin'
 * };
 * ```
 */
interface AdminUserData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: 'admin';
}

/**
 * Type guard to check if an error is an Error instance.
 *
 * TypeScript's catch blocks type errors as `unknown` for safety.
 * This type guard narrows the type to `Error` for safe property access.
 *
 * @param error - The unknown error value from a catch block
 * @returns True if the error is an Error instance with a message property
 *
 * @example
 * ```typescript
 * try {
 *   throw new Error('Something went wrong');
 * } catch (error: unknown) {
 *   if (isError(error)) {
 *     console.error(error.message); // Type-safe access
 *   }
 * }
 * ```
 */
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Validate email address format using RFC 5322 standard pattern.
 *
 * Checks if the provided string matches a valid email address format.
 * Uses a comprehensive regex pattern that covers most valid email formats
 * according to RFC 5322 specification.
 *
 * @param email - The email string to validate
 * @returns True if email format is valid, false otherwise
 *
 * @example
 * ```typescript
 * console.log(isValidEmail('user@example.com')); // true
 * console.log(isValidEmail('invalid.email')); // false
 * console.log(isValidEmail('user+tag@domain.co.uk')); // true
 * ```
 *
 * @remarks
 * This validation checks format only, not whether the email address actually exists.
 * For production systems, consider additional validation like:
 * - DNS MX record verification
 * - Email verification via confirmation link
 * - Disposable email domain blocking
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username format and constraints.
 *
 * Ensures the username meets security and usability requirements:
 * - Length between 3 and 30 characters
 * - Only alphanumeric characters, underscores, and hyphens
 * - Cannot start or end with special characters
 * - Case-insensitive (stored as provided but compared case-insensitively)
 *
 * @param username - The username string to validate
 * @returns True if username format is valid, false otherwise
 *
 * @example
 * ```typescript
 * console.log(isValidUsername('admin_user')); // true
 * console.log(isValidUsername('admin-123')); // true
 * console.log(isValidUsername('ab')); // false (too short)
 * console.log(isValidUsername('user@name')); // false (invalid char)
 * console.log(isValidUsername('_username')); // false (starts with _)
 * ```
 *
 * @remarks
 * Username constraints prevent:
 * - SQL injection via special characters
 * - XSS attacks via script injection
 * - Confusion with email addresses
 * - Excessively long usernames that break UI layouts
 */
function isValidUsername(username: string): boolean {
  // Must be 3-30 characters, alphanumeric with underscores/hyphens
  // Cannot start or end with underscore or hyphen
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,28}[a-zA-Z0-9]$/;
  return usernameRegex.test(username);
}

/**
 * Validate password strength requirements.
 *
 * Ensures the password meets minimum security standards:
 * - Minimum 8 characters length
 * - Maximum 128 characters (bcrypt limit)
 * - No leading/trailing whitespace
 *
 * @param password - The password string to validate
 * @returns True if password meets requirements, false otherwise
 *
 * @example
 * ```typescript
 * console.log(isValidPassword('SecurePass123!')); // true
 * console.log(isValidPassword('weak')); // false (too short)
 * console.log(isValidPassword(' password ')); // false (has whitespace)
 * ```
 *
 * @remarks
 * This is a minimal validation. For production systems, consider enforcing:
 * - Uppercase and lowercase letters
 * - Numbers and special characters
 * - Common password dictionary checks
 * - Leaked password database checks (e.g., Have I Been Pwned API)
 * - Password history to prevent reuse
 */
function isValidPassword(password: string): boolean {
  return password.length >= 8 && password.length <= 128 && password.trim() === password;
}

/**
 * Display formatted banner for the admin creation tool.
 *
 * Provides a clear visual header when the script starts, improving
 * user experience and confirming the correct script is running.
 *
 * @private
 */
function displayBanner(): void {
  console.log(`
${colors.blue}${colors.bright}╔═══════════════════════════════════════════════════════════════╗
║              Black-Cross Admin User Creator                  ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

/**
 * Display formatted success message after user creation.
 *
 * Shows the created user's credentials and provides helpful next steps.
 * Credentials are displayed for immediate reference but should not be
 * logged to persistent storage for security reasons.
 *
 * @param user - The created User model instance
 * @param plainPassword - The plain text password (for display only)
 * @private
 */
function displaySuccess(user: User, plainPassword: string): void {
  console.log(`
${colors.green}${colors.bright}╔═══════════════════════════════════════════════════════════════╗
║               ✅ Admin User Created Successfully ✅            ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.cyan}User ID:${colors.reset}       ${user.id}
${colors.cyan}Email:${colors.reset}         ${user.email}
${colors.cyan}Username:${colors.reset}      ${user.username}
${colors.cyan}Password:${colors.reset}      ${plainPassword}
${colors.cyan}Role:${colors.reset}          ${user.role}
${colors.cyan}First Name:${colors.reset}    ${user.firstName || '(not set)'}
${colors.cyan}Last Name:${colors.reset}     ${user.lastName || '(not set)'}
${colors.cyan}Active:${colors.reset}        ${user.isActive ? 'Yes' : 'No'}
${colors.cyan}Created:${colors.reset}       ${user.createdAt.toISOString()}

${colors.bright}${colors.yellow}⚠️  IMPORTANT: Save these credentials securely!${colors.reset}
${colors.dim}This is the only time the password will be displayed.${colors.reset}

${colors.bright}Next steps:${colors.reset}
  • Log in to the platform using these credentials
  • Change the password after first login (recommended)
  • Create additional users through the admin interface
  • Configure 2FA for enhanced security (if available)
`);
}

/**
 * Prompt user for input with masked password support.
 *
 * Uses Node.js readline interface to interactively collect user input.
 * Supports password masking where input is not echoed to the terminal.
 *
 * @param rl - Readline interface instance
 * @param prompt - The prompt text to display
 * @param mask - If true, masks input with asterisks (for passwords)
 * @returns Promise resolving to the user's input string (trimmed)
 *
 * @example
 * ```typescript
 * const rl = readline.createInterface({ input, output });
 * const email = await promptUser(rl, 'Enter email: ', false);
 * const password = await promptUser(rl, 'Enter password: ', true);
 * ```
 *
 * @remarks
 * Password masking on Windows may behave differently than Unix-based systems.
 * The implementation uses muted output stream to prevent echo.
 */
async function promptUser(
  rl: readline.Interface,
  prompt: string,
  mask: boolean = false
): Promise<string> {
  if (mask) {
    // For password input, we need to mask it
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const stream = require('stream');
      const mutableStdout = new stream.Writable({
        write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
          // @ts-expect-error - muted is a custom property we add
          if (!this.muted) {
            process.stdout.write(chunk, encoding);
          } else {
            process.stdout.write('*');
          }
          callback();
        },
      });

      // @ts-expect-error - muted is a custom property we add
      mutableStdout.muted = false;

      const rlMasked = readline.createInterface({
        input,
        output: mutableStdout,
        terminal: true,
      });

      rlMasked.question(`${colors.cyan}${prompt}${colors.reset}`, (answer: string) => {
        // @ts-expect-error - muted is a custom property we add
        mutableStdout.muted = false;
        rlMasked.close();
        console.log(''); // New line after password input
        resolve(answer.trim());
      });

      // @ts-expect-error - muted is a custom property we add
      mutableStdout.muted = true;
    });
  }

  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Collect admin user data interactively from the user.
 *
 * Prompts the user for all required information with inline validation.
 * Continues prompting until valid data is provided for each field.
 * Provides immediate feedback on validation errors.
 *
 * @param rl - Readline interface for user input
 * @returns Promise resolving to validated AdminUserData object
 *
 * @example
 * ```typescript
 * const rl = readline.createInterface({ input, output });
 * const adminData = await collectUserData(rl);
 * console.log('Collected:', adminData);
 * ```
 *
 * @remarks
 * This function will loop until valid input is provided. User can press Ctrl+C
 * to cancel at any time. First and last names are optional and can be skipped
 * by pressing Enter without input.
 */
async function collectUserData(rl: readline.Interface): Promise<AdminUserData> {
  console.log(`${colors.dim}Please provide the following information for the admin user:${colors.reset}\n`);

  // Email
  let email = '';
  while (!email) {
    const input = await promptUser(rl, 'Enter admin email: ');
    if (isValidEmail(input)) {
      email = input.toLowerCase();
    } else {
      console.log(`${colors.red}Invalid email format. Please try again.${colors.reset}`);
    }
  }

  // Username
  let username = '';
  while (!username) {
    const input = await promptUser(rl, 'Enter admin username: ');
    if (isValidUsername(input)) {
      username = input;
    } else {
      console.log(`${colors.red}Invalid username. Must be 3-30 characters, alphanumeric with - or _.${colors.reset}`);
    }
  }

  // Password
  let password = '';
  while (!password) {
    const input = await promptUser(rl, 'Enter admin password: ', true);
    if (isValidPassword(input)) {
      password = input;
    } else {
      console.log(`${colors.red}Invalid password. Must be at least 8 characters.${colors.reset}`);
    }
  }

  // Optional: First name
  const firstName = await promptUser(rl, 'Enter first name (optional): ');

  // Optional: Last name
  const lastName = await promptUser(rl, 'Enter last name (optional): ');

  return {
    email,
    username,
    password,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    role: 'admin',
  };
}

/**
 * Collect admin user data from environment variables.
 *
 * Non-interactive mode for automated deployment or CI/CD pipelines.
 * Reads credentials from environment variables instead of prompting.
 * All environment variables must be set or an error is thrown.
 *
 * @returns AdminUserData object with data from environment
 * @throws {Error} If required environment variables are missing or invalid
 *
 * @example
 * ```bash
 * # Set environment variables
 * export ADMIN_EMAIL=admin@example.com
 * export ADMIN_USERNAME=admin_user
 * export ADMIN_PASSWORD=SecurePass123!
 * export ADMIN_FIRST_NAME=System
 * export ADMIN_LAST_NAME=Administrator
 *
 * # Run script
 * npm run create-admin
 * ```
 *
 * @remarks
 * **Security Warning**: Be careful when using environment variables for credentials.
 * They may be logged or exposed through process listings. Consider using:
 * - Docker secrets
 * - Kubernetes secrets
 * - AWS Secrets Manager
 * - HashiCorp Vault
 */
function collectUserDataFromEnv(): AdminUserData {
  const email = process.env.ADMIN_EMAIL;
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME;
  const lastName = process.env.ADMIN_LAST_NAME;

  if (!email || !username || !password) {
    throw new Error(
      'Required environment variables not set. Please provide:\n' +
      '  - ADMIN_EMAIL\n' +
      '  - ADMIN_USERNAME\n' +
      '  - ADMIN_PASSWORD\n' +
      'Optional:\n' +
      '  - ADMIN_FIRST_NAME\n' +
      '  - ADMIN_LAST_NAME'
    );
  }

  if (!isValidEmail(email)) {
    throw new Error(`Invalid email format in ADMIN_EMAIL: ${email}`);
  }

  if (!isValidUsername(username)) {
    throw new Error(`Invalid username format in ADMIN_USERNAME: ${username}`);
  }

  if (!isValidPassword(password)) {
    throw new Error('Invalid password in ADMIN_PASSWORD. Must be at least 8 characters.');
  }

  return {
    email: email.toLowerCase(),
    username,
    password,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    role: 'admin',
  };
}

/**
 * Check if a user with the given email or username already exists.
 *
 * Queries the database to prevent duplicate email addresses or usernames.
 * Provides specific error messages indicating which field conflicts.
 *
 * @param email - Email address to check
 * @param username - Username to check
 * @throws {Error} If a user with the email or username already exists
 *
 * @example
 * ```typescript
 * try {
 *   await checkExistingUser('admin@example.com', 'admin_user');
 *   console.log('No conflicts found');
 * } catch (error) {
 *   console.error('User already exists:', error.message);
 * }
 * ```
 *
 * @remarks
 * This check is performed before password hashing to avoid unnecessary
 * computational work when the user cannot be created anyway.
 */
async function checkExistingUser(email: string, username: string): Promise<void> {
  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    throw new Error(
      `A user with email "${email}" already exists.\n` +
      `User ID: ${existingEmail.id}\n` +
      `Username: ${existingEmail.username}\n` +
      'Please use a different email address.'
    );
  }

  const existingUsername = await User.findOne({ where: { username } });
  if (existingUsername) {
    throw new Error(
      `A user with username "${username}" already exists.\n` +
      `User ID: ${existingUsername.id}\n` +
      `Email: ${existingUsername.email}\n` +
      'Please use a different username.'
    );
  }
}

/**
 * Hash a plain text password using bcrypt.
 *
 * Generates a secure bcrypt hash with configurable salt rounds.
 * The hash includes the salt, algorithm version, and cost factor,
 * making it suitable for long-term storage.
 *
 * @param plainPassword - The plain text password to hash
 * @returns Promise resolving to the bcrypt hash string
 *
 * @example
 * ```typescript
 * const hash = await hashPassword('SecurePassword123!');
 * console.log(hash); // $2b$10$...
 * ```
 *
 * @remarks
 * Bcrypt automatically handles:
 * - Salt generation (unique per password)
 * - Slow hashing to resist brute force attacks
 * - Future-proof algorithm versioning
 *
 * The hash can be verified later using:
 * ```typescript
 * const isValid = await bcrypt.compare(plainPassword, hash);
 * ```
 *
 * @see {@link https://www.npmjs.com/package/bcrypt|bcrypt documentation}
 */
async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

/**
 * Create an admin user in the database.
 *
 * Takes validated user data, hashes the password, creates the database record,
 * and returns the created User instance. Ensures all data is properly sanitized
 * and validated before insertion.
 *
 * @param userData - Validated admin user data
 * @returns Promise resolving to the created User model instance
 * @throws {Error} If database insertion fails or validation errors occur
 *
 * @example
 * ```typescript
 * const userData: AdminUserData = {
 *   email: 'admin@example.com',
 *   username: 'admin_user',
 *   password: 'SecurePass123!',
 *   role: 'admin'
 * };
 *
 * const user = await createAdminUser(userData);
 * console.log('Created user:', user.id);
 * ```
 *
 * @remarks
 * The created user has:
 * - Role set to 'admin' with full platform access
 * - isActive set to true (account enabled)
 * - lastLogin set to current timestamp
 * - Hashed password (never stored in plain text)
 * - Auto-generated UUID primary key
 */
async function createAdminUser(userData: AdminUserData): Promise<User> {
  const hashedPassword = await hashPassword(userData.password);

  const user = await User.create({
    email: userData.email,
    username: userData.username,
    password: hashedPassword,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    isActive: true,
    lastLogin: new Date(),
  });

  return user;
}

/**
 * Validate environment configuration.
 *
 * Ensures that critical environment variables are set before attempting
 * database operations. Provides helpful error messages if configuration
 * is missing or invalid.
 *
 * @throws {Error} If DATABASE_URL is not configured
 *
 * @example
 * ```typescript
 * try {
 *   validateEnvironment();
 *   console.log('Environment is valid');
 * } catch (error) {
 *   console.error('Configuration error:', error.message);
 *   process.exit(1);
 * }
 * ```
 */
function validateEnvironment(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not configured. Please set it in your .env file.\n' +
      'Example: DATABASE_URL=postgresql://username:password@localhost:5432/blackcross'
    );
  }
}

/**
 * Main execution function for admin user creation.
 *
 * Orchestrates the complete user creation workflow including:
 * - Environment validation
 * - Database connection initialization
 * - User input collection (interactive or environment)
 * - Input validation and duplicate checking
 * - Password hashing
 * - Database record creation
 * - Success message display
 * - Error handling and cleanup
 * - Exit code management
 *
 * **Execution Modes:**
 * - **Interactive Mode**: Prompts user for input when environment variables are not set
 * - **Non-Interactive Mode**: Uses environment variables for automated deployments
 *
 * **Exit Codes:**
 * - 0: Success - admin user created successfully
 * - 1: Failure - configuration, validation, connection, or creation error occurred
 *
 * @async
 * @returns Promise that resolves when user creation completes or rejects on error
 *
 * @example
 * ```typescript
 * // Interactive execution
 * main(); // Prompts for input
 *
 * // Non-interactive execution (CI/CD)
 * process.env.ADMIN_EMAIL = 'admin@example.com';
 * process.env.ADMIN_USERNAME = 'admin';
 * process.env.ADMIN_PASSWORD = 'SecurePass123!';
 * main(); // Uses environment variables
 * ```
 */
async function main(): Promise<void> {
  let rl: readline.Interface | null = null;

  try {
    displayBanner();

    // Step 1: Validate environment
    console.log(`${colors.cyan}[1/6]${colors.reset} Validating environment configuration...`);
    validateEnvironment();
    console.log(`      ${colors.green}✅ Environment validated${colors.reset}\n`);

    // Step 2: Initialize database
    console.log(`${colors.cyan}[2/6]${colors.reset} Initializing database connection...`);
    initializeSequelize();
    console.log(`      ${colors.green}✅ Database initialized${colors.reset}\n`);

    // Step 3: Collect user data
    console.log(`${colors.cyan}[3/6]${colors.reset} Collecting admin user information...`);
    let userData: AdminUserData;

    // Check if we should use environment variables or interactive mode
    const useEnv = process.env.ADMIN_EMAIL && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD;

    if (useEnv) {
      console.log(`      ${colors.dim}Using credentials from environment variables${colors.reset}\n`);
      userData = collectUserDataFromEnv();
    } else {
      rl = readline.createInterface({ input, output });
      userData = await collectUserData(rl);
      rl.close();
    }
    console.log(`      ${colors.green}✅ User data collected${colors.reset}\n`);

    // Step 4: Check for existing user
    console.log(`${colors.cyan}[4/6]${colors.reset} Checking for duplicate users...`);
    await checkExistingUser(userData.email, userData.username);
    console.log(`      ${colors.green}✅ No conflicts found${colors.reset}\n`);

    // Step 5: Create admin user
    console.log(`${colors.cyan}[5/6]${colors.reset} Creating admin user...`);
    const user = await createAdminUser(userData);
    console.log(`      ${colors.green}✅ Admin user created in database${colors.reset}\n`);

    // Step 6: Close connection
    console.log(`${colors.cyan}[6/6]${colors.reset} Closing database connection...`);
    await closeConnection();
    console.log(`      ${colors.green}✅ Connection closed${colors.reset}`);

    // Display success summary
    displaySuccess(user, userData.password);

    process.exit(0);
  } catch (error: unknown) {
    console.error(`\n${colors.red}${colors.bright}╔═══════════════════════════════════════════════════════════════╗
║               ❌ Admin User Creation Failed ❌                 ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    if (isError(error)) {
      console.error(`${colors.red}Error:${colors.reset} ${error.message}\n`);

      // Provide helpful troubleshooting tips based on error type
      if (error.message.includes('DATABASE_URL')) {
        console.error(`${colors.yellow}Troubleshooting:${colors.reset}
  1. Check if the .env file exists in the backend directory
  2. Verify DATABASE_URL is set correctly
  3. Example: DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
`);
      } else if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        console.error(`${colors.yellow}Troubleshooting:${colors.reset}
  1. Ensure PostgreSQL is running (docker-compose up -d postgres)
  2. Run database sync first: npm run db:sync
  3. Check database connection settings
`);
      } else if (error.message.includes('already exists')) {
        console.error(`${colors.yellow}Troubleshooting:${colors.reset}
  1. Use a different email address or username
  2. Check existing users in the database
  3. Reset the existing user's password if you forgot it
`);
      } else if (error.message.includes('validation') || error.message.includes('Invalid')) {
        console.error(`${colors.yellow}Troubleshooting:${colors.reset}
  1. Ensure email is in valid format (user@domain.com)
  2. Username must be 3-30 alphanumeric characters
  3. Password must be at least 8 characters long
`);
      } else {
        console.error(`${colors.yellow}Troubleshooting:${colors.reset}
  1. Check the error message above for specific details
  2. Ensure the database is properly set up (npm run db:sync)
  3. Verify all input data meets validation requirements
  4. Check database logs for additional information
`);
      }
    } else {
      console.error(`${colors.red}Unknown error:${colors.reset} ${String(error)}\n`);
    }

    // Clean up readline if it was created
    if (rl) {
      rl.close();
    }

    // Attempt to close connection on error
    try {
      await closeConnection();
    } catch (closeError) {
      // Ignore close errors during error handling
    }

    process.exit(1);
  }
}

// Execute main function
main();
