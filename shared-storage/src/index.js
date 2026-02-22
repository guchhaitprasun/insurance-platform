const STORAGE_KEY = 'insurance_platform_data';

const defaultData = {
  user: {
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
  },
  policies: [
    {
      id: 'POL-2024-001',
      type: 'Health',
      status: 'active',
      premium: 4500,
      frequency: 'annual',
      dueDate: '2025-03-15',
      startDate: '2024-03-15',
      endDate: '2025-03-14',
      sumAssured: 500000,
    },
    {
      id: 'POL-2024-002',
      type: 'Auto',
      status: 'active',
      premium: 12000,
      frequency: 'annual',
      dueDate: '2025-01-20',
      startDate: '2024-01-20',
      endDate: '2025-01-19',
      sumAssured: 1000000,
      vehicleNumber: 'KA-01-AB-1234',
    },
    {
      id: 'POL-2024-003',
      type: 'Life',
      status: 'active',
      premium: 8500,
      frequency: 'annual',
      dueDate: '2025-06-01',
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      sumAssured: 2000000,
    },
  ],
  payments: [],
};

function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('shared-storage: getData failed', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return { ...defaultData };
}

function setData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('shared-storage: setData failed', e);
    return false;
  }
}

export function getUser() {
  return getData().user;
}

export function getPolicies() {
  return getData().policies;
}

export function getPolicyById(id) {
  return getPolicies().find((p) => p.id === id) || null;
}

export function getPayments() {
  return getData().payments;
}

export function addPayment(payment) {
  const data = getData();
  const newPayment = {
    id: `pay-${Date.now()}`,
    ...payment,
    createdAt: new Date().toISOString(),
  };
  data.payments.push(newPayment);
  setData(data);
  return newPayment;
}

export function resetToDemo() {
  setData({ ...defaultData });
}

export function initStorage() {
  getData();
}

// Cross-MFE communication: event bus (CustomEvents)
const PREFIX = 'insurance:';

export const eventBus = {
  subscribe(event, handler) {
    const name = event.startsWith(PREFIX) ? event : PREFIX + event;
    const wrapper = (e) => handler(e.detail);
    window.addEventListener(name, wrapper);
    return () => window.removeEventListener(name, wrapper);
  },
  publish(event, detail = {}) {
    const name = event.startsWith(PREFIX) ? event : PREFIX + event;
    window.dispatchEvent(new CustomEvent(name, { detail }));
  },
};
