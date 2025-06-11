# Programmable Card Code Emulator
Write and test programmable card code in a safe environment.

[![Node.js CI](https://github.com/devinpearson/programmable-card-code-emulator/actions/workflows/node.js.yml/badge.svg)](https://github.com/devinpearson/programmable-card-code-emulator/actions/workflows/node.js.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/programmable-card-code-emulator.svg)](https://badge.fury.io/js/programmable-card-code-emulator)

## About
While exploring Programmable Banking Cards, I found it difficult to test my code. I wanted to be able to write code and test it in a safe environment. I also wanted to be able to share my code with others. This project is an attempt to solve these problems.

### Installation

The emulator is available as an npm package. To install it, run the following command:
```
npm i programmable-card-code-emulator
```

### Usage

Import the emulator into your code:
```typescript
 import { createTransaction, run } from "programmable-card-code-emulator";
```

Create a new transaction object:
```typescript
const transaction = createTransaction(
    "ZAR", // Currency Code
    1000, // Amount in cents
    "0000", // Merchant code (MCC)
    "Test Merchant", // Merchant Name
    "Test City", // City
    "ZAF" // Country code
);
```

Run an emulation: 
```typescript
const environmentalVariables = JSON.stringify({ value: 'string' })
// return a array of executions, as seen on the live logs
const result = run(transaction, code, environmentalVariables);
```

## Todo List

 * Additional tests for checking that lodash, fetch and moment are available.
 * Additional exception handling for malformed code, invalid env etc.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details