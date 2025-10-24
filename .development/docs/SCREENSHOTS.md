# Black-Cross Platform Screenshots

This document provides a comprehensive visual overview of all pages in the Black-Cross Enterprise Cyber Threat Intelligence Platform frontend.

## Overview

All screenshots were captured on October 19, 2025, showing the current state of the application's user interface. Screenshots are stored in the `docs/screenshots/` directory.

**Total Screenshots:** 22
- 17 main page screenshots (00-16)
- 5 additional detail views and tab interactions (17-21)

This comprehensive collection includes both the main pages and specific tab/detail views to showcase the full functionality of the Black-Cross platform.

---

## Login & Authentication

### Login Page
**File:** `00-login.png`  
**Route:** `/login`  
**Description:** The authentication entry point for the platform, featuring the Black-Cross branding and login form with email and password fields.

**Features:**
- Clean, centered login form
- Black-Cross branding and logo
- Email and password input fields
- Default credentials displayed for development

---

## Main Application Pages

### 1. Dashboard
**File:** `01-dashboard.png`  
**Route:** `/dashboard` or `/`  
**Description:** The main landing page after authentication, providing a simplified overview of the platform.

**Features:**
- Welcome message and success alert
- Navigation sidebar with all module links
- Clean, dark-themed interface
- Platform branding header

---

### 2. Threat Intelligence
**File:** `02-threat-intelligence.png`  
**Route:** `/threat-intelligence`  
**Description:** Central hub for managing threat intelligence data with search, filtering, and threat management capabilities.

**Features:**
- Search functionality with text input
- Severity filter (All, Critical, High, Medium, Low)
- Status filter (All, Active, Archived)
- Refresh and Add Threat action buttons
- Loading state with progress indicator

---

### 3. Incident Response
**File:** `03-incident-response.png`  
**Route:** `/incident-response`  
**Description:** Incident management interface displaying active security incidents with details.

**Features:**
- Incident list with key information (Title, Severity, Status, Assigned To, Created date)
- Color-coded severity badges (High, Medium)
- Status indicators (Investigating, Open)
- New Incident creation button
- Mock data display with informational alert

**Sample Incidents:**
- Phishing Attack on Finance Department (High severity, Investigating)
- Suspicious Login Activity (Medium severity, Open)

---

### 4. Threat Hunting
**File:** `04-threat-hunting.png`  
**Route:** `/threat-hunting`  
**Description:** Advanced threat hunting platform with query builder, hypotheses tracking, and findings management.

**Features:**
- Statistics dashboard (28 Hypotheses, 12 Active, 8 Validated, 45 Findings, 6 Critical, 3 Campaigns)
- Query Builder with KQL language support
- Query execution and save functionality
- Hunting Hypotheses list with severity and status badges
- Findings panel (1 finding shown)

**Sample Hypotheses:**
- Suspicious PowerShell Activity (High, Active)
- Unusual Network Traffic (Critical, Active)
- Lateral Movement Detection (High, Validated)
- Data Exfiltration Patterns (Critical, Active)

---

### 5. Vulnerability Management
**File:** `05-vulnerability-management.png`  
**Route:** `/vulnerability-management`  
**Description:** Comprehensive vulnerability tracking and risk assessment dashboard.

**Features:**
- Risk Overview with severity breakdown:
  - Critical: 5
  - High: 12
  - Medium: 28
  - Low: 45
- Visual progress bars for each severity level
- Vulnerability details table with CVE IDs, titles, severity, CVSS scores, status, and affected assets
- Scan Now action button

**Sample Vulnerabilities:**
- CVE-2023-12345: Remote Code Execution in Apache (Critical, 9.8 CVSS, Open, 5 assets)
- CVE-2023-54321: SQL Injection Vulnerability (High, 8.2 CVSS, Patched, 1 asset)
- CVE-2023-98765: Cross-Site Scripting (XSS) (Medium, 6.5 CVSS, Mitigated, 1 asset)

---

### 6. SIEM Dashboard
**File:** `06-siem-dashboard.png`  
**Route:** `/siem`  
**Description:** Security Information and Event Management dashboard showing real-time security events and alerts.

