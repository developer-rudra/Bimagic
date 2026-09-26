import { BimagicConfig } from '../../types/index.js';
export declare class ConfigManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): ConfigManager;
    private loadConfig;
    saveConfig(): void;
    getConfig(): BimagicConfig;
    getRecentRepositories(): string[];
    addRecentRepository(repoPath: string): void;
    removeRecentRepository(repoPath: string): void;
    updatePreferences(newPrefs: Partial<BimagicConfig['preferences']>): void;
}
