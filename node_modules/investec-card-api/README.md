# Investec Card Code API

Connect with the Investec Card API.

[![Node.js CI](https://github.com/devinpearson/investec-card-api/actions/workflows/node.js.yml/badge.svg)](https://github.com/devinpearson/investec-card-api/actions/workflows/node.js.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![npm version](https://badge.fury.io/js/investec-card-api.svg)](https://badge.fury.io/js/investec-card-api)

## About

A basic package to connect to the investec programmable card api. It was created to service the investec-ipb command line application.

## Installation

Install the package using npm:

```
npm i investec-card-api
```

## Usage

Import the connector into your code:

```typescript
import { InvestecCardApi } from 'investec-card-api';
```

Create a new instance of the InvestecCardApi class:

```typescript
const cardApi = new InvestecCardApi('<clientId>', '<clientSecret>', '<apiKey>');
```

Fetch a list of cards:

```typescript
const cards = await cardApi.getCards();
```

Upload an environment to a card:

```typescript
const cards = await cardApi.uploadEnv(cardKey, env);
```

Uploads the code to a card as the saved card code:

```typescript
const result = await cardApi.uploadCode(cardKey, code);
```

## Examples

Example scripts are available in the `examples/` directory. These scripts demonstrate how to use the API for common tasks:

- `examples/list-cards.ts`: List all programmable cards for your account.
- `examples/upload-code.ts`: Upload code to a programmable card.
- `examples/toggle-feature.ts`: Enable or disable the programmable feature on a card.
- `examples/execute-code.ts`: Execute code in a simulated transaction context.

### Running the Examples

1. Copy the relevant example file from the `examples/` directory.
2. Replace the placeholder values (`your-client-id`, `your-client-secret`, `your-api-key`, and `cardKey`) with your actual Investec API credentials and card details.
3. Run the example using `ts-node` (or compile to JavaScript and run with `node`):

```sh
npx ts-node examples/list-cards.ts
```

Or, for another example:

```sh
npx ts-node examples/execute-code.ts
```

> **Note:** You must have your Investec API credentials and the `ts-node` package installed to run the TypeScript examples directly.

## API Response Shapes

Below are the main response shapes returned by this library. All methods return typed objects matching these interfaces:

### CardResponse

```typescript
{
  data: {
    cards: Array<{
      CardKey: number;
      CardNumber: string;
      IsProgrammable: boolean;
      status: string;
      CardTypeCode: string;
      AccountNumber: string;
      AccountId: string;
    }>;
  }
}
```

### CodeResponse

```typescript
{
  data: {
    result: {
      codeId: string;
      code: string;
      createdAt: string;
      updatedAt: string;
      error: null;
    }
  }
}
```

### EnvResponse

```typescript
{
  data: {
    result: {
      variables: { [key: string]: string };
      createdAt: string;
      updatedAt: string;
      error: null;
    };
  };
}
```

### CodeToggle

```typescript
{
  data: {
    result: {
      Enabled: boolean;
    }
  }
}
```

### ExecutionResult

```typescript
{
  data: {
    result: {
      executionItems: Array<ExecutionItem>;
      error: null;
    }
  }
}
```

### ExecuteResult

```typescript
{
  data: {
    result: Array<ExecutionItem>;
  }
}
```

### ReferenceResponse

```typescript
{
  data: {
    result: Array<{
      Code: string;
      Name: string;
    }>;
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
