/**
 * Simple script to seed threat intelligence data for Cypress tests
 */

import { initializeSequelize, closeConnection, getSequelize } from '../config/sequelize';

async function seedThreats() {
  console.log('🌱 Seeding threat intelligence data...');

  try {
    await initializeSequelize();
    const sequelize = getSequelize();

    // Insert threats directly using Sequelize raw query
    const threats = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'APT29 Phishing Campaign',
        type: 'phishing',
        severity: 'critical',
        status: 'active',
        confidence: 95,
        description: 'Advanced persistent threat targeting government agencies',
        source: 'Internal Analysis',
        firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Ransomware Attack Vector',
        type: 'malware',
        severity: 'high',
        status: 'active',
        confidence: 88,
        description: 'New ransomware strain detected in the wild',
        source: 'Threat Feed',
        firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'DDoS Botnet Activity',
        type: 'ddos',
        severity: 'medium',
        status: 'archived',
        confidence: 75,
        description: 'Botnet coordinating DDoS attacks',
        source: 'External Intel',
        firstSeen: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'SQL Injection Attempt',
        type: 'exploit',
        severity: 'high',
        status: 'resolved',
        confidence: 92,
        description: 'Automated SQL injection scanning detected',
        source: 'WAF Logs',
        firstSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Data Exfiltration Attempt',
        type: 'data-breach',
        severity: 'critical',
        status: 'active',
        confidence: 98,
        description: 'Suspicious data transfer to external server',
        source: 'Network Monitoring',
        firstSeen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const threat of threats) {
      await sequelize.query(
        `INSERT INTO "Threats" (id, name, type, severity, status, confidence, description, source, "firstSeen", "lastSeen", "createdAt", "updatedAt")
         VALUES (:id, :name, :type, :severity, :status, :confidence, :description, :source, :firstSeen, :lastSeen, :createdAt, :updatedAt)
         ON CONFLICT (id) DO NOTHING`,
        {
          replacements: threat,
        },
      );
    }

    console.log(`✅ Seeded ${threats.length} threat intelligence records`);

    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await closeConnection();
    process.exit(1);
  }
}

seedThreats();
