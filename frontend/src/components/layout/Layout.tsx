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
  AccountCircle,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Threat Intelligence', icon: <ThreatIcon />, path: '/threats' },
  { text: 'Incidents', icon: <IncidentIcon />, path: '/incidents' },
  { text: 'Threat Hunting', icon: <HuntingIcon />, path: '/hunting' },
  { text: 'Vulnerabilities', icon: <VulnerabilityIcon />, path: '/vulnerabilities' },
  { text: 'Risk Assessment', icon: <RiskIcon />, path: '/risk' },
  { text: 'Threat Actors', icon: <ActorIcon />, path: '/actors' },
  { text: 'IoC Management', icon: <IoCIcon />, path: '/iocs' },
  { text: 'Threat Feeds', icon: <FeedIcon />, path: '/feeds' },
  { text: 'Malware Analysis', icon: <MalwareIcon />, path: '/malware' },
  { text: 'Dark Web', icon: <DarkWebIcon />, path: '/darkweb' },
  { text: 'Compliance', icon: <ComplianceIcon />, path: '/compliance' },
  { text: 'Automation', icon: <AutomationIcon />, path: '/automation' },
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
    <Box>
      <Toolbar sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          BLACK-CROSS
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
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
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Cyber Threat Intelligence Platform
          </Typography>
          <IconButton onClick={handleMenuOpen} color="inherit">
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              <Typography variant="body2">
                {user?.name || user?.email || 'User'}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
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
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
