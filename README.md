# Programmable Banking Transfer Action

This GitHub Action transfers money between your Investec accounts using the Investec Programmable Banking API (via the `investec-pb-api` package).

By default it runs as a **dry run**: it validates the payments file and logs what it would do without moving any money. Set `dry-run: false` to make real transfers.

## Inputs

### `clientId`, `clientSecret`, `apiKey`

**Required**: Your Investec API credentials. Pass them from repository secrets.

### `payments-file`

**Required**: Path to a YAML file listing the payments (default `payments.yml`).

### `accountId`

**Optional**: The default sending account, used for any payment that doesn't set its own `accountId`.

### `dry-run`

**Optional**: `true` (the default) only validates and logs. `false` transfers money.

## Payments file

```yaml
payments:
  - accountId: "YOUR_SENDING_ACCOUNT_ID"      # optional if the accountId input is set
    beneficiaryId: "YOUR_RECEIVING_ACCOUNT_ID"
    amount: 100.50                            # rand, at most 2 decimals
    reference: "Monthly saving"
    dayOfMonth: 15                            # optional, see below
```

- Every payment is validated before anything is sent. If any payment is invalid, nothing is transferred.
- `dayOfMonth` (1–31) makes a payment run only on that day of the month, in South African time. On shorter months, a day past the end (for example `31` in April) runs on the last day of the month. Payments without `dayOfMonth` run every time the action runs. Pair this with a daily `schedule` trigger.
- Payments run in order. If one fails, the action stops, fails the job, and reports which payments already went through, so check the account before re-running.

## Outputs

### `transactionIds`

JSON array of payment reference numbers for the transfers performed.

### `results`

JSON array with each payment's outcome: `transferred`, `skipped` (not due today) or `dry-run`.

## Example usage

```yaml
on:
  schedule:
    - cron: '0 6 * * *'   # daily at 08:00 SAST

jobs:
  transfer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: devinpearson/programmable-banking-card-code-action@main
        with:
          clientId: ${{ secrets.INVESTEC_CLIENT_ID }}
          clientSecret: ${{ secrets.INVESTEC_CLIENT_SECRET }}
          apiKey: ${{ secrets.INVESTEC_API_KEY }}
          payments-file: payments.yml
          dry-run: false
```

## Development

```bash
npm install
npm run build   # bundles src/ into dist/bundle.js, which must be committed
```
