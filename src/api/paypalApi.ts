import { apiFetch } from './apiClient';

export interface PayPalCreateOrderResult {
  success: boolean;
  orderId: string;
  approveUrl: string;
  sandboxMode: boolean;
}

export interface PayPalCaptureResult {
  success: boolean;
  gateway: 'PAYPAL';
  gatewayStatus: 'APPROVED' | 'DECLINED';
  appStatus: 'PAID' | 'FAILED';
  transactionId: string;
  message: string;
  payment: Record<string, any>;
}

export async function createPayPalOrder(payload: {
  paymentId: string;
  amount: number;
  currency: string;
  flow?: 'redirect' | 'card';
}): Promise<PayPalCreateOrderResult> {
  const response = await apiFetch('/payments/paypal_create_order.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let data: any = null;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`PayPal order response parsing failed: ${raw.slice(0, 180)}`);
  }

  if (!response.ok || !data?.success) {
    const message = [data?.error, data?.details].filter(Boolean).join(': ');
    throw new Error(message || 'Failed to create PayPal order');
  }

  return data as PayPalCreateOrderResult;
}

export async function capturePayPalOrder(payload: {
  orderId: string;
  paymentId: string;
}): Promise<PayPalCaptureResult> {
  const response = await apiFetch('/payments/paypal_capture_order.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let data: any = null;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`PayPal capture response parsing failed: ${raw.slice(0, 180)}`);
  }

  if (!response.ok || !data?.success) {
    const message = [data?.error, data?.details].filter(Boolean).join(': ');
    throw new Error(message || 'Failed to capture PayPal order');
  }

  return data as PayPalCaptureResult;
}
