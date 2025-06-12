
import * as core from '@actions/core';
import * as github from '@actions/github';
import { displayPayment, transferFunds } from './transfer.js';
async function main() {
  try {
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
    
    const clientId = core.getInput('clientId', { required: true });
    const clientSecret = core.getInput('clientSecret', { required: true });
    const apiKey = core.getInput('apiKey', { required: true });
    const accountId = core.getInput('accountId', { required: true });
    const paymentsFile = core.getInput('payments-file', { required: true });
    const payments = await displayPayment(paymentsFile);

    const transactionIds = await transferFunds(clientId, clientSecret, apiKey, accountId, payments);
    core.setOutput('transactionIds', JSON.stringify(transactionIds));
  } catch (error) {
    core.setFailed(error.message);
  }
}
// Only run if this file is executed directly (not imported)
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}


// async function old() {
//   let transfers;
//     try {
//       transfers = JSON.parse(transfersInput);
//     } catch (e) {
//       throw new Error('Invalid JSON for transfers input');
//     }
//     if (!Array.isArray(transfers)) {
//       throw new Error('Transfers input must be a JSON array');
//     }

    // const api = new InvestecApi({ clientId, clientSecret, apiKey });
    // await api.authenticate();

    // const transactionIds = [];
    // for (const transfer of transfers) {
    //   const { accountBeneficiaryId, amount, reference, date, frequency } = transfer;
    //   if (!accountBeneficiaryId || !amount || !reference || (!date && !frequency)) {
    //     throw new Error('Each transfer must have accountBeneficiaryId, amount, reference, and date or frequency');
    //   }
    //   // If scheduling, use the schedule API, else do immediate transfer
    //   let result;
    //   if (date || frequency) {
    //     // For recurring or scheduled payments, use the scheduleTransfer API if available
    //     result = await api.scheduleTransfer({
    //       fromAccountId: accountId,
    //       toAccountId: accountBeneficiaryId,
    //       amount,
    //       reference,
    //       date,
    //       frequency
    //     });
    //   } else {
    //     // Immediate transfer
    //     result = await api.transfer({
    //       fromAccountId: accountId,
    //       toAccountId: accountBeneficiaryId,
    //       amount,
    //       reference
    //     });
    //   }
    //   if (result && result.transactionId) {
    //     transactionIds.push(result.transactionId);
    //   } else if (result && result.id) {
    //     transactionIds.push(result.id);
    //   } else {
    //     core.warning(`No transactionId returned for transfer to ${accountBeneficiaryId}`);
    //   }
    // }
// }