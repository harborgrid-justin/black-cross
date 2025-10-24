/**
 * @fileoverview Application route constants and navigation configuration.
 *
 * Provides centralized route path definitions for:
 * - Public routes (accessible without authentication)
 * - Protected routes (require authentication)
 * - Dynamic route factory functions
 * - Navigation menu items
 * - Breadcrumb titles
 *
 * Benefits:
 * - Type-safe route references throughout the application
 * - Single source of truth for all route paths
 * - Easy route refactoring and updates
 * - Consistent navigation structure
 * - Prevents typos in route paths
 *
 * Route Patterns:
 * - Static routes: Simple string paths
 * - Dynamic routes: Factory functions that accept parameters
 *
 * @module constants/routes
 *
 * @example
 * ```typescript
 * import { PUBLIC_ROUTES, PROTECTED_ROUTES } from '@/constants/routes';
 *
 * // Static route
 * navigate(PUBLIC_ROUTES.LOGIN);
 *
 * // Dynamic route with parameter
 * navigate(PROTECTED_ROUTES.THREAT_INTELLIGENCE_DETAIL('123'));
 * ```
 */

/**
 * Public routes accessible without authentication.
 *
 * These routes are available to all users and typically include login,
 * registration, password reset, and error pages.
 *
 * @constant
 * @type {Object}
 * @property {string} HOME - Home/landing page
 * @property {string} LOGIN - User login page
 * @property {string} REGISTER - User registration page
 * @property {string} FORGOT_PASSWORD - Password reset request page
 * @property {string} RESET_PASSWORD - Password reset completion page
 * @property {string} NOT_FOUND - 404 error page
 * @property {string} UNAUTHORIZED - 401 unauthorized access page
 * @property {string} SERVER_ERROR - 500 server error page
 *
 * @example
 * ```typescript
 * import { PUBLIC_ROUTES } from '@/constants/routes';
 *
 * <Route path={PUBLIC_ROUTES.LOGIN} element={<Login />} />
 * ```
 */
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
  SERVER_ERROR: '/500',
} as const;

/**
 * Protected routes requiring authentication.
 *
 * These routes are only accessible to authenticated users and cover all
 * platform features and modules. Includes both static paths and dynamic
 * route factory functions for parameterized URLs.
 *
 * Factory functions follow the pattern: (id: string) => string
 *
 * @constant
 * @type {Object}
 *
 * @example
 * ```typescript
 * import { PROTECTED_ROUTES } from '@/constants/routes';
 *
 * // Static route
 * navigate(PROTECTED_ROUTES.DASHBOARD);
 *
 * // Dynamic route
 * navigate(PROTECTED_ROUTES.INCIDENTS_DETAIL('incident-123'));
 * ```
 */
