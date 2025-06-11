import * as core from '@actions/core';
import * as github from '@actions/github';
import fs from 'fs';
import yaml from 'js-yaml';

export async function run() {
  try {
    // `who-to-greet` input defined in action metadata file
    //const nameToGreet = core.getInput('who-to-greet');
    //console.log(`Hello ${nameToGreet}!`);
    
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

    // Accept a YAML config file input
    const configFile = core.getInput('payments-file');
    console.log(`file: ${configFile}!`);
    let config = null;
    if (configFile) {
      const fileContents = fs.readFileSync(configFile, 'utf8');
      config = yaml.load(fileContents);
      // Support an array of payments
      const payments = Array.isArray(config.payments) ? config.payments : [config];
      payments.forEach((payment, idx) => {
        const { dayOfMonth, accountId, beneficiaryId, reference } = payment;
        console.log(`Payment #${idx + 1}`);
        console.log(`  Day of Month: ${dayOfMonth}`);
        console.log(`  Account ID: ${accountId}`);
        console.log(`  Beneficiary ID: ${beneficiaryId}`);
        console.log(`  Reference: ${reference}`);
      });
      // Optionally, set outputs for the first payment
      if (payments.length > 0) {
        const { dayOfMonth, accountId, beneficiaryId, reference } = payments[0];
        core.setOutput('day-of-month', dayOfMonth);
        core.setOutput('account-id', accountId);
        core.setOutput('beneficiary-id', beneficiaryId);
        core.setOutput('reference', reference);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
}

// Only run if this file is executed directly (not imported)
if (process.argv[1] === new URL(import.meta.url).pathname) {
  run();
}