**Features:**
- Key metrics: 15,420 Total Events, 47 Active Alerts, 12 Correlations, 156 Active Rules
- Active Alerts table with severity, status, event counts, and timestamps
- Recent Security Events log with source, severity, event type, and messages
- Search functionality for log filtering

**Active Alerts:**
- Brute Force Attack Detected (CRITICAL, Active, 342 events)
- Unusual Outbound Traffic (HIGH, Investigating, 28 events)
- Port Scanning Activity (MEDIUM, Active, 156 events)

---

### 7. Threat Actors
**File:** `07-threat-actors.png`  
**Route:** `/threat-actors`  
**Description:** Database of known threat actors and their profiles.

**Features:**
- Loading state indicator
- Designed for tracking threat actor groups and their activities

---

### 8. IoC Management
**File:** `08-ioc-management.png`  
**Route:** `/ioc-management`  
**Description:** Indicators of Compromise (IoC) management system.

**Features:**
- Loading state indicator
- Designed for managing IoCs including hashes, IPs, domains, URLs, and other indicators

---

### 9. Threat Feeds
**File:** `09-threat-feeds.png`  
**Route:** `/threat-feeds`  
**Description:** Integration and management of external threat intelligence feeds.

**Features:**
- Loading state indicator
- Designed for aggregating threat data from multiple sources

---

### 10. Risk Assessment
**File:** `10-risk-assessment.png`  
**Route:** `/risk-assessment`  
**Description:** Organizational risk assessment and management tools.

**Features:**
- Loading state indicator
- Designed for evaluating and tracking security risks across the organization

---

### 11. Collaboration Hub
**File:** `11-collaboration-hub.png`  
**Route:** `/collaboration`  
**Description:** Team collaboration workspace for security operations.

**Features:**
- Project and task management
- Statistics: 8 Active Projects, 24 Team Members, 45 Open Tasks, 12 Unread Messages
- Tasks list with priorities (High, Medium, Low, Critical) and status (In-progress, Pending, Completed)
- Team members panel with online status indicators
- Recent activity feed
- Team chat interface with message history and input field

**Sample Tasks:**
- Investigate phishing campaign (High, In-progress, John Doe)
- Update threat intelligence feeds (Medium, Pending, Jane Smith)
- Review incident response playbook (Low, Completed, Bob Johnson)
- Patch critical vulnerabilities (Critical, In-progress, Alice Williams)

---

### 12. Reporting & Analytics
**File:** `12-reporting-analytics.png`  
**Route:** `/reporting`  
**Description:** Comprehensive reporting and analytics dashboard with KPIs and visual charts.

**Features:**
- Report generation with type and time range selection
- Statistics: 42 Total Reports, 15 Scheduled Reports, 28 Reports This Month, 2.3s Avg Generation Time
- Key Performance Indicators:
  - Mean Time to Detect (MTTD): 2.4 hours (↓ -15%)
  - Mean Time to Respond (MTTR): 4.8 hours (↓ -22%)
  - Threat Detection Rate: 94.5% (↑ +3%)
  - False Positive Rate: 8.2% (↓ -5%)
- Visual charts for threat trends, type distribution, and severity distribution
- Saved reports table with export options (PDF, CSV, JSON)

**Sample Reports:**
- Executive Security Dashboard (Executive, Weekly, Completed)
- Threat Intelligence Summary (Technical, Daily, Completed)
- Incident Response Report (Operational, Monthly, Completed)
- Compliance Audit Report (Compliance, Quarterly, Pending)

---

### 13. Malware Analysis
**File:** `13-malware-analysis.png`  
**Route:** `/malware-analysis`  
**Description:** Malware analysis and sandbox environment for file analysis.

**Features:**
- Statistics: 245 Total Samples, 198 Analyzed, 156 Malicious, 12 Pending
- Tabbed interface: Samples, Malware Families, YARA Rules
- Sample analysis table with file details, hashes, types, risk levels, and status
- Upload Sample and Refresh actions

**Sample Files:**
- suspicious.exe (512 KB, PE32, High risk, Completed)
- document.pdf (100 KB, PDF, Medium risk, Analyzing)
- malware.bin (1024 KB, ELF, Critical risk, Pending)

---

### 14. Dark Web Monitoring
**File:** `14-dark-web-monitoring.png`  
**Route:** `/dark-web`  
**Description:** Dark web monitoring system for tracking mentions, leaks, and threats.

