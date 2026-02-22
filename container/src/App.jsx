import React, { Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import RemoteErrorBoundary from './RemoteErrorBoundary';

const PolicyDetailsMFE = lazy(() => import('policyDetails/PolicyDetailsApp'));
const PayPremiumMFE = lazy(() => import('payPremium/PayPremiumApp'));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isPolicies = location.pathname === '/';
  const isPayPremium = location.pathname === '/pay-premium';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar disableGutters sx={{ px: { xs: 2, sm: 3 }, py: 1 }}>
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              cursor: 'pointer',
              '&:hover': { opacity: 0.9 },
            }}
          >
            <ShieldOutlined sx={{ mr: 1.5, fontSize: 28, color: 'primary.main' }} />
            <Typography
              variant="h6"
              component="span"
              sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              Insurance Platform
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/')}
              sx={{
                bgcolor: isPolicies ? 'rgba(0, 212, 170, 0.15)' : 'transparent',
                color: isPolicies ? 'primary.light' : 'text.secondary',
                '&:hover': { bgcolor: isPolicies ? 'rgba(0, 212, 170, 0.2)' : 'rgba(255,255,255,0.08)' },
              }}
            >
              My Policies
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/pay-premium')}
              sx={{
                bgcolor: isPayPremium ? 'rgba(0, 212, 170, 0.15)' : 'transparent',
                color: isPayPremium ? 'primary.light' : 'text.secondary',
                '&:hover': { bgcolor: isPayPremium ? 'rgba(0, 212, 170, 0.2)' : 'rgba(255,255,255,0.08)' },
              }}
            >
              Pay Premium
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, py: 3, px: 2 }}>
        <Container maxWidth="lg">
          <RemoteErrorBoundary>
            <Suspense fallback={
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography color="text.secondary">Loading...</Typography>
              </Box>
            }>
              <Routes>
                <Route path="/" element={<PolicyDetailsMFE />} />
                <Route path="/pay-premium" element={<PayPremiumMFE />} />
              </Routes>
            </Suspense>
          </RemoteErrorBoundary>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
