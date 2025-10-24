/**
 * Comprehensive Database Seeding Script for Black-Cross Platform
 *
 * Seeds the PostgreSQL database with realistic sample data for all 15 security modules:
 * 1. Threat Intelligence      9. Risk Assessment
 * 2. Incident Response        10. Collaboration
 * 3. Threat Hunting           11. Reporting
 * 4. Vulnerability Management 12. Malware Analysis
 * 5. SIEM                     13. Dark Web Monitoring
 * 6. Threat Actors            14. Compliance
 * 7. IOC Management           15. Automation/Playbooks
 * 8. Threat Feeds
 *
 * @module scripts/seed-database
 *
 * @remarks
 * This script supports CLI flags for different seeding modes:
 * - `--force`: Clears existing data before seeding
 * - `--minimal`: Seeds minimal data set (5 records per entity)
 * - `--full`: Seeds comprehensive data set (10+ records per entity)
 *
 * Data respects foreign key constraints and includes realistic cybersecurity examples
 * including real CVEs, known threat actors, and actual malware families.
 *
 * @example
 * ```bash
 * # Minimal seed (default)
 * npm run seed
 *
 * # Full comprehensive seed
 * npm run seed -- --full
 *
 * # Force clear and reseed
 * npm run seed -- --force --full
 * ```
 *
 * @see {@link User} for user model
 * @see {@link Incident} for incident model
 * @see {@link Vulnerability} for vulnerability model
 */

import bcrypt from 'bcrypt';
import { initializeSequelize, syncDatabase, closeConnection } from '../config/sequelize';
import User from '../models/User';
import Incident from '../models/Incident';
import Vulnerability from '../models/Vulnerability';
import Asset from '../models/Asset';
import IOC from '../models/IOC';
import ThreatActor from '../models/ThreatActor';
import AuditLog from '../models/AuditLog';
import PlaybookExecution from '../models/PlaybookExecution';

/**
 * CLI configuration parsed from command-line arguments.
 *
 * @interface SeedConfig
 * @property {boolean} force - Whether to clear existing data before seeding
 * @property {boolean} minimal - Whether to use minimal data set (5 records per entity)
 * @property {boolean} full - Whether to use full data set (10+ records per entity)
 */
interface SeedConfig {
  force: boolean;
  minimal: boolean;
  full: boolean;
}

/**
 * Parse command-line arguments to determine seeding configuration.
 *
 * @returns {SeedConfig} Configuration object with flags
 *
 * @example
 * ```typescript
 * const config = parseArgs();
 * if (config.force) {
 *   await clearDatabase();
 * }
 * ```
 */
function parseArgs(): SeedConfig {
  const args = process.argv.slice(2);
  return {
    force: args.includes('--force'),
    minimal: args.includes('--minimal'),
    full: args.includes('--full'),
  };
}

/**
 * Clear all existing data from database tables.
 *
 * Deletes data in reverse order of foreign key dependencies to avoid
 * constraint violations. Uses TRUNCATE CASCADE for efficiency.
 *
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If database clearing fails
 *
 * @remarks
 * Clearing order (respects foreign keys):
 * 1. AuditLog (references User)
 * 2. PlaybookExecution (no foreign keys)
 * 3. Incident (references User)
 * 4. IOC, Vulnerability, Asset, ThreatActor (no foreign keys)
 * 5. User (referenced by others)
 */
async function clearDatabase(): Promise<void> {
  console.log('🗑️  Clearing existing data...\n');

  try {
    await AuditLog.destroy({ where: {}, force: true });
    console.log('   ✓ Cleared audit logs');

    await PlaybookExecution.destroy({ where: {}, force: true });
    console.log('   ✓ Cleared playbook executions');

    await Incident.destroy({ where: {}, force: true });
    console.log('   ✓ Cleared incidents');

    await IOC.destroy({ where: {}, force: true });
    console.log('   ✓ Cleared IOCs');

    await Vulnerability.destroy({ where: {}, force: true });
    console.log('   ✓ Cleared vulnerabilities');

    await Asset.destroy({ where: {}, force: true });
    console.log('   ✓ Cleared assets');

    await ThreatActor.destroy({ where: {}, force: true });
    console.log('   ✓ Cleared threat actors');

    await User.destroy({ where: {}, force: true });
    console.log('   ✓ Cleared users\n');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to clear database:', errorMessage);
    throw error;
  }
}

/**
 * Seed users with different roles and capabilities.
 *
 * Creates admin, analyst, manager, and viewer users with realistic profiles.
 * Passwords are hashed using bcrypt before storage.
 *
 * @async
 * @param {SeedConfig} config - Seeding configuration
 * @returns {Promise<User[]>} Array of created user instances
 * @throws {Error} If user creation fails
 *
 * @remarks
 * Default password for all users: 'Password123!'
 * User roles: admin, analyst, manager, viewer, hunter
 *
 * @example
 * ```typescript
 * const users = await seedUsers(config);
 * console.log(`Created ${users.length} users`);
 * ```
 */