**Features:**
- Statistics: 127 Total Findings, 12 Critical, 34 Credential Leaks, 56 Brand Mentions, 15 Active Keywords, 8 Active Sources
- Tabbed interface: Findings (3), Credential Leaks (1), Keywords (2)
- Search functionality for findings
- Detailed findings table with type icons, titles, sources, severity, status, and discovery dates

**Sample Findings:**
- Employee Credentials Leaked (Critical, New, from Dark Forum)
- Brand Mentioned in Marketplace (Medium, Investigating, from Marketplace)
- Database Dump Discovered (High, Validated, from Paste Site)

---

### 15. Compliance Management
**File:** `15-compliance-management.png`  
**Route:** `/compliance`  
**Description:** Compliance framework tracking and audit management system.

**Features:**
- Compliance frameworks with completion percentages:
  - SOC 2 v2017: 92% (143/156 controls, Last assessed: 10/12/2025)
  - ISO 27001 v2013: 88% (100/114 controls, Last assessed: 10/5/2025)
  - NIST CSF v1.1: 85% (83/98 controls, Last assessed: 9/19/2025)
  - GDPR v2018: 95% (43/45 controls, Last assessed: 9/28/2025)
- Tabbed interface for selected framework: Controls, Gaps (2), Audit Logs
- Controls table with ID, name, category, status (Compliant/Non-compliant), and last reviewed date
- Analyze Gaps and Generate Report actions

**Sample Controls:**
- CC1.1: Control Environment (Common Criteria, Compliant)
- CC2.1: Communication and Information (Common Criteria, Compliant)
- CC3.1: Risk Assessment (Common Criteria, Non-compliant)

---

### 16. Automation Playbooks
**File:** `16-automation-playbooks.png`  
**Route:** `/automation`  
**Description:** Security automation and orchestration playbook management.

**Features:**
- Loading state indicator
- Designed for creating and managing automated response playbooks

---

## Technical Details

### Platform Information
- **Platform Name:** Black-Cross
- **Full Name:** Enterprise Cyber Threat Intelligence Platform
- **Theme:** Dark mode with blue primary colors
- **UI Framework:** Material-UI (MUI)
- **Total Pages:** 17 (including login)
- **Navigation:** Persistent left sidebar with icons and labels

