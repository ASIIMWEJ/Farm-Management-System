import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SessionProvider } from 'next-auth/react';
import '@/styles/globals.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1f6b4f',
      dark: '#124635',
      light: '#dcefe5',
    },
    secondary: {
      main: '#c96a23',
    },
    success: {
      main: '#43A047',
    },
    warning: {
      main: '#FB8C00',
    },
    error: {
      main: '#E53935',
    },
    background: {
      default: '#f4f7f2',
    },
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 700,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '14px',
          boxShadow: '0 3px 12px rgba(20, 50, 38, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '14px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();
  const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(router.pathname);
  const [authChecked, setAuthChecked] = useState(isPublicRoute);

  useEffect(() => {
    if (!isPublicRoute && !localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    setAuthChecked(true);
  }, [router, isPublicRoute]);

  // Never render protected page content until the auth check has passed,
  // otherwise navigating straight to a URL briefly bypasses the login screen.
  if (!authChecked) {
    return null;
  }

  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
}
