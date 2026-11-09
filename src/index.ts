import { fileURLToPath } from 'url';
import * as core from '@actions/core';
import { loadPayments, transferFunds, type TransferResult } from './transfer.js';

export async function run(): Promise<void> {
  try {
    const clientId = core.getInput('clientId', { required: true });
    const clientSecret = core.getInput('clientSecret', { required: true });
    const apiKey = core.getInput('apiKey', { required: true });
    const accountId = core.getInput('accountId');
    const paymentsFile = core.getInput('payments-file', { required: true });
    const dryRun = core.getBooleanInput('dry-run');

    for (const value of [clientId, clientSecret, apiKey, accountId]) {
      if (value) core.setSecret(value);
    }

    const payments = loadPayments(paymentsFile, accountId);
    for (const p of payments) {
      core.setSecret(p.accountId);
      core.setSecret(p.beneficiaryId);
    }
    core.info(`Loaded ${payments.length} payment(s) from ${paymentsFile}.${dryRun ? ' Dry run: no money will move.' : ''}`);

    let results: TransferResult[] = [];
    try {
      results = await transferFunds({ clientId, clientSecret, apiKey }, payments, { dryRun, log: core.info });
    } catch (error) {
      results = (error as { results?: TransferResult[] }).results ?? [];
      throw error;
    } finally {
      core.setOutput('results', JSON.stringify(results));
      core.setOutput(
        'transactionIds',
        JSON.stringify(results.flatMap((r) => (r.paymentReferenceNumber ? [r.paymentReferenceNumber] : [])))
      );
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

// Only run when executed directly (as the action), not when imported by tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
