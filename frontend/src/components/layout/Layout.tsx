/**
 * @fileoverview Layout component. React component for the Black-Cross platform.
 * 
 * @module components/layout/Layout.tsx
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  BugReport as ThreatIcon,
  Report as IncidentIcon,
  Search as HuntingIcon,
  Security as VulnerabilityIcon,
  Assessment as RiskIcon,
  Group as ActorIcon,
  Feed as FeedIcon,
  Flag as IoCIcon,
  Gavel as ComplianceIcon,
  AutoFixHigh as AutomationIcon,
  DarkMode as DarkWebIcon,
  BugReportOutlined as MalwareIcon,
  Shield as SIEMIcon,
  People as CollaborationIcon,
  BarChart as ReportingIcon,
  AccountCircle,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { text: 'Threat Intelligence', icon: ThreatIcon, path: '/threat-intelligence' },
  { text: 'Incidents', icon: IncidentIcon, path: '/incident-response' },
  { text: 'Threat Hunting', icon: HuntingIcon, path: '/threat-hunting' },
  { text: 'Vulnerabilities', icon: VulnerabilityIcon, path: '/vulnerability-management' },
  { text: 'SIEM', icon: SIEMIcon, path: '/siem' },
  { text: 'Threat Actors', icon: ActorIcon, path: '/threat-actors' },
  { text: 'IoC Management', icon: IoCIcon, path: '/ioc-management' },
  { text: 'Threat Feeds', icon: FeedIcon, path: '/threat-feeds' },
  { text: 'Risk Assessment', icon: RiskIcon, path: '/risk-assessment' },
  { text: 'Collaboration', icon: CollaborationIcon, path: '/collaboration' },
  { text: 'Reporting', icon: ReportingIcon, path: '/reporting' },
  { text: 'Malware Analysis', icon: MalwareIcon, path: '/malware-analysis' },
  { text: 'Dark Web', icon: DarkWebIcon, path: '/dark-web' },
  { text: 'Compliance', icon: ComplianceIcon, path: '/compliance' },
  { text: 'Automation', icon: AutomationIcon, path: '/automation' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <Box role="navigation" aria-label="main navigation">
      <Toolbar sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          BLACK-CROSS
        </Typography>
      </Toolbar>
      <Divider />
      <List component="nav" aria-label="main navigation menu">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              aria-label={`Navigate to ${item.text}`}
              role="menuitem"
            >
            <ListItemIcon sx={{ color: 'primary.main' }} aria-hidden="true">
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
        role="banner"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open navigation drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
            data-testid="menu-button"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Cyber Threat Intelligence Platform
          </Typography>
          <IconButton 
            onClick={handleMenuOpen} 
            color="inherit"
            aria-label="user account menu"
            aria-controls="user-menu"
            aria-haspopup="true"
            data-testid="user-menu"
          >
            <Avatar sx={{ width: 32, height: 32 }} alt={user?.name || 'User profile'}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu 
            id="user-menu"
            anchorEl={anchorEl} 
            open={Boolean(anchorEl)} 
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'user-account-button',
              role: 'menu',
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                {user?.name || user?.email || 'User'}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} role="menuitem">Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation drawer"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ 
            keepMounted: true,
            'aria-label': 'mobile navigation drawer',
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
          aria-label="desktop navigation drawer"
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: '#0a1929',
        }}
        role="main"
        aria-label="main content"
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
