/**
 * Web Worker: validates and prepares payment payload off the main thread.
 * Ensures amount is valid and adds a validatedAt timestamp.
 */
self.onmessage = function (e) {
  const { policyId, amount, method } = e.data || {};
  const errors = [];

  if (!policyId || typeof policyId !== 'string') {
    errors.push('Invalid policyId');
  }
  if (typeof amount !== 'number' || amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  const validMethods = ['card', 'upi', 'netbanking'];
  if (!validMethods.includes(method)) {
    errors.push('Invalid payment method');
  }

  if (errors.length > 0) {
    self.postMessage({ ok: false, errors });
    return;
  }

  const validated = {
    policyId,
    amount: Math.round(amount * 100) / 100,
    method,
    validatedAt: new Date().toISOString(),
  };
  self.postMessage({ ok: true, payload: validated });
};
