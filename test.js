import { displayPayment, transferFunds } from './src/transfer.js';
async function main() {
  try {
    // Simulate the GitHub context payload
    const payload = JSON.stringify({ event: 'push', repository: { name: 'example-repo' } }, undefined, 2);
    const clientId = '';
    const clientSecret = '';
    const apiKey = '';
    const accountId = '';
    const paymentsFile = 'example-config.yml';
    const payments = await displayPayment(paymentsFile);
    console.log(payments);
    const transactionIds = await transferFunds(clientId, clientSecret, apiKey, accountId, payments);
    console.log(`Transaction IDs: ${JSON.stringify(transactionIds)}`);
    //core.setOutput('transactionIds', JSON.stringify(transactionIds));
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}
// Only run if this file is executed directly (not imported)
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}