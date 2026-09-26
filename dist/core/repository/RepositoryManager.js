import path from 'node:path';
import fs from 'node:fs';
import { GitService } from '../git/GitService.js';
import { ConfigManager } from '../config/index.js';
import { BimagicError } from '../../utils/errors/index.js';
export class RepositoryManager {
    gitService;
    configManager;
    constructor(gitService, configManager) {
        this.gitService = gitService || new GitService();
        this.configManager = configManager || ConfigManager.getInstance();
    }
    getGitService() {
        return this.gitService;
    }
    getCurrentPath() {
        return this.gitService.getWorkingDir();
    }
    async isCurrentDirectoryRepo() {
        return await this.gitService.isGitRepository();
    }
    async setRepositoryPath(targetPath) {
        const resolved = path.resolve(targetPath);
        if (!fs.existsSync(resolved)) {
            throw new BimagicError('INVALID_REPO', `Directory does not exist: ${resolved}`, 'Please check the path and try again.');
        }
        const isRepo = await this.gitService.isGitRepository(resolved);
        if (!isRepo) {
            return false;
        }
        this.gitService.setWorkingDir(resolved);
        this.configManager.addRecentRepository(resolved);
        return true;
    }
    async initializeRepository(targetPath = process.cwd()) {
        const resolved = path.resolve(targetPath);
        await this.gitService.initRepository(resolved);
        this.configManager.addRecentRepository(resolved);
    }
    getRecentRepositories() {
        return this.configManager.getRecentRepositories();
    }
    listSubdirectories(dirPath) {
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            const dirs = [];
            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    const fullPath = path.join(dirPath, entry.name);
                    const gitDir = path.join(fullPath, '.git');
                    dirs.push({
                        name: entry.name,
                        fullPath,
                        isGitRepo: fs.existsSync(gitDir)
                    });
                }
            }
            return dirs;
        }
        catch {
            return [];
        }
    }
}