export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',

  // Threat Intelligence
  THREAT_INTELLIGENCE: '/threat-intelligence',
  THREAT_INTELLIGENCE_LIST: '/threat-intelligence',
  THREAT_INTELLIGENCE_DETAIL: (id: string) => `/threat-intelligence/${id}`,
  THREAT_INTELLIGENCE_CREATE: '/threat-intelligence/new',

  // Incident Response
  INCIDENTS: '/incidents',
  INCIDENTS_LIST: '/incidents',
  INCIDENTS_DETAIL: (id: string) => `/incidents/${id}`,
  INCIDENTS_CREATE: '/incidents/new',

  // Threat Hunting
  THREAT_HUNTING: '/threat-hunting',
  THREAT_HUNTING_SESSIONS: '/threat-hunting/sessions',
  THREAT_HUNTING_SESSION: (id: string) => `/threat-hunting/sessions/${id}`,
  THREAT_HUNTING_NEW: '/threat-hunting/new',

  // Vulnerability Management
  VULNERABILITIES: '/vulnerabilities',
  VULNERABILITIES_LIST: '/vulnerabilities',
  VULNERABILITIES_DETAIL: (id: string) => `/vulnerabilities/${id}`,
  VULNERABILITIES_SCAN: '/vulnerabilities/scan',

  // SIEM
  SIEM: '/siem',
  SIEM_DASHBOARD: '/siem/dashboard',
  SIEM_EVENTS: '/siem/events',
  SIEM_ALERTS: '/siem/alerts',
  SIEM_SEARCH: '/siem/search',

  // Threat Actors
  THREAT_ACTORS: '/threat-actors',
  THREAT_ACTORS_LIST: '/threat-actors',
  THREAT_ACTORS_DETAIL: (id: string) => `/threat-actors/${id}`,

  // IOC Management
  IOCS: '/iocs',
  IOCS_LIST: '/iocs',
  IOCS_DETAIL: (id: string) => `/iocs/${id}`,
  IOCS_IMPORT: '/iocs/import',

  // Threat Feeds
  THREAT_FEEDS: '/threat-feeds',
  THREAT_FEEDS_LIST: '/threat-feeds',
  THREAT_FEEDS_DETAIL: (id: string) => `/threat-feeds/${id}`,
  THREAT_FEEDS_ADD: '/threat-feeds/add',

  // Risk Assessment
  RISK_ASSESSMENT: '/risk-assessment',
  RISK_ASSESSMENT_LIST: '/risk-assessment',
  RISK_ASSESSMENT_DETAIL: (id: string) => `/risk-assessment/${id}`,
  RISK_ASSESSMENT_NEW: '/risk-assessment/new',

  // Collaboration
  COLLABORATION: '/collaboration',
  COLLABORATION_WORKSPACES: '/collaboration/workspaces',
  COLLABORATION_WORKSPACE: (id: string) => `/collaboration/workspaces/${id}`,

  // Reporting
  REPORTING: '/reporting',
  REPORTING_LIST: '/reporting',
  REPORTING_DETAIL: (id: string) => `/reporting/${id}`,
  REPORTING_CREATE: '/reporting/create',

  // Malware Analysis
  MALWARE_ANALYSIS: '/malware-analysis',
  MALWARE_ANALYSIS_SAMPLES: '/malware-analysis/samples',
  MALWARE_ANALYSIS_SAMPLE: (id: string) => `/malware-analysis/samples/${id}`,
  MALWARE_ANALYSIS_UPLOAD: '/malware-analysis/upload',

  // Dark Web Monitoring
  DARK_WEB: '/dark-web',
  DARK_WEB_INTEL: '/dark-web/intel',
  DARK_WEB_MONITORS: '/dark-web/monitors',
  DARK_WEB_ALERTS: '/dark-web/alerts',

  // Compliance
  COMPLIANCE: '/compliance',
  COMPLIANCE_FRAMEWORKS: '/compliance/frameworks',
  COMPLIANCE_AUDITS: '/compliance/audits',
  COMPLIANCE_REPORTS: '/compliance/reports',

  // Automation & Playbooks
  AUTOMATION: '/automation',
  AUTOMATION_PLAYBOOKS: '/automation/playbooks',
  AUTOMATION_PLAYBOOK: (id: string) => `/automation/playbooks/${id}`,
  AUTOMATION_INTEGRATIONS: '/automation/integrations',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_PREFERENCES: '/settings/preferences',
  SETTINGS_TEAM: '/settings/team',
  SETTINGS_INTEGRATIONS: '/settings/integrations',

  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_AUDIT: '/admin/audit',
  ADMIN_SYSTEM: '/admin/system',
} as const;

/**
 * Combined route object containing both public and protected routes.
 *
 * Provides a single import point for accessing any application route.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * ```typescript
 * import { ROUTES } from '@/constants/routes';
 *
 * navigate(ROUTES.LOGIN);
 * navigate(ROUTES.DASHBOARD);
 * ```
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
} as const;

/**
 * Navigation menu item configuration for the application sidebar.
 *
 * Defines the structure and content of the main navigation menu including
 * labels, paths, and icon identifiers for all platform modules.
 *
 * @constant
 * @type {ReadonlyArray<{label: string, path: string, icon: string}>}
 *
 * @example
 * ```typescript
 * import { NAV_ITEMS } from '@/constants/routes';
 *
 * {NAV_ITEMS.map(item => (
 *   <MenuItem key={item.path} onClick={() => navigate(item.path)}>
 *     {item.label}
 *   </MenuItem>
 * ))}
 * ```
 */
