import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ConfigManager } from '../core/config/index.js';

describe('ConfigManager', () => {
  it('should initialize with default config', () => {
    const configManager = ConfigManager.getInstance();
    const config = configManager.getConfig();
    expect(config).toBeDefined();
    expect(config.preferences).toBeDefined();
    expect(config.preferences.defaultRemote).toBe('origin');
  });

  it('should manage recent repositories without duplicates', () => {
    const configManager = ConfigManager.getInstance();
    const testDir = os.tmpdir();
    
    configManager.addRecentRepository(testDir);
    const recent = configManager.getRecentRepositories();
    expect(recent.map(p => path.resolve(p))).toContain(path.resolve(testDir));

    configManager.removeRecentRepository(testDir);
  });
});