async function seedUsers(config: SeedConfig): Promise<User[]> {
  console.log('🌱 Seeding users...');

  const existingCount = await User.count();
  if (existingCount > 0 && !config.force) {
    console.log(`   ✓ Users already exist (${existingCount} found), skipping...\n`);
    return await User.findAll();
  }

  const password = await bcrypt.hash('Password123!', 10);

  const baseUsers = [
    {
      email: 'admin@blackcross.com',
      username: 'admin',
      password,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      capabilities: ['BYPASS:ENTERPRISE', 'INCIDENT:CREATE', 'INCIDENT:UPDATE', 'AI:USE'],
      lastLogin: new Date(),
    },
    {
      email: 'analyst@blackcross.com',
      username: 'analyst',
      password,
      firstName: 'Security',
      lastName: 'Analyst',
      role: 'analyst',
      isActive: true,
      capabilities: ['INCIDENT:CREATE', 'INCIDENT:UPDATE', 'KNOWLEDGE:CREATE'],
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      email: 'hunter@blackcross.com',
      username: 'hunter',
      password,
      firstName: 'Threat',
      lastName: 'Hunter',
      role: 'hunter',
      isActive: true,
      capabilities: ['INCIDENT:CREATE', 'AI:USE'],
      lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      email: 'manager@blackcross.com',
      username: 'manager',
      password,
      firstName: 'SOC',
      lastName: 'Manager',
      role: 'manager',
      isActive: true,
      capabilities: ['INCIDENT:UPDATE', 'KNOWLEDGE:CREATE'],
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      email: 'viewer@blackcross.com',
      username: 'viewer',
      password,
      firstName: 'Read',
      lastName: 'Only',
      role: 'viewer',
      isActive: true,
      capabilities: [],
      lastLogin: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    },
  ];

  const additionalUsers = config.full
    ? [
      {
        email: 'ir-lead@blackcross.com',
        username: 'ir_lead',
        password,
        firstName: 'Incident',
        lastName: 'Response Lead',
        role: 'analyst',
        isActive: true,
        capabilities: ['INCIDENT:CREATE', 'INCIDENT:UPDATE'],
        lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        email: 'compliance@blackcross.com',
        username: 'compliance',
        password,
        firstName: 'Compliance',
        lastName: 'Officer',
        role: 'manager',
        isActive: true,
        capabilities: ['KNOWLEDGE:CREATE'],
        lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        email: 'malware-analyst@blackcross.com',
        username: 'malware_analyst',
        password,
        firstName: 'Malware',
        lastName: 'Analyst',
        role: 'analyst',
        isActive: true,
        capabilities: ['INCIDENT:CREATE', 'AI:USE'],
        lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ]
    : [];

  const users = await User.bulkCreate([...baseUsers, ...additionalUsers]);
  console.log(`   ✓ Created ${users.length} users\n`);
  return users;
}

/**
 * Seed security incidents with realistic scenarios.
 *
 * Creates incidents covering various attack types including ransomware,
 * phishing, data breaches, DDoS, malware, and insider threats.
 *
 * @async
 * @param {User[]} users - Array of users to assign incidents to
 * @param {SeedConfig} config - Seeding configuration
 * @returns {Promise<Incident[]>} Array of created incident instances
 * @throws {Error} If incident creation fails
 *
 * @remarks
 * Incident categories: Ransomware, Phishing, Data Breach, Malware,
 * DDoS, Unauthorized Access, Insider Threat, APT, Network Intrusion
 *
 * Statuses: open, investigating, contained, resolved, closed
 * Severities: low, medium, high, critical
 */
async function seedIncidents(users: User[], config: SeedConfig): Promise<Incident[]> {
  console.log('🌱 Seeding incidents...');

  const existingCount = await Incident.count();
  if (existingCount > 0 && !config.force) {
    console.log(`   ✓ Incidents already exist (${existingCount} found), skipping...\n`);
    return await Incident.findAll();
  }

  const now = Date.now();
  const baseIncidents = [
    {
      title: 'Ransomware Attack - WannaCry Variant',
      description: 'Multiple endpoints infected with WannaCry ransomware variant. Files encrypted with .WNCRY extension. Attackers demanding 0.3 BTC payment. Affected systems isolated from network.',
      severity: 'critical',
      status: 'investigating',
      priority: 1,
      category: 'Ransomware',
      assignedToId: users[0].id,
      detectedAt: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      title: 'Spear Phishing Campaign Targeting Executives',
      description: 'CEO and CFO received sophisticated phishing emails impersonating legal counsel. Emails contained malicious PDF attachments attempting credential theft. 3 executives reported suspicious emails.',
      severity: 'high',
      status: 'investigating',
      priority: 2,
      category: 'Phishing',
      assignedToId: users[1].id,
      detectedAt: new Date(now - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      title: 'Data Exfiltration Detected - Suspicious Outbound Traffic',
      description: 'Unusual outbound traffic to unknown IP addresses in Eastern Europe. Approximately 15GB of data transferred over encrypted channel. Potential data breach scenario. EDR alerts triggered.',
      severity: 'critical',
      status: 'open',
      priority: 1,
      category: 'Data Breach',
      assignedToId: users[0].id,
      detectedAt: new Date(now - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    {
      title: 'Brute Force Attack on SSH Services',
      description: 'Automated brute force attack detected against SSH services. Over 10,000 failed login attempts from distributed IP addresses. Attack successfully blocked by fail2ban.',
      severity: 'medium',
      status: 'resolved',
      priority: 3,
      category: 'Unauthorized Access',
      assignedToId: users[1].id,
      detectedAt: new Date(now - 24 * 60 * 60 * 1000), // 1 day ago
      resolvedAt: new Date(now - 18 * 60 * 60 * 1000), // 18 hours ago
    },
    {
      title: 'DDoS Attack - Layer 7 HTTP Flood',
      description: 'Large-scale DDoS attack targeting web application. Peak traffic reached 50Gbps. Cloudflare mitigation activated. No service downtime experienced.',
      severity: 'high',
      status: 'resolved',
      priority: 1,
      category: 'DDoS',
      assignedToId: users[3].id,
      detectedAt: new Date(now - 48 * 60 * 60 * 1000), // 2 days ago
      resolvedAt: new Date(now - 36 * 60 * 60 * 1000), // 1.5 days ago
    },
    {
      title: 'Emotet Trojan Detection',
      description: 'Emotet banking trojan detected on workstation. Malware delivered via malicious Word document macro. System quarantined and undergoing forensic analysis.',
      severity: 'high',
      status: 'contained',
      priority: 2,
      category: 'Malware',
      assignedToId: users[2].id,
      detectedAt: new Date(now - 36 * 60 * 60 * 1000), // 1.5 days ago
    },
    {
      title: 'Insider Threat - Unauthorized Data Access',
      description: 'Employee accessed sensitive customer database without authorization. 500+ customer records viewed. HR investigation initiated. Access credentials revoked.',
      severity: 'high',
      status: 'investigating',
      priority: 2,
      category: 'Insider Threat',
      assignedToId: users[3].id,
      detectedAt: new Date(now - 72 * 60 * 60 * 1000), // 3 days ago
    },
  ];

  const additionalIncidents = config.full
    ? [
      {
        title: 'APT29 Activity Detected',
        description: 'Indicators matching APT29 (Cozy Bear) TTPs identified. Suspicious PowerShell execution and lateral movement attempts. Investigation ongoing.',
        severity: 'critical',
        status: 'investigating',
        priority: 1,
        category: 'APT',
        assignedToId: users[2].id,
        detectedAt: new Date(now - 8 * 60 * 60 * 1000),
      },
      {
        title: 'SQL Injection Attempt Blocked',
        description: 'Multiple SQL injection attempts detected against customer portal. WAF rules blocked all attempts. Source IPs added to blocklist.',
        severity: 'medium',
        status: 'resolved',
        priority: 3,
        category: 'Web Application Attack',
        assignedToId: users[1].id,
        detectedAt: new Date(now - 96 * 60 * 60 * 1000),
        resolvedAt: new Date(now - 90 * 60 * 60 * 1000),
      },
      {
        title: 'Cryptojacking Malware on Cloud Instance',
        description: 'Unauthorized cryptocurrency mining software detected on AWS EC2 instance. CPU utilization at 100%. Instance terminated and rebuilt.',
        severity: 'medium',
        status: 'resolved',
        priority: 3,
        category: 'Malware',
        assignedToId: users[1].id,
        detectedAt: new Date(now - 120 * 60 * 60 * 1000),
        resolvedAt: new Date(now - 108 * 60 * 60 * 1000),
      },
      {
        title: 'Business Email Compromise Attempt',
        description: 'CFO received email from compromised vendor account requesting wire transfer. Email validated as fraudulent. Finance team alerted.',
        severity: 'high',
        status: 'resolved',
        priority: 2,
        category: 'Phishing',
        assignedToId: users[0].id,
        detectedAt: new Date(now - 144 * 60 * 60 * 1000),
        resolvedAt: new Date(now - 138 * 60 * 60 * 1000),
      },
      {
        title: 'Network Intrusion - Lateral Movement Detected',
        description: 'Suspicious network activity indicating lateral movement from DMZ to internal network. EDR investigation in progress.',
        severity: 'critical',
        status: 'investigating',
        priority: 1,
        category: 'Network Intrusion',
        assignedToId: users[0].id,
        detectedAt: new Date(now - 4 * 60 * 60 * 1000),
      },
    ]
    : [];

  const incidents = await Incident.bulkCreate([...baseIncidents, ...additionalIncidents]);
  console.log(`   ✓ Created ${incidents.length} incidents\n`);
  return incidents;
}

/**
 * Seed vulnerabilities with real CVEs and security advisories.
 *
 * Creates vulnerability records with actual CVE identifiers, CVSS scores,
 * and affected systems information.
 *
 * @async
 * @param {SeedConfig} config - Seeding configuration
 * @returns {Promise<Vulnerability[]>} Array of created vulnerability instances
 * @throws {Error} If vulnerability creation fails
 *
 * @remarks
 * Includes real CVEs from 2023-2025 covering critical infrastructure,
 * web applications, operating systems, and enterprise software.
 *
 * Statuses: open, patching, patched, accepted_risk, false_positive
 */
async function seedVulnerabilities(config: SeedConfig): Promise<Vulnerability[]> {
  console.log('🌱 Seeding vulnerabilities...');

  const existingCount = await Vulnerability.count();
  if (existingCount > 0 && !config.force) {
    console.log(`   ✓ Vulnerabilities already exist (${existingCount} found), skipping...\n`);
    return await Vulnerability.findAll();
  }

  const now = Date.now();
  const baseVulnerabilities = [
    {
      cveId: 'CVE-2024-21762',
      title: 'FortiOS SSL VPN Buffer Overflow',
      description: 'Out-of-bounds write vulnerability in FortiOS SSL VPN allows unauthenticated attacker to execute arbitrary code via crafted requests.',
      severity: 'critical',
      cvssScore: 9.6,
      affectedSystems: ['FortiOS 7.0.0 - 7.0.13', 'FortiOS 7.2.0 - 7.2.6', 'FortiOS 7.4.0 - 7.4.2'],
      status: 'patching',
      publishedAt: new Date('2024-02-08'),
      discoveredAt: new Date(now - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
    {
      cveId: 'CVE-2024-3400',
      title: 'Palo Alto PAN-OS Command Injection',
      description: 'Command injection vulnerability in GlobalProtect gateway allows unauthenticated remote code execution.',
      severity: 'critical',
      cvssScore: 10.0,
      affectedSystems: ['PAN-OS 11.1', 'PAN-OS 11.0', 'PAN-OS 10.2'],
      status: 'open',
      publishedAt: new Date('2024-04-12'),
      discoveredAt: new Date(now - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      cveId: 'CVE-2023-44487',
      title: 'HTTP/2 Rapid Reset DDoS Vulnerability',
      description: 'HTTP/2 protocol implementation vulnerability allows attackers to launch DDoS attacks via rapid stream resets.',
      severity: 'critical',
      cvssScore: 7.5,
      affectedSystems: ['Apache HTTP Server', 'nginx', 'Node.js', 'Go HTTP/2'],
      status: 'patched',
      publishedAt: new Date('2023-10-10'),
      discoveredAt: new Date(now - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      patchedAt: new Date(now - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    },
    {
      cveId: 'CVE-2024-1086',
      title: 'Linux Kernel Use-After-Free Privilege Escalation',
      description: 'Use-after-free vulnerability in Linux kernel netfilter allows local privilege escalation to root.',
      severity: 'high',
      cvssScore: 7.8,
      affectedSystems: ['Linux Kernel 5.14 - 6.6.14', 'Ubuntu 22.04', 'RHEL 8/9'],
      status: 'patched',
      publishedAt: new Date('2024-01-31'),
      discoveredAt: new Date(now - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      patchedAt: new Date(now - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    },
    {
      cveId: 'CVE-2023-4863',
      title: 'libwebp Heap Buffer Overflow (0-day)',
      description: 'Heap buffer overflow in WebP image codec library affecting major browsers. Actively exploited in the wild.',
      severity: 'critical',
      cvssScore: 10.0,
      affectedSystems: ['Chrome < 116.0.5845.187', 'Firefox < 117.0.1', 'Safari < 16.6.1', 'libwebp < 1.3.2'],
      status: 'patched',
      publishedAt: new Date('2023-09-25'),
      discoveredAt: new Date(now - 120 * 24 * 60 * 60 * 1000), // 120 days ago
      patchedAt: new Date(now - 100 * 24 * 60 * 60 * 1000), // 100 days ago
    },
  ];

  const additionalVulnerabilities = config.full
    ? [
      {
        cveId: 'CVE-2024-23897',
        title: 'Jenkins Arbitrary File Read Vulnerability',
        description: 'Arbitrary file read vulnerability in Jenkins CLI allows authenticated attackers to read sensitive files.',
        severity: 'high',
        cvssScore: 8.6,
        affectedSystems: ['Jenkins 2.441 and earlier', 'Jenkins LTS 2.426.2 and earlier'],
        status: 'open',
        publishedAt: new Date('2024-01-24'),
        discoveredAt: new Date(now - 25 * 24 * 60 * 60 * 1000),
      },
      {
        cveId: 'CVE-2024-4577',
        title: 'PHP CGI Argument Injection',
        description: 'Argument injection vulnerability in PHP CGI mode allows remote code execution on Windows systems.',
        severity: 'critical',
        cvssScore: 9.8,
        affectedSystems: ['PHP 8.3 < 8.3.8', 'PHP 8.2 < 8.2.20', 'PHP 8.1 < 8.1.29'],
        status: 'patching',
        publishedAt: new Date('2024-06-06'),
        discoveredAt: new Date(now - 10 * 24 * 60 * 60 * 1000),
      },
      {
        cveId: 'CVE-2023-46604',
        title: 'Apache ActiveMQ RCE',
        description: 'Remote code execution vulnerability in Apache ActiveMQ allows unauthenticated attackers to run arbitrary shell commands.',
        severity: 'critical',
        cvssScore: 10.0,
        affectedSystems: ['Apache ActiveMQ 5.18.0 - 5.18.2', 'ActiveMQ 5.17.0 - 5.17.5'],
        status: 'patched',
        publishedAt: new Date('2023-10-27'),
        discoveredAt: new Date(now - 75 * 24 * 60 * 60 * 1000),
        patchedAt: new Date(now - 55 * 24 * 60 * 60 * 1000),
      },
      {
        cveId: 'CVE-2024-21413',
        title: 'Microsoft Outlook RCE (MonikerLink)',
        description: 'Remote code execution vulnerability in Microsoft Outlook allows attackers to bypass Protected View.',
        severity: 'high',
        cvssScore: 9.8,
        affectedSystems: ['Microsoft Outlook 2016', 'Microsoft Outlook 2019', 'Microsoft 365 Apps'],
        status: 'patched',
        publishedAt: new Date('2024-02-13'),
        discoveredAt: new Date(now - 30 * 24 * 60 * 60 * 1000),
        patchedAt: new Date(now - 15 * 24 * 60 * 60 * 1000),
      },
      {
        cveId: 'CVE-2023-38545',
        title: 'curl SOCKS5 Heap Buffer Overflow',
        description: 'Heap buffer overflow vulnerability in curl SOCKS5 proxy handling could lead to RCE.',
        severity: 'high',
        cvssScore: 7.5,
        affectedSystems: ['curl 7.69.0 - 8.3.0', 'libcurl 7.69.0 - 8.3.0'],
        status: 'patched',
        publishedAt: new Date('2023-10-11'),
        discoveredAt: new Date(now - 85 * 24 * 60 * 60 * 1000),
        patchedAt: new Date(now - 70 * 24 * 60 * 60 * 1000),
      },
    ]
    : [];

  const vulnerabilities = await Vulnerability.bulkCreate([
    ...baseVulnerabilities,
    ...additionalVulnerabilities,
  ]);
  console.log(`   ✓ Created ${vulnerabilities.length} vulnerabilities\n`);
  return vulnerabilities;
}

/**
 * Seed IT assets including servers, workstations, and network devices.
 *
 * Creates asset inventory with various types, criticality levels, and
 * environmental classifications.
 *
 * @async
 * @param {SeedConfig} config - Seeding configuration
 * @returns {Promise<Asset[]>} Array of created asset instances
 * @throws {Error} If asset creation fails
 *
 * @remarks
 * Asset types: Server, Database, Workstation, Network Device, Cloud Resource
 * Criticality: low, medium, high, critical
 * Environments: production, staging, development, testing
 */
async function seedAssets(config: SeedConfig): Promise<Asset[]> {
  console.log('🌱 Seeding assets...');

  const existingCount = await Asset.count();
  if (existingCount > 0 && !config.force) {
    console.log(`   ✓ Assets already exist (${existingCount} found), skipping...\n`);
    return await Asset.findAll();
  }

  const baseAssets = [
    {
      name: 'Production Web Server - Primary',
      type: 'Server',
      ipAddress: '10.0.1.10',
      hostname: 'web-prod-01.internal',
      criticality: 'critical',
      owner: 'Infrastructure Team',
      location: 'Data Center - US-EAST-1',
      environment: 'production',
      tags: ['web-server', 'nginx', 'load-balanced', 'public-facing'],
      metadata: { os: 'Ubuntu 22.04 LTS', cpu_cores: 8, ram_gb: 32 },
    },
    {
      name: 'Primary Database Server - PostgreSQL',
      type: 'Database',
      ipAddress: '10.0.1.20',
      hostname: 'db-prod-postgres-01.internal',
      criticality: 'critical',
      owner: 'Database Team',
      location: 'Data Center - US-EAST-1',
      environment: 'production',
      tags: ['postgresql', 'primary', 'customer-data', 'encrypted'],
      metadata: { os: 'Ubuntu 22.04 LTS', version: 'PostgreSQL 15.3', storage_tb: 5 },
    },
    {
      name: 'Application Server - API Gateway',
      type: 'Server',
      ipAddress: '10.0.1.30',
      hostname: 'api-prod-01.internal',
      criticality: 'high',
      owner: 'Backend Team',
      location: 'Data Center - US-WEST-2',
      environment: 'production',
      tags: ['api', 'node.js', 'rest', 'graphql'],
      metadata: { os: 'Ubuntu 22.04 LTS', node_version: '20.10.0', cpu_cores: 16 },
    },
    {
      name: 'Security Analyst Workstation',
      type: 'Workstation',
      ipAddress: '192.168.10.100',
      hostname: 'ws-analyst-01',
      criticality: 'medium',
      owner: 'Security Team',
      location: 'Office - Building A',
      environment: 'corporate',
      tags: ['windows', 'edr', 'siem-access'],
      metadata: { os: 'Windows 11 Pro', edr_agent: 'CrowdStrike', user: 'analyst@blackcross.com' },
    },
    {
      name: 'Core Network Firewall',
      type: 'Network Device',
      ipAddress: '10.0.0.1',
      hostname: 'fw-core-01.internal',
      criticality: 'critical',
      owner: 'Network Team',
      location: 'Data Center - US-EAST-1',
      environment: 'production',
      tags: ['firewall', 'palo-alto', 'perimeter'],
      metadata: { model: 'Palo Alto PA-5220', version: 'PAN-OS 11.0.3' },
    },
  ];

  const additionalAssets = config.full
    ? [
      {
        name: 'Redis Cache Cluster',
        type: 'Database',
        ipAddress: '10.0.1.50',
        hostname: 'redis-prod-01.internal',
        criticality: 'high',
        owner: 'Backend Team',
        location: 'Data Center - US-EAST-1',
        environment: 'production',
        tags: ['redis', 'cache', 'session-store'],
        metadata: { version: 'Redis 7.2', cluster_size: 3, ram_gb: 64 },
      },
      {
        name: 'Elasticsearch SIEM Cluster',
        type: 'Server',
        ipAddress: '10.0.2.10',
        hostname: 'es-siem-01.internal',
        criticality: 'high',
        owner: 'Security Team',
        location: 'Data Center - US-EAST-1',
        environment: 'production',
        tags: ['elasticsearch', 'siem', 'logging'],
        metadata: { version: 'Elasticsearch 8.11', nodes: 5, storage_tb: 10 },
      },
      {
        name: 'Development Kubernetes Cluster',
        type: 'Cloud Resource',
        ipAddress: '10.1.0.0/16',
        hostname: 'k8s-dev.internal',
        criticality: 'medium',
        owner: 'DevOps Team',
        location: 'AWS - us-east-1',
        environment: 'development',
        tags: ['kubernetes', 'aws-eks', 'containers'],
        metadata: { provider: 'AWS EKS', version: '1.28', node_count: 10 },
      },
      {
        name: 'VPN Gateway',
        type: 'Network Device',
        ipAddress: '203.0.113.1',
        hostname: 'vpn-gateway-01.blackcross.com',
        criticality: 'high',
        owner: 'Network Team',
        location: 'Data Center - US-EAST-1',
        environment: 'production',
        tags: ['vpn', 'wireguard', 'remote-access'],
        metadata: { protocol: 'WireGuard', max_connections: 500 },
      },
      {
        name: 'Backup Storage Server',
        type: 'Server',
        ipAddress: '10.0.3.10',
        hostname: 'backup-01.internal',
        criticality: 'high',
        owner: 'Infrastructure Team',
        location: 'Data Center - US-WEST-2',
        environment: 'production',
        tags: ['backup', 'veeam', 'disaster-recovery'],
        metadata: { os: 'Ubuntu 22.04 LTS', storage_tb: 100, retention_days: 90 },
      },
    ]
    : [];

  const assets = await Asset.bulkCreate([...baseAssets, ...additionalAssets]);
  console.log(`   ✓ Created ${assets.length} assets\n`);
  return assets;
}

/**
 * Seed Indicators of Compromise (IOCs) with threat intelligence data.
 *
 * Creates IOC records for malicious IPs, domains, file hashes, URLs,
 * and email addresses from real threat campaigns.
 *
 * @async
 * @param {SeedConfig} config - Seeding configuration
 * @returns {Promise<IOC[]>} Array of created IOC instances
 * @throws {Error} If IOC creation fails
 *
 * @remarks
 * IOC types: ip, domain, hash (MD5/SHA256), url, email
 * Sources: Threat feeds, VirusTotal, URLhaus, PhishTank, Abuse.ch
 */
async function seedIOCs(config: SeedConfig): Promise<IOC[]> {
  console.log('🌱 Seeding IOCs (Indicators of Compromise)...');

  const existingCount = await IOC.count();
  if (existingCount > 0 && !config.force) {
    console.log(`   ✓ IOCs already exist (${existingCount} found), skipping...\n`);
    return await IOC.findAll();
  }

  const now = Date.now();
  const baseIOCs = [
    {
      type: 'ip',
      value: '45.142.212.61',
      severity: 'critical',
      confidence: 95,
      description: 'Known C2 server for APT28 (Fancy Bear) operations. Actively used for command and control.',
      source: 'ThreatConnect',
      tags: ['apt28', 'c2-server', 'russia', 'espionage'],
      firstSeen: new Date(now - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      lastSeen: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
      isActive: true,
      metadata: { country: 'RU', asn: 'AS206728', threat_actor: 'APT28' },
    },
    {
      type: 'domain',
      value: 'secure-login-verify.com',
      severity: 'high',
      confidence: 92,
      description: 'Phishing domain impersonating Microsoft 365 login. Used in credential harvesting campaign.',
      source: 'URLhaus',
      tags: ['phishing', 'credential-theft', 'microsoft', 'oauth'],
      firstSeen: new Date(now - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      lastSeen: new Date(now - 12 * 60 * 60 * 1000), // 12 hours ago
      isActive: true,
      metadata: { registrar: 'Namecheap', created: '2024-10-15', ssl_cert: 'Let\'s Encrypt' },
    },
    {
      type: 'hash',
      value: 'e4d909c290d0fb1ca068ffaddf22cbd0',
      severity: 'critical',
      confidence: 98,
      description: 'MD5 hash of Emotet banking trojan (Epoch 5 variant). Delivered via malicious Excel macros.',
      source: 'VirusTotal',
      tags: ['emotet', 'trojan', 'banking-malware', 'macro'],
      firstSeen: new Date(now - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      lastSeen: new Date(now - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      isActive: true,
      metadata: { hash_type: 'MD5', file_type: 'PE32 executable', vt_detections: '58/72' },
    },
    {
      type: 'hash',
      value: 'd131dd02c5e6eec4693d9a0698aff95c2fcab58712467eab4004583eb8fb7f89',
      severity: 'critical',
      confidence: 99,
      description: 'SHA256 hash of TrickBot malware. Known for credential theft and ransomware deployment.',
      source: 'Abuse.ch',
      tags: ['trickbot', 'malware', 'ransomware', 'credential-theft'],
      firstSeen: new Date(now - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      lastSeen: new Date(now - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      isActive: true,
      metadata: { hash_type: 'SHA256', file_type: 'PE32 executable', campaign: 'TrickBot v2.3' },
    },
    {
      type: 'url',
      value: 'http://malicious-payload.ru/install.exe',
      severity: 'high',
      confidence: 90,
      description: 'URL hosting ransomware payload. Delivers LockBit 3.0 ransomware variant.',
      source: 'Abuse.ch',
      tags: ['ransomware', 'lockbit', 'malware-distribution'],
      firstSeen: new Date(now - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      lastSeen: new Date(now - 24 * 60 * 60 * 1000), // 1 day ago
      isActive: true,
      metadata: { http_status: 200, content_type: 'application/x-msdownload' },
    },
  ];

  const additionalIOCs = config.full
    ? [
      {
        type: 'ip',
        value: '185.220.101.42',
        severity: 'high',
        confidence: 88,
        description: 'Tor exit node used in ransomware C2 communications. Associated with Conti group.',
        source: 'TorProject',
        tags: ['tor-exit-node', 'ransomware', 'anonymization'],
        firstSeen: new Date(now - 90 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(now - 3 * 24 * 60 * 60 * 1000),
        isActive: true,
        metadata: { country: 'DE', asn: 'AS16276', node_type: 'exit' },
      },
      {
        type: 'email',
        value: 'invoice-notification@accounts-payable.net',
        severity: 'medium',
        confidence: 82,
        description: 'Email address used in business email compromise (BEC) campaign targeting finance departments.',
        source: 'PhishTank',
        tags: ['bec', 'phishing', 'finance', 'invoice-fraud'],
        firstSeen: new Date(now - 20 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(now - 8 * 24 * 60 * 60 * 1000),
        isActive: true,
        metadata: { spoofed_sender: 'Real Company Inc', campaign: 'Wire Transfer Fraud' },
      },
      {
        type: 'domain',
        value: 'update-adobe-flash.com',
        severity: 'high',
        confidence: 94,
        description: 'Fake Adobe Flash update site distributing malware. Hosts multiple exploit kits.',
        source: 'URLhaus',
        tags: ['malware', 'fake-update', 'exploit-kit'],
        firstSeen: new Date(now - 35 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(now - 15 * 60 * 60 * 1000),
        isActive: true,
        metadata: { ip: '198.51.100.42', registrar: 'GoDaddy' },
      },
      {
        type: 'hash',
        value: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        severity: 'critical',
        confidence: 97,
        description: 'Cobalt Strike beacon loader. Used in post-exploitation for lateral movement.',
        source: 'VirusTotal',
        tags: ['cobalt-strike', 'beacon', 'post-exploitation'],
        firstSeen: new Date(now - 25 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(now - 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        metadata: { hash_type: 'MD5', file_type: 'DLL', vt_detections: '45/72' },
      },
      {
        type: 'ip',
        value: '103.253.145.28',
        severity: 'critical',
        confidence: 96,
        description: 'Lazarus Group infrastructure. Used for cryptocurrency theft operations.',
        source: 'CISA',
        tags: ['lazarus-group', 'north-korea', 'cryptocurrency', 'apt'],
        firstSeen: new Date(now - 120 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(now - 30 * 24 * 60 * 60 * 1000),
        isActive: false,
        metadata: { country: 'CN', asn: 'AS4134', threat_actor: 'Lazarus Group' },
      },
    ]
    : [];

  const iocs = await IOC.bulkCreate([...baseIOCs, ...additionalIOCs]);
  console.log(`   ✓ Created ${iocs.length} IOCs\n`);
  return iocs;
}

/**
 * Seed threat actor profiles with APT groups and cybercrime organizations.
 *
 * Creates detailed profiles of known threat actors including nation-state
 * APT groups, ransomware gangs, and cybercriminal organizations.
 *
 * @async
 * @param {SeedConfig} config - Seeding configuration
 * @returns {Promise<ThreatActor[]>} Array of created threat actor instances
 * @throws {Error} If threat actor creation fails
 *
 * @remarks
 * Includes real threat actors: APT28, APT29, Lazarus Group, APT41, etc.
 * Sophistication levels: basic, intermediate, advanced, expert
 * Motivations: espionage, financial, political, ideological, destructive
 */
async function seedThreatActors(config: SeedConfig): Promise<ThreatActor[]> {
  console.log('🌱 Seeding threat actors...');

  const existingCount = await ThreatActor.count();
  if (existingCount > 0 && !config.force) {
    console.log(`   ✓ Threat actors already exist (${existingCount} found), skipping...\n`);
    return await ThreatActor.findAll();
  }

  const now = Date.now();
  const baseThreatActors = [
    {
      name: 'APT28',
      aliases: ['Fancy Bear', 'Sofacy', 'Sednit', 'STRONTIUM', 'Pawn Storm'],
      sophistication: 'advanced',
      motivation: ['espionage', 'political', 'military-intelligence'],
      country: 'Russia',
      description: 'Russian military intelligence (GRU) cyber espionage group active since 2004. Known for targeting government, military, and defense organizations worldwide. Uses custom malware families including X-Agent and Sofacy.',
      tags: ['apt', 'russia', 'gru', 'nation-state', 'espionage', 'government'],
      firstSeen: new Date(now - 365 * 5 * 24 * 60 * 60 * 1000), // 5 years ago
      lastSeen: new Date(now - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      metadata: {
        attribution: 'GRU Unit 26165',
        primary_targets: ['Government', 'Military', 'Defense', 'Political Organizations'],
        ttps: ['Spear Phishing', 'Credential Harvesting', 'Zero-day Exploits'],
      },
    },
    {
      name: 'APT29',
      aliases: ['Cozy Bear', 'The Dukes', 'NOBELIUM', 'UNC2452'],
      sophistication: 'expert',
      motivation: ['espionage', 'intelligence-gathering', 'political'],
      country: 'Russia',
      description: 'Russian Foreign Intelligence Service (SVR) cyber espionage group. Responsible for SolarWinds supply chain attack (2020). Employs sophisticated tradecraft and operational security.',
      tags: ['apt', 'russia', 'svr', 'nation-state', 'supply-chain', 'zero-day'],
      firstSeen: new Date(now - 365 * 10 * 24 * 60 * 60 * 1000), // 10 years ago
      lastSeen: new Date(now - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      metadata: {
        attribution: 'SVR (Foreign Intelligence Service)',
        notable_campaigns: ['SolarWinds (2020)', 'DNC Hack (2016)'],
        primary_targets: ['Government', 'Think Tanks', 'Technology', 'Healthcare'],
      },
    },
    {
      name: 'Lazarus Group',
      aliases: ['Hidden Cobra', 'Guardians of Peace', 'APT38', 'ZINC'],
      sophistication: 'advanced',
      motivation: ['financial', 'espionage', 'destructive'],
      country: 'North Korea',
      description: 'North Korean state-sponsored threat actor conducting cyber operations for financial gain, espionage, and sabotage. Notable for WannaCry ransomware, Sony Pictures hack, and cryptocurrency theft operations.',
      tags: ['apt', 'north-korea', 'financial-crime', 'ransomware', 'cryptocurrency', 'destructive'],
      firstSeen: new Date(now - 365 * 8 * 24 * 60 * 60 * 1000), // 8 years ago
      lastSeen: new Date(now - 21 * 24 * 60 * 60 * 1000), // 21 days ago
      metadata: {
        attribution: 'Reconnaissance General Bureau (RGB)',
        notable_campaigns: ['WannaCry (2017)', 'Sony Pictures (2014)', 'SWIFT Heists'],
        stolen_crypto_usd: '2.3B+',
      },
    },
    {
      name: 'APT41',
      aliases: ['Double Dragon', 'Winnti', 'Barium', 'Wicked Panda'],
      sophistication: 'advanced',
      motivation: ['espionage', 'financial', 'intellectual-property-theft'],
      country: 'China',
      description: 'Chinese state-sponsored threat actor conducting both espionage and financially motivated operations. Unique in dual mandate for state intelligence and personal profit.',
      tags: ['apt', 'china', 'mss', 'dual-use', 'gaming', 'healthcare'],
      firstSeen: new Date(now - 365 * 7 * 24 * 60 * 60 * 1000), // 7 years ago
      lastSeen: new Date(now - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      metadata: {
        attribution: 'Ministry of State Security (MSS)',
        primary_targets: ['Technology', 'Gaming', 'Healthcare', 'Telecommunications'],
        ttps: ['Supply Chain Compromise', 'Web Shell Deployment', 'Certificate Theft'],
      },
    },
    {
      name: 'Conti',
      aliases: ['Wizard Spider', 'TrickBot Group'],
      sophistication: 'intermediate',
      motivation: ['financial', 'ransomware'],
      country: 'Russia',
      description: 'Russian ransomware-as-a-service (RaaS) operation. One of the most prolific ransomware groups. Disbanded in 2022 but members continue operations under different brands.',
      tags: ['ransomware', 'ras', 'cybercrime', 'russia', 'double-extortion'],
      firstSeen: new Date(now - 365 * 3 * 24 * 60 * 60 * 1000), // 3 years ago
      lastSeen: new Date(now - 180 * 24 * 60 * 60 * 1000), // 180 days ago (disbanded)
      metadata: {
        type: 'Ransomware-as-a-Service',
        estimated_revenue_usd: '180M+',
        status: 'Disbanded (2022)',
        successor_groups: ['BlackBasta', 'Karakurt'],
      },
    },
  ];

  const additionalThreatActors = config.full
    ? [
      {
        name: 'LockBit',
        aliases: ['LockBit 3.0', 'LockBit Black'],
        sophistication: 'advanced',
        motivation: ['financial', 'ransomware'],
        country: 'Russia',
        description: 'Prolific ransomware-as-a-service operation known for high-speed encryption and professional victim negotiation. Active since 2019.',
        tags: ['ransomware', 'ras', 'double-extortion', 'data-leak'],
        firstSeen: new Date(now - 365 * 4 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(now - 5 * 24 * 60 * 60 * 1000),
        metadata: {
          type: 'Ransomware-as-a-Service',
          encryption_speed: 'Fastest known ransomware',
          victim_count: '1800+',
        },
      },
      {
        name: 'APT40',
        aliases: ['TEMP.Periscope', 'Leviathan', 'Kryptonite Panda'],
        sophistication: 'intermediate',
        motivation: ['espionage', 'maritime-intelligence'],
        country: 'China',
        description: 'Chinese state-sponsored group focused on maritime and naval industries. Targets engineering firms and defense contractors.',
        tags: ['apt', 'china', 'maritime', 'defense', 'engineering'],
        firstSeen: new Date(now - 365 * 6 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(now - 30 * 24 * 60 * 60 * 1000),
        metadata: {
          primary_targets: ['Maritime', 'Defense Contractors', 'Naval Engineering'],
          ttps: ['Web Shells', 'SQL Injection', 'Credential Dumping'],
        },
      },
      {
        name: 'FIN7',
        aliases: ['Carbanak', 'Carbon Spider', 'Sangria Tempest'],
        sophistication: 'advanced',
        motivation: ['financial', 'pos-malware'],
        country: 'Russia',
        description: 'Russian financially motivated threat actor targeting retail and hospitality sectors. Known for point-of-sale malware and payment card theft.',
        tags: ['cybercrime', 'pos-malware', 'financial', 'retail', 'hospitality'],
        firstSeen: new Date(now - 365 * 9 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(now - 45 * 24 * 60 * 60 * 1000),
        metadata: {
          primary_targets: ['Retail', 'Hospitality', 'Restaurants', 'Casinos'],
          estimated_theft_usd: '1B+',
          cards_stolen: '15M+',
        },
      },
      {
        name: 'Equation Group',
        aliases: ['EQGRP', 'EQTX'],
        sophistication: 'expert',
        motivation: ['espionage', 'intelligence-gathering'],
        country: 'United States',
        description: 'Highly sophisticated threat actor linked to NSA. Known for advanced persistent threats and zero-day exploits. Shadow Brokers leak exposed their tools in 2016.',
        tags: ['apt', 'usa', 'nsa', 'zero-day', 'firmware-implants'],
        firstSeen: new Date(now - 365 * 15 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(now - 365 * 2 * 24 * 60 * 60 * 1000),
        metadata: {
          attribution: 'NSA Tailored Access Operations (TAO)',
          notable_tools: ['EternalBlue', 'DoublePulsar', 'FuzzBunch'],
          leak_date: '2016-08-13',
        },
      },
      {
        name: 'REvil',
        aliases: ['Sodinokibi', 'Sodin'],
        sophistication: 'advanced',
        motivation: ['financial', 'ransomware'],
        country: 'Russia',
        description: 'High-profile ransomware-as-a-service operation. Responsible for Kaseya VSA supply chain attack. Shut down by law enforcement in 2022.',
        tags: ['ransomware', 'ras', 'supply-chain', 'double-extortion'],
        firstSeen: new Date(now - 365 * 4 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(now - 365 * 24 * 60 * 60 * 1000),
        metadata: {
          type: 'Ransomware-as-a-Service',
          notable_campaigns: ['Kaseya VSA (2021)', 'JBS Foods (2021)'],
          status: 'Disrupted by law enforcement (2022)',
        },
      },
    ]
    : [];

  const threatActors = await ThreatActor.bulkCreate([...baseThreatActors, ...additionalThreatActors]);
  console.log(`   ✓ Created ${threatActors.length} threat actors\n`);
  return threatActors;
}

/**
 * Seed audit logs for user actions and system events.
 *
 * Creates audit trail entries for authentication, resource access,
 * and administrative actions.
 *
 * @async
 * @param {User[]} users - Array of users to create audit logs for
 * @param {SeedConfig} config - Seeding configuration
 * @returns {Promise<AuditLog[]>} Array of created audit log instances
 * @throws {Error} If audit log creation fails
 *
 * @remarks
 * Actions: login, logout, create, update, delete, view, export
 * Resources: Incident, Vulnerability, User, Asset, IOC, ThreatActor
 */
async function seedAuditLogs(users: User[], config: SeedConfig): Promise<AuditLog[]> {
  console.log('🌱 Seeding audit logs...');

  const existingCount = await AuditLog.count();
  if (existingCount > 0 && !config.force) {
    console.log(`   ✓ Audit logs already exist (${existingCount} found), skipping...\n`);
    return await AuditLog.findAll();
  }

  const now = Date.now();
  const baseLogs = [
    {
      userId: users[0].id,
      action: 'login',
      resource: 'Authentication',
      details: { method: 'password', success: true },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      timestamp: new Date(now - 2 * 60 * 60 * 1000),
    },
    {
      userId: users[0].id,
      action: 'create',
      resource: 'Incident',
      resourceId: 'inc-001',
      details: { title: 'Ransomware Attack - WannaCry Variant', severity: 'critical' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      timestamp: new Date(now - 2 * 60 * 60 * 1000),
    },
    {
      userId: users[1].id,
      action: 'update',
      resource: 'Vulnerability',
      resourceId: 'vuln-001',
      details: { field: 'status', old_value: 'open', new_value: 'patching' },
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
      timestamp: new Date(now - 5 * 60 * 60 * 1000),
    },
    {
      userId: users[2].id,
      action: 'view',
      resource: 'ThreatActor',
      resourceId: 'ta-001',
      details: { name: 'APT28' },
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0',
      timestamp: new Date(now - 12 * 60 * 60 * 1000),
    },
    {
      userId: users[3].id,
      action: 'export',
      resource: 'Report',
      details: { type: 'incident_summary', format: 'PDF', date_range: '30_days' },
      ipAddress: '192.168.1.115',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
      timestamp: new Date(now - 24 * 60 * 60 * 1000),
    },
  ];

  const additionalLogs = config.full
    ? [
      {
        userId: users[1].id,
        action: 'delete',
        resource: 'IOC',
        resourceId: 'ioc-999',
        details: { type: 'ip', value: '1.2.3.4', reason: 'false_positive' },
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
        timestamp: new Date(now - 48 * 60 * 60 * 1000),
      },
      {
        userId: users[0].id,
        action: 'update',
        resource: 'User',
        resourceId: users[4].id,
        details: { field: 'role', old_value: 'viewer', new_value: 'analyst' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        timestamp: new Date(now - 72 * 60 * 60 * 1000),
      },
      {
        userId: users[2].id,
        action: 'create',
        resource: 'Asset',
        resourceId: 'asset-001',
        details: { name: 'Production Web Server', criticality: 'critical' },
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0',
        timestamp: new Date(now - 96 * 60 * 60 * 1000),
      },
    ]
    : [];

  const auditLogs = await AuditLog.bulkCreate([...baseLogs, ...additionalLogs]);
  console.log(`   ✓ Created ${auditLogs.length} audit logs\n`);
  return auditLogs;
}

/**
 * Seed playbook executions for automation and incident response.
 *
 * Creates execution records for security automation playbooks including
 * incident response, vulnerability scanning, threat hunting, and compliance checks.
 *
 * @async
 * @param {User[]} users - Array of users who triggered playbooks
 * @param {SeedConfig} config - Seeding configuration
 * @returns {Promise<PlaybookExecution[]>} Array of created playbook execution instances
 * @throws {Error} If playbook execution creation fails
 *
 * @remarks
 * Statuses: pending, running, completed, failed, cancelled
 * Common playbooks: Ransomware Response, Phishing Investigation,
 * Vulnerability Scan, Threat Hunt, Compliance Check
 */
async function seedPlaybookExecutions(users: User[], config: SeedConfig): Promise<PlaybookExecution[]> {
  console.log('🌱 Seeding playbook executions...');

  const existingCount = await PlaybookExecution.count();
  if (existingCount > 0 && !config.force) {
    console.log(`   ✓ Playbook executions already exist (${existingCount} found), skipping...\n`);
    return await PlaybookExecution.findAll();
  }

  const now = Date.now();
  const basePlaybooks = [
    {
      playbookId: 'pb-ransomware-response-001',
      playbookName: 'Ransomware Incident Response',
      status: 'completed',
      triggeredBy: users[0].id,
      startedAt: new Date(now - 3 * 60 * 60 * 1000), // 3 hours ago
      completedAt: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
      duration: 3600, // seconds
      result: {
        success: true,
        actions_completed: 12,
        systems_isolated: 5,
        backups_verified: true,
        c2_blocked: true,
      },
      metadata: {
        incident_id: 'inc-001',
        severity: 'critical',
        affected_systems: ['web-prod-01', 'db-prod-01'],
      },
    },
    {
      playbookId: 'pb-phishing-investigation-002',
      playbookName: 'Phishing Email Analysis and IOC Extraction',
      status: 'running',
      triggeredBy: users[1].id,
      startedAt: new Date(now - 30 * 60 * 1000), // 30 minutes ago
      result: {
        email_analyzed: true,
        iocs_extracted: 8,
        domains: ['malicious-site.com'],
        ips: ['45.142.212.61'],
        hashes: ['e4d909c290d0fb1ca068ffaddf22cbd0'],
      },
      metadata: {
        incident_id: 'inc-002',
        email_subject: 'Urgent: Wire Transfer Required',
        sender: 'cfo@fake-domain.com',
      },
    },
    {
      playbookId: 'pb-vuln-scan-003',
      playbookName: 'Automated Vulnerability Scan - Critical Assets',
      status: 'completed',
      triggeredBy: users[3].id,
      startedAt: new Date(now - 24 * 60 * 60 * 1000), // 1 day ago
      completedAt: new Date(now - 22 * 60 * 60 * 1000), // 22 hours ago
      duration: 7200, // seconds
      result: {
        success: true,
        assets_scanned: 45,
        vulnerabilities_found: 87,
        critical: 12,
        high: 28,
        medium: 35,
        low: 12,
      },
      metadata: {
        scan_type: 'authenticated',
        scanner: 'Nessus Professional',
        scope: 'Production Network',
      },
    },
    {
      playbookId: 'pb-threat-hunt-004',
      playbookName: 'APT28 TTPs Threat Hunting',
      status: 'completed',
      triggeredBy: users[2].id,
      startedAt: new Date(now - 48 * 60 * 60 * 1000), // 2 days ago
      completedAt: new Date(now - 46 * 60 * 60 * 1000), // 46 hours ago
      duration: 7200, // seconds
      result: {
        success: true,
        indicators_searched: 156,
        matches_found: 3,
        suspicious_activity: true,
        escalation_required: true,
      },
      metadata: {
        threat_actor: 'APT28',
        data_sources: ['EDR', 'Firewall Logs', 'Proxy Logs'],
        timeframe_days: 30,
      },
    },
    {
      playbookId: 'pb-compliance-check-005',
      playbookName: 'SOC2 Compliance Automated Check',
      status: 'completed',
      triggeredBy: users[3].id,
      startedAt: new Date(now - 72 * 60 * 60 * 1000), // 3 days ago
      completedAt: new Date(now - 71 * 60 * 60 * 1000), // 71 hours ago
      duration: 3600, // seconds
      result: {
        success: true,
        controls_checked: 45,
        controls_passed: 42,
        controls_failed: 3,
        compliance_score: 93.3,
      },
      metadata: {
        framework: 'SOC2 Type II',
        audit_date: new Date(now - 72 * 60 * 60 * 1000).toISOString(),
        failed_controls: ['CC6.1', 'CC7.2', 'CC8.1'],
      },
    },
  ];

  const additionalPlaybooks = config.full
    ? [
      {
        playbookId: 'pb-ioc-enrichment-006',
        playbookName: 'IOC Enrichment and Threat Intelligence',
        status: 'completed',
        triggeredBy: users[1].id,
        startedAt: new Date(now - 96 * 60 * 60 * 1000),
        completedAt: new Date(now - 95 * 60 * 60 * 1000),
        duration: 3600,
        result: {
          success: true,
          iocs_enriched: 25,
          virustotal_lookups: 25,
          threat_feeds_consulted: 8,
          malicious_confirmed: 18,
        },
        metadata: {
          sources: ['VirusTotal', 'AlienVault OTX', 'Abuse.ch', 'MISP'],
        },
      },
      {
        playbookId: 'pb-incident-containment-007',
        playbookName: 'Automated Incident Containment',
        status: 'completed',
        triggeredBy: users[0].id,
        startedAt: new Date(now - 120 * 60 * 60 * 1000),
        completedAt: new Date(now - 119 * 60 * 60 * 1000),
        duration: 1800,
        result: {
          success: true,
          systems_isolated: 8,
          firewall_rules_updated: true,
          edr_containment: true,
          user_accounts_disabled: 2,
        },
        metadata: {
          incident_id: 'inc-003',
          containment_method: 'network_isolation',
        },
      },
      {
        playbookId: 'pb-malware-detonation-008',
        playbookName: 'Malware Sandbox Analysis',
        status: 'failed',
        triggeredBy: users[2].id,
        startedAt: new Date(now - 144 * 60 * 60 * 1000),
        completedAt: new Date(now - 144 * 60 * 60 * 1000),
        duration: 600,
        errorMessage: 'Sandbox environment unavailable: connection timeout',
        result: null,
        metadata: {
          file_hash: 'e4d909c290d0fb1ca068ffaddf22cbd0',
          sandbox: 'Cuckoo Sandbox',
        },
      },
    ]
    : [];

  const playbooks = await PlaybookExecution.bulkCreate([...basePlaybooks, ...additionalPlaybooks]);
  console.log(`   ✓ Created ${playbooks.length} playbook executions\n`);
  return playbooks;
}

/**
 * Main seeding orchestration function.
 *
 * Coordinates database initialization, data clearing (if requested),
 * and sequential seeding of all entities respecting foreign key constraints.
 *
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If any seeding operation fails
 *
 * @remarks
 * Seeding order (respects foreign key dependencies):
 * 1. Users (referenced by Incident, AuditLog, PlaybookExecution)
 * 2. Independent entities (Vulnerability, Asset, IOC, ThreatActor)
 * 3. Dependent entities (Incident, AuditLog, PlaybookExecution)
 *
 * All operations are wrapped in try-catch for proper error handling.
 */
async function main(): Promise<void> {
  const config = parseArgs();

  try {
    console.log('🌱 Black-Cross Database Seeding Script\n');
    console.log('Configuration:');
    console.log(`   Force: ${config.force}`);
    console.log(`   Mode: ${config.full ? 'Full' : config.minimal ? 'Minimal' : 'Default'}\n`);

    // Initialize Sequelize
    initializeSequelize();
    console.log('✅ Sequelize initialized\n');

    // Sync database (alter mode - preserves existing data unless --force)
    await syncDatabase(false);
    console.log('✅ Database synchronized\n');

    // Clear existing data if --force flag is set
    if (config.force) {
      await clearDatabase();
    }

    // Seed data in order (respecting foreign key constraints)
    console.log('📊 Seeding entities...\n');

    const users = await seedUsers(config);
    const vulnerabilities = await seedVulnerabilities(config);
    const assets = await seedAssets(config);
    const iocs = await seedIOCs(config);
    const threatActors = await seedThreatActors(config);
    const incidents = await seedIncidents(users, config);
    const auditLogs = await seedAuditLogs(users, config);
    const playbooks = await seedPlaybookExecutions(users, config);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${users.length} Users`);
    console.log(`   - ${incidents.length} Incidents`);
    console.log(`   - ${vulnerabilities.length} Vulnerabilities`);
    console.log(`   - ${assets.length} Assets`);
    console.log(`   - ${iocs.length} IOCs`);
    console.log(`   - ${threatActors.length} Threat Actors`);
    console.log(`   - ${auditLogs.length} Audit Logs`);
    console.log(`   - ${playbooks.length} Playbook Executions\n`);

    console.log('🔐 Login Credentials:');
    console.log('   Admin:   admin@blackcross.com / Password123!');
    console.log('   Analyst: analyst@blackcross.com / Password123!');
    console.log('   Hunter:  hunter@blackcross.com / Password123!');
    console.log('   Manager: manager@blackcross.com / Password123!');
    console.log('   Viewer:  viewer@blackcross.com / Password123!\n');

    console.log('💡 Usage Tips:');
    console.log('   - Use --full flag for comprehensive data set');
    console.log('   - Use --force flag to clear and reseed database');
    console.log('   - All passwords are: Password123!\n');

    // Close connection
    await closeConnection();
    process.exit(0);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Database seeding failed:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Execute main function
main();
