import { GitService } from '../git/GitService.js';
import { ConfigManager } from '../config/index.js';
export declare class RepositoryManager {
    private gitService;
    private configManager;
    constructor(gitService?: GitService, configManager?: ConfigManager);
    getGitService(): GitService;
    getCurrentPath(): string;
    isCurrentDirectoryRepo(): Promise<boolean>;
    setRepositoryPath(targetPath: string): Promise<boolean>;
    initializeRepository(targetPath?: string): Promise<void>;
    getRecentRepositories(): string[];
    listSubdirectories(dirPath: string): {
        name: string;
        fullPath: string;
        isGitRepo: boolean;
    }[];
}
