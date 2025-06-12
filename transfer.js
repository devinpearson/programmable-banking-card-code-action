import fs from 'fs';
import yaml from 'js-yaml';
import {InvestecPbApi} from 'investec-pb-api';

export async function displayPayment(paymentsFile) {
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
        console.log(`Payment #${idx + 1}`);
        console.log(`  Day of Month: ${payment.dayOfMonth}`);
        console.log(`  Account ID: ${payment.accountId}`);
        console.log(`  Amount: ${payment.amount}`);
        console.log(`  Beneficiary ID: ${payment.beneficiaryId}`);
        console.log(`  Reference: ${payment.reference}`);
      });
      // Optionally, set outputs for the first payment
      // if (payments.length > 0) {
      //   const { dayOfMonth, accountId, amount, beneficiaryId, reference } = payments[0];
      //   core.setOutput('day-of-month', dayOfMonth);
      //   core.setOutput('account-id', accountId);
      //   core.setOutput('amount', amount);
      //   core.setOutput('beneficiary-id', beneficiaryId);
      //   core.setOutput('reference', reference);
      // }
      return payments;
    }
}

export async function transferFunds(clientId, clientSecret, apiKey, accountId, payments) {
    const investecApi = new InvestecPbApi({
      clientId,
      clientSecret,
      apiKey,
    });
    const accessResponse = await investecApi.getAccessToken();
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
}