
import * as core from '@actions/core';
import * as github from '@actions/github';
import fs from 'fs';
import yaml from 'js-yaml';
import InvestecPbApi from 'investec-pb-api';

async function main() {
  try {
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
    
    const clientId = core.getInput('clientId', { required: true });
    const clientSecret = core.getInput('clientSecret', { required: true });
    const apiKey = core.getInput('apiKey', { required: true });
    const accountId = core.getInput('accountId', { required: true });
    const paymentsFile = core.getInput('payments-file', { required: true });
    const payments = displayPayment(paymentsFile);

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

async function displayPayment(paymentsFile) {
  try {
    // Accept a YAML config file input
    const configFile = paymentsFile;
    console.log(`file: ${configFile}!`);
    let config = null;
    if (configFile) {
      const fileContents = fs.readFileSync(configFile, 'utf8');
      config = yaml.load(fileContents);
      // Support an array of payments
      const payments = Array.isArray(config.payments) ? config.payments : [config];
      payments.forEach((payment, idx) => {
        const { dayOfMonth, accountId, amount, beneficiaryId, reference } = payment;
        console.log(`Payment #${idx + 1}`);
        console.log(`  Day of Month: ${dayOfMonth}`);
        console.log(`  Account ID: ${accountId}`);
        console.log(`  Amount: ${amount}`);
        console.log(`  Beneficiary ID: ${beneficiaryId}`);
        console.log(`  Reference: ${reference}`);
      });
      // Optionally, set outputs for the first payment
      if (payments.length > 0) {
        const { dayOfMonth, accountId, amount, beneficiaryId, reference } = payments[0];
        core.setOutput('day-of-month', dayOfMonth);
        core.setOutput('account-id', accountId);
        core.setOutput('amount', amount);
        core.setOutput('beneficiary-id', beneficiaryId);
        core.setOutput('reference', reference);
      }
      return payments;
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function transferFunds(clientId, clientSecret, apiKey, accountId, payments) {
  try {
    const investecApi = new InvestecPbApi({
      clientId,
      clientSecret,
      apiKey,
    });

    // Process each payment
    const transactionIds = [];
    for (const payment of payments) {
      const response = await investecApi.transferMultiple(accountId,{
        beneficiaryAccountId: payment.beneficiaryId,
        amount: payment.amount,
        myReference: payment.reference,
        theirReference: payment.reference,
      });
      transactionIds.push(response.transactionId);
    }

    return transactionIds;
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function old() {
  let transfers;
    try {
      transfers = JSON.parse(transfersInput);
    } catch (e) {
      throw new Error('Invalid JSON for transfers input');
    }
    if (!Array.isArray(transfers)) {
      throw new Error('Transfers input must be a JSON array');
    }

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
}