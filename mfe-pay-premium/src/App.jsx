import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { getPolicies, getPolicyById, addPayment, eventBus } from 'shared-storage';
import PaymentForm from './PaymentForm';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Payment from '@mui/icons-material/Payment';
import ArrowBack from '@mui/icons-material/ArrowBack';

export default function PayPremiumApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const policyId = location.state?.policyId;
  let policies = [];
  try {
    policies = getPolicies() || [];
  } catch (e) {
    console.warn('PayPremium: shared-storage not ready', e);
  }
  if (!Array.isArray(policies)) policies = [];
  const payablePolicies = policies.filter((p) => p.status === 'active');
  const selectedPolicy = policyId ? (getPolicyById && getPolicyById(policyId)) : null;
  const defaultId = (selectedPolicy?.status === 'active' ? policyId : null) || (payablePolicies[0]?.id ?? policies[0]?.id ?? '');
  const [policySelect, setPolicySelect] = useState(defaultId);
  const policy = getPolicyById(policySelect) || selectedPolicy;
  const canPaySelected = policy?.status === 'active';
  const [paid, setPaid] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  const handlePaymentSuccess = (payment) => {
    const saved = addPayment(payment);
    setPaymentId(saved.id);
    setPaid(true);
    eventBus.publish('payment-complete', { policyId: payment.policyId, amount: payment.amount });
  };

  if (paid) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            px: 3,
            borderRadius: 3,
            bgcolor: 'success.dark',
            border: '1px solid',
            borderColor: 'success.main',
          }}
        >
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight={700}>
            Payment successful
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Your premium has been recorded.
          </Typography>
          <Typography variant="body2" fontFamily="monospace" sx={{ mb: 3 }}>
            Payment ID: <strong>{paymentId}</strong>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Payment />}
              onClick={() => { setPaid(false); setPaymentId(null); }}
            >
              Pay another
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{ borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Back to policies
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Pay Premium
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a policy and complete the payment (demo – no real charge).
        </Typography>
      </Box>
      {policies.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No policies found. Add demo data from the Policy Details view.
        </Typography>
      ) : (
        <>
          {policies.length > 1 && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="policy-select-label">Policy</InputLabel>
              <Select
                labelId="policy-select-label"
                id="policy-select"
                value={policySelect}
                label="Policy"
                onChange={(e) => setPolicySelect(e.target.value)}
              >
                {policies.map((p) => (
                  <MenuItem key={p.id} value={p.id} disabled={p.status !== 'active'}>
                    {p.id} – {p.type} (₹{p.premium?.toLocaleString()})
                    {p.status !== 'active' ? ` – ${p.status.replace(/_/g, ' ')}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {policy && canPaySelected && (
            <PaymentForm policy={policy} onSuccess={handlePaymentSuccess} />
          )}
          {policy && !canPaySelected && (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              This policy ({policy.status.replace(/_/g, ' ')}) cannot accept payments. Select an active policy to pay.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