export const NAV_ITEMS = [
  { label: 'Dashboard', path: PROTECTED_ROUTES.DASHBOARD, icon: 'dashboard' },
  { label: 'Threat Intelligence', path: PROTECTED_ROUTES.THREAT_INTELLIGENCE, icon: 'shield' },
  { label: 'Incidents', path: PROTECTED_ROUTES.INCIDENTS, icon: 'warning' },
  { label: 'Threat Hunting', path: PROTECTED_ROUTES.THREAT_HUNTING, icon: 'search' },
  { label: 'Vulnerabilities', path: PROTECTED_ROUTES.VULNERABILITIES, icon: 'bug_report' },
  { label: 'SIEM', path: PROTECTED_ROUTES.SIEM, icon: 'analytics' },
  { label: 'Threat Actors', path: PROTECTED_ROUTES.THREAT_ACTORS, icon: 'people' },
  { label: 'IOCs', path: PROTECTED_ROUTES.IOCS, icon: 'fingerprint' },
  { label: 'Threat Feeds', path: PROTECTED_ROUTES.THREAT_FEEDS, icon: 'rss_feed' },
  { label: 'Risk Assessment', path: PROTECTED_ROUTES.RISK_ASSESSMENT, icon: 'assessment' },
  { label: 'Collaboration', path: PROTECTED_ROUTES.COLLABORATION, icon: 'groups' },
  { label: 'Reporting', path: PROTECTED_ROUTES.REPORTING, icon: 'description' },
  { label: 'Malware Analysis', path: PROTECTED_ROUTES.MALWARE_ANALYSIS, icon: 'virus' },
  { label: 'Dark Web', path: PROTECTED_ROUTES.DARK_WEB, icon: 'dark_mode' },
  { label: 'Compliance', path: PROTECTED_ROUTES.COMPLIANCE, icon: 'verified' },
  { label: 'Automation', path: PROTECTED_ROUTES.AUTOMATION, icon: 'auto_awesome' },
] as const;

/**
 * Breadcrumb title mapping for navigation paths.
 *
 * Maps route paths to human-readable titles for breadcrumb navigation.
 * Used to generate breadcrumb trails showing the user's current location
 * in the application hierarchy.
 *
 * @constant
 * @type {Record<string, string>}
 *
 * @example
 * ```typescript
 * import { BREADCRUMB_TITLES } from '@/constants/routes';
 *
 * const title = BREADCRUMB_TITLES[currentPath];
 * <Breadcrumb>{title}</Breadcrumb>
 * ```
 */
export const BREADCRUMB_TITLES: Record<string, string> = {
  [PROTECTED_ROUTES.DASHBOARD]: 'Dashboard',
  [PROTECTED_ROUTES.THREAT_INTELLIGENCE]: 'Threat Intelligence',
  [PROTECTED_ROUTES.INCIDENTS]: 'Incidents',
  [PROTECTED_ROUTES.THREAT_HUNTING]: 'Threat Hunting',
  [PROTECTED_ROUTES.VULNERABILITIES]: 'Vulnerabilities',
  [PROTECTED_ROUTES.SIEM]: 'SIEM',
  [PROTECTED_ROUTES.THREAT_ACTORS]: 'Threat Actors',
  [PROTECTED_ROUTES.IOCS]: 'IOCs',
  [PROTECTED_ROUTES.THREAT_FEEDS]: 'Threat Feeds',
  [PROTECTED_ROUTES.RISK_ASSESSMENT]: 'Risk Assessment',
  [PROTECTED_ROUTES.COLLABORATION]: 'Collaboration',
  [PROTECTED_ROUTES.REPORTING]: 'Reporting',
  [PROTECTED_ROUTES.MALWARE_ANALYSIS]: 'Malware Analysis',
  [PROTECTED_ROUTES.DARK_WEB]: 'Dark Web',
  [PROTECTED_ROUTES.COMPLIANCE]: 'Compliance',
  [PROTECTED_ROUTES.AUTOMATION]: 'Automation',
  [PROTECTED_ROUTES.SETTINGS]: 'Settings',
  [PROTECTED_ROUTES.ADMIN]: 'Administration',
};
