import fs from 'fs';
import yaml from 'js-yaml';
// import {InvestecPbApi} from 'investec-pb-api';

export async function displayPayment(paymentsFile) {
    // Accept a YAML config file input
    const configFile = paymentsFile;
    console.log(`file: ${configFile}!`);
    interface Payment {
      dayOfMonth: number;
      accountId: string;
      amount: number;
      beneficiaryId: string;
      reference: string;
    }
    interface PaymentsConfig {
      payments?: Payment[];
      dayOfMonth?: number;
      accountId?: string;
      amount?: number;
      beneficiaryId?: string;
      reference?: string;
    }
    let config: PaymentsConfig | null = null;
    if (configFile) {
      const fileContents = fs.readFileSync(configFile, 'utf8');
      config = yaml.load(fileContents) as PaymentsConfig;
      // Support an array of payments
      if (config && typeof config === 'object') {
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
      } else {
        throw new Error('Invalid or empty config file.');
      }
      // Optionally, set outputs for the first payment
      // if (payments.length > 0) {
      //   const { dayOfMonth, accountId, amount, beneficiaryId, reference } = payments[0];
      //   core.setOutput('day-of-month', dayOfMonth);
      //   core.setOutput('account-id', accountId);
      //   core.setOutput('amount', amount);
      //   core.setOutput('beneficiary-id', beneficiaryId);
      //   core.setOutput('reference', reference);
      // }
    }
}

export async function transferFunds(clientId, clientSecret, apiKey, accountId, payments) {
  console.log(clientId, clientSecret, apiKey, accountId, payments);
  const { InvestecPbApi } = await import("investec-pb-api");
    const investecApi = new InvestecPbApi(
      clientId,
      clientSecret,
      apiKey,
    );
    await investecApi.getAccessToken();
    // Process each payment
    const transactionIds: string[] = [];
    for (const payment of payments) {
      const response = await investecApi.transferMultiple(payment.accountId,{
        beneficiaryAccountId: payment.beneficiaryId,
        amount: payment.amount,
        myReference: payment.reference,
        theirReference: payment.reference,
      });
      console.log(`Transfer response: ${JSON.stringify(response)}`);
      transactionIds.push(response.data.TransferResponses[0].PaymentReferenceNumber);
    }

    return transactionIds;
}