import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as core from '@actions/core';
import { run } from './src/index.js';

vi.mock('@actions/core');

// Helper to set up core.getInput mock
function setupCoreGetInput(configPath) {
  core.getInput = vi.fn((name) => {
    if (name === 'config-file') return configPath;
    if (name === 'who-to-greet') return 'Test User';
    return '';
  });
}

describe('programmable-banking-card-code-action', () => {
  const testConfigPath = './example-config.yml';

  beforeEach(() => {
    vi.resetModules();
    core.setOutput.mockClear();
    core.setFailed.mockClear();
  });

  it('reads payments from YAML and sets outputs for the first payment', async () => {
    setupCoreGetInput(testConfigPath);
    await run();
    expect(core.setOutput).toHaveBeenCalledWith('day-of-month', 15);
    expect(core.setOutput).toHaveBeenCalledWith('account-id', 'ACC123456');
    expect(core.setOutput).toHaveBeenCalledWith('beneficiary-id', 'BEN7890');
    expect(core.setOutput).toHaveBeenCalledWith('reference', 'Monthly payment for services');
  });
});
