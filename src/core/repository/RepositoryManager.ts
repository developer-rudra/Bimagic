import path from 'node:path';
import fs from 'node:fs';
import { GitService } from '../git/GitService.js';
import { ConfigManager } from '../config/index.js';
import { BimagicError } from '../../utils/errors/index.js';

export class RepositoryManager {
  private gitService: GitService;
  private configManager: ConfigManager;

  constructor(gitService?: GitService, configManager?: ConfigManager) {
    this.gitService = gitService || new GitService();
    this.configManager = configManager || ConfigManager.getInstance();
  }

  public getGitService(): GitService {
    return this.gitService;
  }

  public getCurrentPath(): string {
    return this.gitService.getWorkingDir();
  }

  public async isCurrentDirectoryRepo(): Promise<boolean> {
    return await this.gitService.isGitRepository();
  }

  public async setRepositoryPath(targetPath: string): Promise<boolean> {
    const resolved = path.resolve(targetPath);
    if (!fs.existsSync(resolved)) {
      throw new BimagicError(
        'INVALID_REPO',
        `Directory does not exist: ${resolved}`,
        'Please check the path and try again.'
      );
    }

    const isRepo = await this.gitService.isGitRepository(resolved);
    if (!isRepo) {
      return false;
    }

    this.gitService.setWorkingDir(resolved);
    this.configManager.addRecentRepository(resolved);
    return true;
  }

  public async initializeRepository(targetPath: string = process.cwd()): Promise<void> {
    const resolved = path.resolve(targetPath);
    await this.gitService.initRepository(resolved);
    this.configManager.addRecentRepository(resolved);
  }

  public getRecentRepositories(): string[] {
    return this.configManager.getRecentRepositories();
  }

  public listSubdirectories(dirPath: string): { name: string; fullPath: string; isGitRepo: boolean }[] {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      const dirs: { name: string; fullPath: string; isGitRepo: boolean }[] = [];

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
    } catch {
      return [];
    }
  }
}
