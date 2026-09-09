import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Pets as AnimalsIcon,
  LocalDrink as DairyIcon,
  Favorite as HealthIcon,
  AttachMoney as FinanceIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  EventNote as BreedingIcon,
  Checklist as TasksIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { DashboardStats } from '@/types';
import BackButton from '@/components/BackButton';
import FarmBackground from '@/components/FarmBackground';

const DRAWER_WIDTH = 240;

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
  { label: 'Animals', icon: <AnimalsIcon />, href: '/animals' },
  { label: 'Dairy Management', icon: <DairyIcon />, href: '/dairy' },
  { label: 'Health Records', icon: <HealthIcon />, href: '/health' },
  { label: 'Finance', icon: <FinanceIcon />, href: '/finance' },
  { label: 'Inventory', icon: <InventoryIcon />, href: '/inventory' },
  { label: 'Breeding', icon: <BreedingIcon />, href: '/breeding' },
  { label: 'Farm Tasks', icon: <TasksIcon />, href: '/tasks' },
  { label: 'User Management', icon: <PeopleIcon />, href: '/users' },
];

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token) {
          router.push('/login');
          return;
        }

        if (user) {
          const userData = JSON.parse(user);
          setUserEmail(userData.email);

          if (!userData.farmId) {
            router.push('/login');
            return;
          }

          const response = await fetch(`/api/dashboard/stats?farmId=${encodeURIComponent(userData.farmId)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            setStats(data.data);
          }
          return;
        }

        router.push('/login');
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
        <FarmBackground />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', position: 'relative', minHeight: '100vh' }}>
      <FarmBackground />
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1300,
          background: 'linear-gradient(90deg, #124635 0%, #1f6b4f 100%)',
        }}
      >
        <Toolbar>
          <BackButton fallback="/" />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🌾 Farm Management Information System
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {userEmail}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            mt: '64px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(6px)',
            borderRight: '1px solid rgba(31, 107, 79, 0.12)',
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <ListItem
                button
                component="a"
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: '10px',
                  '&:hover': { backgroundColor: 'rgba(31, 107, 79, 0.08)' },
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          position: 'relative',
          zIndex: 1,
          flexGrow: 1,
          p: 3,
          ml: DRAWER_WIDTH,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              mb: 3,
              p: 3,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(31,107,79,0.95) 0%, rgba(18,70,53,0.95) 100%)',
              color: '#fff',
            }}
          >
            <Typography variant="h4" gutterBottom>
              Welcome back 👋
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>
              Here&apos;s what&apos;s happening on your farm today.
            </Typography>
          </Box>

          {stats && (
            <Grid container spacing={3}>
              {/* Stats Cards */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '5px solid #1f6b4f' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      🐄 Total Animals
                    </Typography>
                    <Typography variant="h5">
                      {stats.totalAnimals}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '5px solid #4fa8ff' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      🥛 Daily Milk Production
                    </Typography>
                    <Typography variant="h5">
                      {stats.dailyMilkProduction} L
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '5px solid #c96a23' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      💰 Monthly Revenue
                    </Typography>
                    <Typography variant="h5">
                      ${stats.monthlyRevenue.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '5px solid #8a4a3a' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      👩‍🌾 Active Employees
                    </Typography>
                    <Typography variant="h5">
                      {stats.activeEmployees}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Actions */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Link href="/animals">
                        <Button variant="contained" color="primary">
                          Register Animal
                        </Button>
                      </Link>
                      <Link href="/dairy">
                        <Button variant="contained" color="primary">
                          Record Milk Production
                        </Button>
                      </Link>
                      <Link href="/health">
                        <Button variant="contained" color="primary">
                          Record Health Issue
                        </Button>
                      </Link>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
}
