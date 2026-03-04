import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { getUser, getPolicies, eventBus } from 'shared-storage';
import PolicyCard from './PolicyCard';

export default function PolicyDetailsApp() {
  let user = { name: 'Guest' };
  let policies = [];
  try {
    user = getUser() || user;
    policies = getPolicies() || [];
  } catch (e) {
    console.warn('PolicyDetails: shared-storage not ready', e);
  }
  if (!Array.isArray(policies)) policies = [];
  const [recentlyPaidPolicyId, setRecentlyPaidPolicyId] = useState(null);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('payment-complete', (detail) => {
      if (detail?.policyId) setRecentlyPaidPolicyId(detail.policyId);
    });
    return unsubscribe;
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          My Insurance Policies
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name ?? 'Guest'}. Here are your active policies.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {policies.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No policies found. Demo data is stored in browser storage.
            </Typography>
          </Grid>
        ) : (
          policies.map((policy) => (
            <Grid item xs={12} sm={6} md={4} key={policy.id}>
              <PolicyCard
                policy={policy}
                recentlyPaid={policy.id === recentlyPaidPolicyId}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
