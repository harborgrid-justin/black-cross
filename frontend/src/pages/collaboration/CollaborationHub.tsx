import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  Assignment as TaskIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: string;
  priority: string;
  dueDate: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: string;
  avatar: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export default function CollaborationHub() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const [stats] = useState({
    activeProjects: 8,
    teamMembers: 24,
    openTasks: 45,
    unreadMessages: 12,
  });

  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Investigate phishing campaign',
      assignee: 'John Doe',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      id: '2',
      title: 'Update threat intelligence feeds',
      assignee: 'Jane Smith',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 172800000).toISOString(),
    },
    {
      id: '3',
      title: 'Review incident response playbook',
      assignee: 'Bob Johnson',
      status: 'completed',
      priority: 'low',
      dueDate: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '4',
      title: 'Patch critical vulnerabilities',
      assignee: 'Alice Williams',
      status: 'in-progress',
      priority: 'critical',
      dueDate: new Date(Date.now() + 43200000).toISOString(),
    },
  ]);

  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'John Doe', role: 'Senior Analyst', status: 'online', avatar: 'JD' },
    { id: '2', name: 'Jane Smith', role: 'Threat Researcher', status: 'online', avatar: 'JS' },
    { id: '3', name: 'Bob Johnson', role: 'Incident Manager', status: 'away', avatar: 'BJ' },
    { id: '4', name: 'Alice Williams', role: 'Security Engineer', status: 'offline', avatar: 'AW' },
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: '1',
      user: 'John Doe',
      action: 'commented on',
      target: 'INC-2024-001',
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: '2',
      user: 'Jane Smith',
      action: 'completed task',
      target: 'Update IoC database',
      timestamp: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: '3',
      user: 'Bob Johnson',
      action: 'created incident',
      target: 'INC-2024-015',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: '4',
      user: 'Alice Williams',
      action: 'uploaded document',
      target: 'Q4 Threat Report',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [chatMessages] = useState([
    { id: '1', user: 'John Doe', message: 'We need to investigate the recent DDoS attack', timestamp: '10:23 AM' },
    { id: '2', user: 'Jane Smith', message: 'I can help with the analysis', timestamp: '10:25 AM' },
    { id: '3', user: 'Bob Johnson', message: 'Let\'s schedule a meeting at 2 PM', timestamp: '10:28 AM' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Error fetching collaboration data:', err);
        setError('Failed to load collaboration data. Showing mock data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getMemberStatusColor = (status: string): 'success' | 'warning' | 'default' => {
    switch (status) {
      case 'online':
        return 'success';
      case 'away':
        return 'warning';
      case 'offline':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Collaboration Hub
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Project
        </Button>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Projects
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stats.activeProjects}
                  </Typography>
                </Box>
                <TaskIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Team Members
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stats.teamMembers}
                  </Typography>
                </Box>
                <GroupIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Open Tasks
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stats.openTasks}
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Unread Messages
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }} data-testid="notifications">
                    {stats.unreadMessages}
                  </Typography>
                </Box>
                <ChatIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Tasks Panel */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tasks
              </Typography>
              <Button size="small" startIcon={<AddIcon />}>
                New Task
              </Button>
            </Box>
            <List>
              {tasks.map((task) => (
                <ListItem
                  key={task.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {task.status === 'completed' && <CheckCircleIcon color="success" fontSize="small" />}
                        <Typography variant="body1">{task.title}</Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                        />
                        <Chip
                          label={task.status}
                          size="small"
                          variant="outlined"
                          color={getStatusColor(task.status)}
                        />
                        <Chip label={task.assignee} size="small" variant="outlined" />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Team Members & Activity */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Team Members */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Team Members
            </Typography>
            <List data-testid="team-members">
              {teamMembers.map((member) => (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{member.avatar}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={member.role}
                  />
                  <Chip
                    label={member.status}
                    size="small"
                    color={getMemberStatusColor(member.status)}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Activity
            </Typography>
            <List data-testid="activity-feed">
              {activities.map((activity, index) => (
                <Box key={activity.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          <strong>{activity.user}</strong> {activity.action}{' '}
                          <strong>{activity.target}</strong>
                        </Typography>
                      }
                      secondary={formatTimestamp(activity.timestamp)}
                    />
                  </ListItem>
                  {index < activities.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Team Chat */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Team Chat
            </Typography>
            <Box sx={{ height: 300, overflowY: 'auto', mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              {chatMessages.map((msg) => (
                <Box key={msg.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {msg.user}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {msg.timestamp}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{msg.message}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                data-testid="message-input"
              />
              <IconButton color="primary">
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
