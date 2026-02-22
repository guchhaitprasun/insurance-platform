import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import PaymentOutlined from '@mui/icons-material/PaymentOutlined';
import CheckCircle from '@mui/icons-material/CheckCircle';
import HealthAndSafety from '@mui/icons-material/HealthAndSafety';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Favorite from '@mui/icons-material/Favorite';

const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const typeIcons = {
  Health: HealthAndSafety,
  Auto: DirectionsCar,
  Life: Favorite,
};

export default function PolicyCard({ policy, recentlyPaid }) {
  const navigate = useNavigate();
  const Icon = typeIcons[policy.type] || HealthAndSafety;

  const handlePayClick = (e) => {
    e.preventDefault();
    navigate('/pay-premium', { state: { policyId: policy.id } });
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...(recentlyPaid && {
          borderColor: 'success.main',
          border: '2px solid',
          boxShadow: '0 0 24px rgba(0, 230, 118, 0.15)',
        }),
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          '&:last-child': { pb: 2 },
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ color: 'primary.main', fontSize: 24 }} />
                <Typography variant="h6" component="span" fontWeight={600}>
                  {policy.type}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Chip
                  label={policy.status}
                  size="small"
                  color="success"
                  sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                />
                {recentlyPaid && (
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: 16 }} />}
                    label="Recently paid"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>
            </Box>
            <Typography variant="body2" color="text.secondary" fontFamily="monospace">
              {policy.id}
            </Typography>
            <Box sx={{ pt: 0.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Premium</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatCurrency(policy.premium)}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    / {policy.frequency}
                  </Typography>
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Due date</Typography>
                <Typography variant="body2" fontWeight={500}>{formatDate(policy.dueDate)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography variant="body2" color="text.secondary">Sum assured</Typography>
                <Typography variant="body2" fontWeight={600} color="primary.light">{formatCurrency(policy.sumAssured)}</Typography>
              </Stack>
              {policy.vehicleNumber && (
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Vehicle</Typography>
                  <Typography variant="body2" fontFamily="monospace">{policy.vehicleNumber}</Typography>
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
        <Button
          component={Link}
          to="/pay-premium"
          state={{ policyId: policy.id }}
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<PaymentOutlined />}
          onClick={handlePayClick}
          sx={{ mt: 2, flexShrink: 0 }}
        >
          Pay premium
        </Button>
      </CardContent>
    </Card>
  );
}
