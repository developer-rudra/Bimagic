import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { z } from 'zod';
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
    static instance;
    config;
    constructor() {
        this.config = this.loadConfig();
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    loadConfig() {
        try {
            if (fs.existsSync(CONFIG_FILE_PATH)) {
                const raw = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
                const parsed = JSON.parse(raw);
                const validated = ConfigSchema.safeParse(parsed);
                if (validated.success) {
                    return validated.data;
                }
            }
        }
        catch {
            // Return default config if file read/parse fails
        }
        return ConfigSchema.parse({});
    }
    saveConfig() {
        try {
            fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(this.config, null, 2), 'utf-8');
        }
        catch (err) {
            // Ignore write errors (e.g., read-only filesystem)
        }
    }
    getConfig() {
        return { ...this.config };
    }
    getRecentRepositories() {
        // Filter out paths that no longer exist
        return (this.config.recentRepositories || []).filter(repoPath => {
            try {
                return fs.existsSync(repoPath);
            }
            catch {
                return false;
            }
        });
    }
    addRecentRepository(repoPath) {
        const normalized = path.resolve(repoPath);
        const existing = this.config.recentRepositories || [];
        const filtered = existing.filter(p => path.resolve(p) !== normalized);
        // Add to top and keep max 10
        this.config.recentRepositories = [normalized, ...filtered].slice(0, 10);
        this.saveConfig();
    }
    removeRecentRepository(repoPath) {
        const normalized = path.resolve(repoPath);
        this.config.recentRepositories = (this.config.recentRepositories || []).filter(p => path.resolve(p) !== normalized);
        this.saveConfig();
    }
    updatePreferences(newPrefs) {
        this.config.preferences = {
            ...this.config.preferences,
            ...newPrefs
        };
        this.saveConfig();
    }
}
