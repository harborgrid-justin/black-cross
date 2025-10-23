/**
 * Database Seeding Script
 * Seeds the database with comprehensive test data for all models
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

async function seedUsers() {
  console.log('🌱 Seeding users...');

  // Check if users already exist
  const existingCount = await User.count();
  if (existingCount > 0) {
    console.log(`✅ Users already exist (${existingCount} found), skipping...`);
    return await User.findAll();
  }

  const password = await bcrypt.hash('admin', 10);

  const users = await User.bulkCreate([
    {
      email: 'admin@black-cross.io',
      username: 'admin',
      password,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
    },
    {
      email: 'nurse@black-cross.io',
      username: 'nurse',
      password: await bcrypt.hash('nurse', 10),
      firstName: 'Nurse',
      lastName: 'User',
      role: 'nurse',
      isActive: true,
      lastLogin: new Date(),
    },
    {
      email: 'analyst@black-cross.io',
      username: 'analyst',
      password: await bcrypt.hash('analyst', 10),
      firstName: 'Security',
      lastName: 'Analyst',
      role: 'analyst',
      isActive: true,
      lastLogin: new Date(),
    },
    {
      email: 'manager@black-cross.io',
      username: 'manager',
      password: await bcrypt.hash('manager', 10),
      firstName: 'Security',
      lastName: 'Manager',
      role: 'manager',
      isActive: true,
      lastLogin: new Date(),
    },
  ]);

  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function seedIncidents(users: User[]) {
  console.log('🌱 Seeding incidents...');

  const existingCount = await Incident.count();
  if (existingCount > 0) {
    console.log(`✅ Incidents already exist (${existingCount} found), skipping...`);
    return await Incident.findAll();
  }

  const incidents = await Incident.bulkCreate([
    {
      title: 'Ransomware Attack Detected',
      description: 'Multiple endpoints infected with ransomware. Immediate response required.',
      severity: 'critical',
      status: 'open',
      priority: 1,
      category: 'Malware',
      assignedToId: users[0].id,
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      title: 'Phishing Campaign Identified',
      description: 'Employees received suspicious emails attempting to steal credentials.',
      severity: 'high',
      status: 'investigating',
      priority: 2,
      category: 'Phishing',
      assignedToId: users[2].id,
      detectedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      title: 'Unauthorized Access Attempt',
      description: 'Multiple failed login attempts detected from foreign IP address.',
      severity: 'medium',
      status: 'open',
      priority: 3,
      category: 'Unauthorized Access',
      assignedToId: users[2].id,
      detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      title: 'Data Exfiltration Suspected',
      description: 'Unusual data transfer patterns detected in network traffic.',
      severity: 'high',
      status: 'investigating',
      priority: 2,
      category: 'Data Breach',
      assignedToId: users[0].id,
      detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    {
      title: 'DDoS Attack Mitigated',
      description: 'Large-scale DDoS attack successfully blocked by security infrastructure.',
      severity: 'high',
      status: 'resolved',
      priority: 1,
      category: 'DDoS',
      assignedToId: users[3].id,
      detectedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      resolvedAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
    },
    {
      title: 'Malware Infection Contained',
      description: 'Trojan detected and removed from employee workstation.',
      severity: 'medium',
      status: 'resolved',
      priority: 3,
      category: 'Malware',
      assignedToId: users[2].id,
      detectedAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
      resolvedAt: new Date(Date.now() - 60 * 60 * 60 * 1000), // 2.5 days ago
    },
  ]);

  console.log(`✅ Created ${incidents.length} incidents`);
  return incidents;
}

async function seedVulnerabilities() {
  console.log('🌱 Seeding vulnerabilities...');

  const existingCount = await Vulnerability.count();
  if (existingCount > 0) {
    console.log(`✅ Vulnerabilities already exist (${existingCount} found), skipping...`);
    return await Vulnerability.findAll();
  }

  const vulnerabilities = await Vulnerability.bulkCreate([
    {
      cveId: 'CVE-2023-44487',
      title: 'HTTP/2 Rapid Reset Attack',
      description: 'HTTP/2 protocol vulnerability allowing DDoS attacks through rapid stream resets.',
      severity: 'critical',
      cvssScore: 9.8,
      affectedSystems: ['Apache HTTP Server', 'nginx', 'Node.js'],
      status: 'open',
      publishedAt: new Date('2023-10-10'),
      discoveredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
    {
      cveId: 'CVE-2024-21762',
      title: 'FortiOS SSL VPN Vulnerability',
      description: 'Out-of-bounds write vulnerability in FortiOS SSL VPN.',
      severity: 'critical',
      cvssScore: 9.6,
      affectedSystems: ['FortiOS 7.0.0 - 7.0.13', 'FortiOS 7.2.0 - 7.2.6'],
      status: 'patching',
      publishedAt: new Date('2024-02-08'),
      discoveredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
    {
      cveId: 'CVE-2024-1086',
      title: 'Linux Kernel Use-After-Free',
      description: 'Use-after-free vulnerability in Linux kernel netfilter.',
      severity: 'high',
      cvssScore: 7.8,
      affectedSystems: ['Linux Kernel 5.14 - 6.6'],
      status: 'patched',
      publishedAt: new Date('2024-01-31'),
      discoveredAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      patchedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    },
    {
      cveId: 'CVE-2023-4863',
      title: 'libwebp Heap Buffer Overflow',
      description: 'Heap buffer overflow in WebP image codec library.',
      severity: 'critical',
      cvssScore: 10.0,
      affectedSystems: ['Chrome', 'Firefox', 'Safari', 'libwebp'],
      status: 'patched',
      publishedAt: new Date('2023-09-25'),
      discoveredAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      patchedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // 70 days ago
    },
    {
      cveId: 'CVE-2024-23897',
      title: 'Jenkins Arbitrary File Read',
      description: 'Arbitrary file read vulnerability in Jenkins CLI.',
      severity: 'high',
      cvssScore: 8.6,
      affectedSystems: ['Jenkins 2.441 and earlier', 'Jenkins LTS 2.426.2 and earlier'],
      status: 'open',
      publishedAt: new Date('2024-01-24'),
      discoveredAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    },
  ]);

  console.log(`✅ Created ${vulnerabilities.length} vulnerabilities`);
  return vulnerabilities;
}

async function seedAssets() {
  console.log('🌱 Seeding assets...');

  const existingCount = await Asset.count();
  if (existingCount > 0) {
    console.log(`✅ Assets already exist (${existingCount} found), skipping...`);
    return await Asset.findAll();
  }

  const assets = await Asset.bulkCreate([
    {
      name: 'Production Web Server',
      type: 'Server',
      ipAddress: '192.168.1.10',
      status: 'active',
      criticality: 'high',
      location: 'Data Center A',
    },
    {
      name: 'Database Server',
      type: 'Database',
      ipAddress: '192.168.1.20',
      status: 'active',
      criticality: 'critical',
      location: 'Data Center A',
    },
    {
      name: 'Application Server',
      type: 'Server',
      ipAddress: '192.168.1.30',
      status: 'active',
      criticality: 'high',
      location: 'Data Center B',
    },
    {
      name: 'Development Workstation',
      type: 'Workstation',
      ipAddress: '192.168.2.100',
      status: 'active',
      criticality: 'medium',
      location: 'Office Building',
    },
    {
      name: 'Legacy Server',
      type: 'Server',
      ipAddress: '192.168.1.5',
      status: 'inactive',
      criticality: 'low',
      location: 'Data Center A',
    },
  ]);

  console.log(`✅ Created ${assets.length} assets`);
  return assets;
}

async function seedIOCs() {
  console.log('🌱 Seeding IOCs (Indicators of Compromise)...');

  const existingCount = await IOC.count();
  if (existingCount > 0) {
    console.log(`✅ IOCs already exist (${existingCount} found), skipping...`);
    return await IOC.findAll();
  }

  const now = new Date();
  const iocs = await IOC.bulkCreate([
    {
      type: 'ip',
      value: '45.142.212.61',
      severity: 'critical',
      confidence: 95,
      description: 'Known C2 server IP associated with APT28',
      source: 'ThreatConnect',
      tags: ['apt28', 'c2', 'russia'],
      firstSeen: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      lastSeen: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      type: 'domain',
      value: 'malicious-site.com',
      severity: 'high',
      confidence: 88,
      description: 'Phishing domain used in credential harvesting campaign',
      source: 'URLhaus',
      tags: ['phishing', 'credential-theft'],
      firstSeen: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      lastSeen: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      type: 'hash',
      value: 'e4d909c290d0fb1ca068ffaddf22cbd0',
      severity: 'critical',
      confidence: 98,
      description: 'MD5 hash of Emotet malware variant',
      source: 'VirusTotal',
      tags: ['emotet', 'malware', 'trojan'],
      firstSeen: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      lastSeen: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      type: 'email',
      value: 'phishing@suspicious-domain.net',
      severity: 'medium',
      confidence: 75,
      description: 'Email address used in recent phishing campaign',
      source: 'PhishTank',
      tags: ['phishing', 'spam'],
      firstSeen: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      lastSeen: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    {
      type: 'url',
      value: 'http://evil-site.ru/payload.exe',
      severity: 'high',
      confidence: 92,
      description: 'URL hosting ransomware payload',
      source: 'Abuse.ch',
      tags: ['ransomware', 'malware-distribution'],
      firstSeen: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      lastSeen: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
  ]);

  console.log(`✅ Created ${iocs.length} IOCs`);
  return iocs;
}

async function seedThreatActors() {
  console.log('🌱 Seeding threat actors...');

  const existingCount = await ThreatActor.count();
  if (existingCount > 0) {
    console.log(`✅ Threat actors already exist (${existingCount} found), skipping...`);
    return await ThreatActor.findAll();
  }

  const now = new Date();
  const threatActors = await ThreatActor.bulkCreate([
    {
      name: 'APT28 (Fancy Bear)',
      aliases: ['Sofacy', 'Sednit', 'STRONTIUM'],
      sophistication: 'advanced',
      motivation: ['espionage', 'political'],
      country: 'Russia',
      description: 'Russian state-sponsored cyber espionage group targeting government and military organizations.',
      tags: ['apt', 'russia', 'government', 'military'],
      firstSeen: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      lastSeen: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      name: 'Lazarus Group',
      aliases: ['Hidden Cobra', 'Guardians of Peace'],
      sophistication: 'advanced',
      motivation: ['financial', 'espionage'],
      country: 'North Korea',
      description: 'North Korean state-sponsored APT group known for financial theft and espionage.',
      tags: ['apt', 'north-korea', 'financial-crime', 'cryptocurrency'],
      firstSeen: new Date(now.getTime() - 500 * 24 * 60 * 60 * 1000), // 500 days ago
      lastSeen: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    },
    {
      name: 'Carbanak',
      aliases: ['FIN7', 'Anunak'],
      sophistication: 'intermediate',
      motivation: ['financial'],
      country: 'Unknown',
      description: 'Cybercrime group targeting financial institutions and ATM networks.',
      tags: ['cybercrime', 'banking', 'financial-services'],
      firstSeen: new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000), // 2 years ago
      lastSeen: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
    {
      name: 'Equation Group',
      aliases: ['EQGRP'],
      sophistication: 'expert',
      motivation: ['espionage', 'intelligence'],
      country: 'United States',
      description: 'Sophisticated threat actor linked to NSA, known for advanced persistent threats.',
      tags: ['apt', 'nation-state', 'advanced'],
      firstSeen: new Date(now.getTime() - 1000 * 24 * 60 * 60 * 1000), // ~3 years ago
      lastSeen: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
    },
  ]);

  console.log(`✅ Created ${threatActors.length} threat actors`);
  return threatActors;
}

async function seedAuditLogs(users: User[]) {
  console.log('🌱 Seeding audit logs...');

  const existingCount = await AuditLog.count();
  if (existingCount > 0) {
    console.log(`✅ Audit logs already exist (${existingCount} found), skipping...`);
    return await AuditLog.findAll();
  }

  const auditLogs = await AuditLog.bulkCreate([
    {
      userId: users[0].id,
      action: 'login',
      resource: 'Authentication',
      details: 'Admin user logged in successfully',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    },
    {
      userId: users[0].id,
      action: 'create',
      resource: 'Incident',
      details: 'Created new incident: Ransomware Attack Detected',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    },
    {
      userId: users[2].id,
      action: 'update',
      resource: 'Vulnerability',
      details: 'Updated vulnerability status to patching',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    },
    {
      userId: users[1].id,
      action: 'login',
      resource: 'Authentication',
      details: 'Nurse user logged in successfully',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0',
    },
  ]);

  console.log(`✅ Created ${auditLogs.length} audit logs`);
  return auditLogs;
}

async function seedPlaybookExecutions(users: User[]) {
  console.log('🌱 Seeding playbook executions...');

  const existingCount = await PlaybookExecution.count();
  if (existingCount > 0) {
    console.log(`✅ Playbook executions already exist (${existingCount} found), skipping...`);
    return await PlaybookExecution.findAll();
  }

  const playbooks = await PlaybookExecution.bulkCreate([
    {
      playbookId: 'pb-001',
      playbookName: 'Ransomware Response',
      status: 'completed',
      triggeredBy: users[0].id,
      startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      result: 'Successfully isolated affected systems and initiated backup restoration',
    },
    {
      playbookId: 'pb-002',
      playbookName: 'Phishing Investigation',
      status: 'running',
      triggeredBy: users[2].id,
      startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      result: 'In progress: Analyzing email headers and extracting IOCs',
    },
    {
      playbookId: 'pb-003',
      playbookName: 'Vulnerability Scan',
      status: 'completed',
      triggeredBy: users[3].id,
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      completedAt: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22 hours ago
      result: 'Scan completed: 45 vulnerabilities identified, 12 critical',
    },
  ]);

  console.log(`✅ Created ${playbooks.length} playbook executions`);
  return playbooks;
}

async function main() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Initialize Sequelize
    initializeSequelize();
    console.log('✅ Sequelize initialized\n');

    // Sync database (alter mode - preserves existing data)
    await syncDatabase(false);
    console.log('✅ Database synchronized\n');

    // Seed data in order (respecting foreign key constraints)
    const users = await seedUsers();
    await seedIncidents(users);
    await seedVulnerabilities();
    await seedAssets();
    await seedIOCs();
    await seedThreatActors();
    await seedAuditLogs(users);
    await seedPlaybookExecutions(users);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - 4 Users (admin, nurse, analyst, manager)');
    console.log('   - 6 Incidents');
    console.log('   - 5 Vulnerabilities');
    console.log('   - 5 Assets');
    console.log('   - 5 IOCs');
    console.log('   - 4 Threat Actors');
    console.log('   - 4 Audit Logs');
    console.log('   - 3 Playbook Executions');
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin:   admin@black-cross.io / admin');
    console.log('   Nurse:   nurse@black-cross.io / nurse');
    console.log('   Analyst: analyst@black-cross.io / analyst');
    console.log('   Manager: manager@black-cross.io / manager');

    // Close connection
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

main();
