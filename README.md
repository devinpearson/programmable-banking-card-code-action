# Programmable Banking Transfer Action

This GitHub Action enables the transfer of money between two accounts using the Investec Programmable Banking API (via the devinpearson/ipb package).

## Inputs

### `clientId`
**Required**: The Investec API Client ID.

### `clientSecret`
**Required**: The Investec API Client Secret.

### `apiKey`
**Required**: The Investec API Key.

### `accountId`
**Required**: The account ID of the sending account.

### `transfers`
**Required**: A JSON string array of transfer objects. Each object must have:
- `accountBeneficiaryId`: string (the receiving account ID)
- `amount`: number (in cents)
- `reference`: string (transaction reference)
- `date`: string (YYYY-MM-DD) or `frequency`: string (`daily`, `weekly`, `monthly`)

Example:
```json
[
  {
    "accountBeneficiaryId": "1234567890",
    "amount": 10000,
    "reference": "Salary",
    "date": "2025-06-05"
  },
  {
    "accountBeneficiaryId": "9876543210",
    "amount": 5000,
    "reference": "Allowance",
    "frequency": "monthly"
  }
]
```

## Outputs

### `transactionIds`
An array of transaction IDs for the transfers performed.

## Example usage

```yaml
uses: ./.github/actions/programmable-banking-transfer-action
with:
  clientId: ${{ secrets.INVESTEC_CLIENT_ID }}
  clientSecret: ${{ secrets.INVESTEC_CLIENT_SECRET }}
  apiKey: ${{ secrets.INVESTEC_API_KEY }}
  accountId: '1234567890'
  transfers: '[{"accountBeneficiaryId":"9876543210","amount":10000,"reference":"Test","date":"2025-06-05"}]'
```