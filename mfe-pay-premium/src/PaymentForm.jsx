import React, { useState, useRef, useCallback } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import CreditCard from '@mui/icons-material/CreditCard';
import AccountBalance from '@mui/icons-material/AccountBalance';
import PhoneAndroid from '@mui/icons-material/PhoneAndroid';

const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

function validatePaymentOnMainThread({ policyId, amount, method }) {
  const errors = [];
  if (!policyId || typeof policyId !== 'string') errors.push('Invalid policyId');
  if (typeof amount !== 'number' || amount <= 0) errors.push('Amount must be a positive number');
  if (!['card', 'upi', 'netbanking'].includes(method)) errors.push('Invalid payment method');
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    payload: {
      policyId,
      amount: Math.round(amount * 100) / 100,
      method,
      validatedAt: new Date().toISOString(),
    },
  };
}

function usePaymentWorker() {
  const workerRef = useRef(undefined);
  if (workerRef.current === undefined) {
    try {
      const workerUrl = new URL('./payment.worker.js', import.meta.url);
      if (workerUrl.origin === window.location.origin) {
        workerRef.current = new Worker(workerUrl);
      } else {
        workerRef.current = null;
      }
    } catch {
      workerRef.current = null;
    }
  }
  return workerRef.current;
}

const methodOptions = [
  { value: 'card', label: 'Card', Icon: CreditCard },
  { value: 'upi', label: 'UPI', Icon: PhoneAndroid },
  { value: 'netbanking', label: 'Net banking', Icon: AccountBalance },
];

export default function PaymentForm({ policy, onSuccess }) {
  const [method, setMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const worker = usePaymentWorker();

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = { policyId: policy.id, amount: policy.premium, method };

    if (worker) {
      const onMessage = (ev) => {
        const { ok, payload: p, errors } = ev.data || {};
        worker.removeEventListener('message', onMessage);
        setSubmitting(false);
        if (ok && p) {
          onSuccess({ ...p, status: 'completed' });
        } else {
          setError(errors?.length ? errors.join(', ') : 'Validation failed');
        }
      };
      worker.addEventListener('message', onMessage);
      worker.postMessage(payload);
    } else {
      const result = validatePaymentOnMainThread(payload);
      setSubmitting(false);
      if (result.ok && result.payload) {
        onSuccess({ ...result.payload, status: 'completed' });
      } else {
        setError(result.errors?.length ? result.errors.join(', ') : 'Validation failed');
      }
    }
  }, [policy, method, worker, onSuccess]);

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Policy</Typography>
          <Typography variant="body2" fontWeight={600}>{policy.id} – {policy.type}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="body1" color="text.secondary">Amount due</Typography>
          <Typography variant="h6" color="primary.light" fontWeight={700}>
            {formatCurrency(policy.premium)}
          </Typography>
        </Box>
      </Box>
      <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
        <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>Payment method</FormLabel>
        <RadioGroup
          row
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          sx={{ gap: 1 }}
        >
          {methodOptions.map(({ value, label, Icon }) => (
            <FormControlLabel
              key={value}
              value={value}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Icon sx={{ fontSize: 20 }} />
                  {label}
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        disabled={submitting}
        sx={{ py: 1.5, fontWeight: 700 }}
      >
        {submitting ? 'Validating…' : `Pay ${formatCurrency(policy.premium)}`}
      </Button>
    </Paper>
  );
}
