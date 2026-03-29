import { apiFetch } from './apiClient';

export interface GatewayProcessResult {
  success: boolean;
  gateway: 'STRIPE' | 'PAYPAL';
  gatewayStatus: 'APPROVED' | 'DECLINED';
  appStatus: 'PAID' | 'FAILED';
  transactionId: string;
  message: string;
  payment: Record<string, any>;
}

export async function processGatewayPayment(payload: {
  gateway: 'STRIPE' | 'PAYPAL';
  paymentId: string;
  amount: number;
  currency: string;
  simulateStatus?: 'AUTO' | 'APPROVED' | 'DECLINED';
  payment?: Record<string, any>;
}): Promise<GatewayProcessResult> {
  const response = await apiFetch('/payments/gateway.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    throw new Error('Gateway response parsing failed');
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.error || 'Gateway processing failed');
  }

  return data as GatewayProcessResult;
}
