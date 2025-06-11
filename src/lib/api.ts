// API utility functions for authenticated requests

export interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

export async function fetchWithAuth(url: string, options: FetchOptions = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

// Specific function for voucher API calls
export async function fetchUserVouchers(orderTotal: number = 0) {
  const response = await fetchWithAuth(`/api/vouchers?userVouchers=true&total=${orderTotal}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch vouchers');
  }
  
  return response.json();
}

// Function to validate voucher
export async function validateVoucher(voucherCode: string, orderTotal: number) {
  const response = await fetchWithAuth('/api/vouchers/validate', {
    method: 'POST',
    body: JSON.stringify({ code: voucherCode, orderTotal }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to validate voucher');
  }
  
  return response.json();
}
