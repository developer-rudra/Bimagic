import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { z } from 'zod';
import { BimagicConfig } from '../../types/index.js';

const ConfigSchema = z.object({
  recentRepositories: z.array(z.string()).default([]),
  preferences: z.object({
    defaultRemote: z.string().default('origin'),
    confirmDestructiveActions: z.boolean().default(true),
    autoStageNewFiles: z.boolean().default(false)
  }).default({
    defaultRemote: 'origin',
    confirmDestructiveActions: true,
    autoStageNewFiles: false
  })
});

const CONFIG_FILE_PATH = path.join(os.homedir(), '.bimagicrc.json');

export class ConfigManager {
  private static instance: ConfigManager;
  private config: BimagicConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): BimagicConfig {
    try {
      if (fs.existsSync(CONFIG_FILE_PATH)) {
        const raw = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        const validated = ConfigSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      }
    } catch {
      // Return default config if file read/parse fails
    }

    return ConfigSchema.parse({});
  }

  public saveConfig(): void {
    try {
      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (err) {
      // Ignore write errors (e.g., read-only filesystem)
    }
  }

  public getConfig(): BimagicConfig {
    return { ...this.config };
  }

  public getRecentRepositories(): string[] {
    // Filter out paths that no longer exist
    return (this.config.recentRepositories || []).filter(repoPath => {
      try {
        return fs.existsSync(repoPath);
      } catch {
        return false;
      }
    });
  }

  public addRecentRepository(repoPath: string): void {
    const normalized = path.resolve(repoPath);
    const existing = this.config.recentRepositories || [];
    const filtered = existing.filter(p => path.resolve(p) !== normalized);
    // Add to top and keep max 10
    this.config.recentRepositories = [normalized, ...filtered].slice(0, 10);
    this.saveConfig();
  }

  public removeRecentRepository(repoPath: string): void {
    const normalized = path.resolve(repoPath);
    this.config.recentRepositories = (this.config.recentRepositories || []).filter(
      p => path.resolve(p) !== normalized
    );
    this.saveConfig();
  }

  public updatePreferences(newPrefs: Partial<BimagicConfig['preferences']>): void {
    this.config.preferences = {
      ...this.config.preferences,
      ...newPrefs
    };
    this.saveConfig();
  }
}
