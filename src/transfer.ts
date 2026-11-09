import fs from 'fs';
import yaml from 'js-yaml';

export interface Payment {
  accountId: string;
  beneficiaryId: string;
  amount: string;
  reference: string;
  dayOfMonth?: number;
}

export interface TransferResult {
  index: number;
  amount: string;
  reference: string;
  status: 'transferred' | 'skipped' | 'dry-run';
  paymentReferenceNumber?: string;
  bankStatus?: string;
}

interface Credentials {
  clientId: string;
  clientSecret: string;
  apiKey: string;
}

// Payment dates are decided in South African time, since that is where the account lives.
const TIME_ZONE = 'Africa/Johannesburg';

/**
 * Reads the payments YAML file and validates every payment before anything is sent.
 * Accepts either a `payments:` list or a single payment at the top level.
 * `defaultAccountId` is used for payments that don't name their own `accountId`.
 */
export function loadPayments(paymentsFile: string, defaultAccountId = ''): Payment[] {
  if (!fs.existsSync(paymentsFile)) {
    throw new Error(`Payments file "${paymentsFile}" does not exist.`);
  }
  const config = yaml.load(fs.readFileSync(paymentsFile, 'utf8'));
  if (!config || typeof config !== 'object') {
    throw new Error(`Payments file "${paymentsFile}" is empty or not a YAML object.`);
  }

  const raw = config as Record<string, unknown>;
  const entries: unknown[] = 'payments' in raw ? (raw.payments as unknown[]) : [raw];
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('`payments` must be a non-empty list.');
  }

  const errors: string[] = [];
  const payments = entries.map((entry, i) => validatePayment(entry, i + 1, defaultAccountId, errors));
  if (errors.length > 0) {
    throw new Error(`Invalid payments file, nothing was transferred:\n  - ${errors.join('\n  - ')}`);
  }
  return payments as Payment[];
}

function validatePayment(
  entry: unknown,
  n: number,
  defaultAccountId: string,
  errors: string[]
): Payment | null {
  if (!entry || typeof entry !== 'object') {
    errors.push(`Payment #${n}: must be an object.`);
    return null;
  }
  const p = entry as Record<string, unknown>;
  const startErrors = errors.length;

  const accountId = asText(p.accountId) || defaultAccountId;
  if (!accountId) {
    errors.push(`Payment #${n}: \`accountId\` is missing and no \`accountId\` input was given.`);
  }

  const beneficiaryId = asText(p.beneficiaryId);
  if (!beneficiaryId) errors.push(`Payment #${n}: \`beneficiaryId\` is required.`);

  const reference = asText(p.reference);
  if (!reference) errors.push(`Payment #${n}: \`reference\` is required.`);

  const amountText = asText(p.amount);
  if (!/^\d+(\.\d{1,2})?$/.test(amountText) || Number(amountText) <= 0) {
    errors.push(`Payment #${n}: \`amount\` must be a positive number with at most 2 decimals (got "${amountText}").`);
  }

  let dayOfMonth: number | undefined;
  if (p.dayOfMonth !== undefined && p.dayOfMonth !== null) {
    dayOfMonth = Number(p.dayOfMonth);
    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      errors.push(`Payment #${n}: \`dayOfMonth\` must be a whole number from 1 to 31.`);
    }
  }

  if (errors.length > startErrors) return null;
  return { accountId, beneficiaryId, amount: amountText, reference, dayOfMonth };
}

function asText(value: unknown): string {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

/**
 * True when the payment should run on `today`. A payment without `dayOfMonth` always runs.
 * A `dayOfMonth` past the end of a short month (e.g. 31 in April) runs on the month's last day.
 */
export function isDue(payment: Payment, today: Date = new Date()): boolean {
  if (payment.dayOfMonth === undefined) return true;
  const parts = new Intl.DateTimeFormat('en-ZA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(today);
  const get = (type: string) => Number(parts.find((x) => x.type === type)?.value);
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day === Math.min(payment.dayOfMonth, lastDay);
}

/**
 * Sends the payments that are due today. Stops at the first failure and reports what
 * already went through, so a failed run is never blindly re-run into duplicate transfers.
 */
export async function transferFunds(
  credentials: Credentials,
  payments: Payment[],
  options: { dryRun: boolean; today?: Date; log?: (msg: string) => void }
): Promise<TransferResult[]> {
  const log = options.log ?? console.log;
  const results: TransferResult[] = [];
  const due = payments.map((p) => isDue(p, options.today));

  if (!due.some(Boolean)) {
    log('No payments are due today.');
  }

  let api: { transferMultiple: Function } | null = null;
  if (!options.dryRun && due.some(Boolean)) {
    const { InvestecPbApi } = await import('investec-pb-api');
    const client = new InvestecPbApi(credentials.clientId, credentials.clientSecret, credentials.apiKey);
    await client.getAccessToken();
    api = client;
  }

  for (const [i, payment] of payments.entries()) {
    const n = i + 1;
    const base = { index: n, amount: payment.amount, reference: payment.reference };

    if (!due[i]) {
      log(`Payment #${n}: skipped, due on day ${payment.dayOfMonth}.`);
      results.push({ ...base, status: 'skipped' });
      continue;
    }

    if (options.dryRun) {
      log(`Payment #${n}: dry run, would transfer ${payment.amount} (ref "${payment.reference}").`);
      results.push({ ...base, status: 'dry-run' });
      continue;
    }

    try {
      const response = await api!.transferMultiple(payment.accountId, {
        beneficiaryAccountId: payment.beneficiaryId,
        amount: payment.amount,
        myReference: payment.reference,
        theirReference: payment.reference,
      });
      const transfer = response?.data?.TransferResponses?.[0];
      if (!transfer?.PaymentReferenceNumber) {
        throw new Error('the bank returned no payment reference number');
      }
      log(`Payment #${n}: transferred ${payment.amount}, reference ${transfer.PaymentReferenceNumber}, status ${transfer.Status}.`);
      results.push({
        ...base,
        status: 'transferred',
        paymentReferenceNumber: transfer.PaymentReferenceNumber,
        bankStatus: transfer.Status,
      });
    } catch (error) {
      const done = results.filter((r) => r.status === 'transferred').map((r) => `#${r.index}`);
      const message = error instanceof Error ? error.message : String(error);
      const err = new Error(
        `Payment #${n} failed: ${message}. ` +
          `Already transferred: ${done.length ? done.join(', ') : 'none'}. ` +
          `Not attempted: ${payments.length - n} payment(s). Check the account before re-running.`
      );
      (err as Error & { results?: TransferResult[] }).results = results;
      throw err;
    }
  }

  return results;
}