### Color Scheme
- **Background:** Dark navy/blue (#0a1929, #132f4c)
- **Primary:** Blue (#1976d2)
- **Secondary:** Red/Pink (#dc004e)
- **Success:** Green
- **Warning:** Orange/Yellow
- **Error:** Red
- **Critical:** Red badges
- **High:** Orange badges
- **Medium:** Yellow/Amber badges
- **Low:** Green badges

### Common UI Elements
- Persistent navigation sidebar (left)
- Top header with platform title and user menu
- Action buttons with icons (Refresh, Add, Upload, etc.)
- Data tables with sorting and pagination
- Filter dropdowns and search inputs
- Loading states with circular progress indicators
- Alert messages for errors and information
- Severity/status badges with color coding
- Tab interfaces for multi-view pages

### Status Indicators
- **Online/Active:** Green
- **Away:** Yellow/Orange
- **Offline:** Gray
- **Completed:** Green
- **Pending:** Yellow
- **In-progress:** Blue
- **Failed/Non-compliant:** Red

---

## File Listing

### Main Page Screenshots

| # | Filename | Page Name | Route |
|---|----------|-----------|-------|
| 00 | `00-login.png` | Login | `/login` |
| 01 | `01-dashboard.png` | Dashboard | `/` or `/dashboard` |
| 02 | `02-threat-intelligence.png` | Threat Intelligence | `/threat-intelligence` |
| 03 | `03-incident-response.png` | Incident Response | `/incident-response` |
| 04 | `04-threat-hunting.png` | Threat Hunting | `/threat-hunting` |
| 05 | `05-vulnerability-management.png` | Vulnerability Management | `/vulnerability-management` |
| 06 | `06-siem-dashboard.png` | SIEM Dashboard | `/siem` |
| 07 | `07-threat-actors.png` | Threat Actors | `/threat-actors` |
| 08 | `08-ioc-management.png` | IoC Management | `/ioc-management` |
| 09 | `09-threat-feeds.png` | Threat Feeds | `/threat-feeds` |
| 10 | `10-risk-assessment.png` | Risk Assessment | `/risk-assessment` |
| 11 | `11-collaboration-hub.png` | Collaboration Hub | `/collaboration` |
| 12 | `12-reporting-analytics.png` | Reporting & Analytics | `/reporting` |
| 13 | `13-malware-analysis.png` | Malware Analysis | `/malware-analysis` |
| 14 | `14-dark-web-monitoring.png` | Dark Web Monitoring | `/dark-web` |
| 15 | `15-compliance-management.png` | Compliance Management | `/compliance` |
| 16 | `16-automation-playbooks.png` | Automation Playbooks | `/automation` |

### Detail Views and Tab Interactions

| # | Filename | Description | Route/Tab |
|---|----------|-------------|-----------|
| 17 | `17-collaboration-hub-detail.png` | Collaboration Hub Detail | `/collaboration` |
| 18 | `18-malware-analysis-families.png` | Malware Families Tab | `/malware-analysis` (Malware Families) |
| 19 | `19-malware-analysis-yara-rules.png` | YARA Rules Tab | `/malware-analysis` (YARA Rules) |
| 20 | `20-dark-web-credential-leaks.png` | Credential Leaks Tab | `/dark-web` (Credential Leaks) |
| 21 | `21-compliance-gaps.png` | Compliance Gaps Tab | `/compliance` (Gaps) |

---

## Notes

- All screenshots were captured using Playwright browser automation
- Some pages show loading states or mock data due to backend API availability
- The application demonstrates a comprehensive security operations platform
- 22 total screenshots documented (17 main pages + 5 detail/tab views)
- Screenshots include full-page captures showing complete layouts
- Additional screenshots showcase:
  - Different tabs within multi-tab interfaces
  - Detail views with fully loaded data
  - Interactive elements and specific views

## Additional Screenshots - Detail Views and Tab Interactions

### 17. Collaboration Hub - Detail View
**File:** `17-collaboration-hub-detail.png`  
**Route:** `/collaboration`  
**Description:** Detailed view of the collaboration hub showing fully loaded tasks, team members, and chat interface.

**Features:**
- Active project and member statistics
- Detailed task list with assignees and priorities
- Team member online status indicators
- Activity timeline
- Real-time chat interface

---

### 18. Malware Analysis - Malware Families Tab
**File:** `18-malware-analysis-families.png`  
**Route:** `/malware-analysis` (Malware Families tab)  
**Description:** The Malware Families tab showing classification of samples by malware family.

**Features:**
- Family name cards (Emotet, Trickbot, Ransomware)
- Sample counts per family
- Visual organization of malware categories

---

### 19. Malware Analysis - YARA Rules Tab
**File:** `19-malware-analysis-yara-rules.png`  
**Route:** `/malware-analysis` (YARA Rules tab)  
**Description:** The YARA Rules tab for managing detection rules.

**Features:**
- YARA rule management interface
- Placeholder for rule display

---

### 20. Dark Web Monitoring - Credential Leaks Tab
**File:** `20-dark-web-credential-leaks.png`  
**Route:** `/dark-web` (Credential Leaks tab)  
**Description:** Dedicated view for monitoring credential leaks discovered on the dark web.

**Features:**
- Email and domain tracking
- Source identification
- Validation status tracking
- Discovery timestamps
- Validation action buttons

**Sample Data:**
- user@company.com from Dark Forum (Not validated)

---

### 21. Compliance Management - Gaps Tab
**File:** `21-compliance-gaps.png`  
**Route:** `/compliance` (Gaps tab for SOC 2)  
**Description:** Compliance gap analysis showing identified issues and remediation steps.

**Features:**
- Control ID and name
- Gap descriptions
- Priority levels (High, Medium)
- Remediation recommendations

**Sample Gaps:**
- CC3.1: Missing documented risk assessment process (High priority)
- CC4.2: Incomplete monitoring coverage (Medium priority)

---

*Last Updated: October 19, 2025*
*Platform Version: 1.0.0*
*Total Screenshots: 22 (17 main pages + 5 detail/tab views)*
