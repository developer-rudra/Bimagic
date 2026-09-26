import { simpleGit, SimpleGit } from 'simple-git';
import path from 'node:path';
import fs from 'node:fs';
import { DetailedStatus, FileStatus, BranchInfo, StashEntry } from '../../types/index.js';
import { classifyGitError } from '../../utils/errors/index.js';

export class GitService {
  private git: SimpleGit;
  private workingDir: string;

  constructor(workingDir: string = process.cwd()) {
    this.workingDir = path.resolve(workingDir);
    this.git = simpleGit(this.workingDir);
  }

  public setWorkingDir(dir: string): void {
    this.workingDir = path.resolve(dir);
    this.git = simpleGit(this.workingDir);
  }

  public getWorkingDir(): string {
    return this.workingDir;
  }

  public async isGitRepository(dirPath: string = this.workingDir): Promise<boolean> {
    try {
      const resolved = path.resolve(dirPath);
      if (!fs.existsSync(resolved)) return false;
      const gitInstance = simpleGit(resolved);
      const isRepo = await gitInstance.checkIsRepo();
      if (!isRepo) return false;
      // Verify that revparse returns a valid top level directory
      const topLevel = await gitInstance.revparse(['--show-toplevel']);
      return Boolean(topLevel && topLevel.trim().length > 0);
    } catch {
      return false;
    }
  }

  public async initRepository(dirPath: string = this.workingDir): Promise<void> {
    try {
      const resolved = path.resolve(dirPath);
      const gitInstance = simpleGit(resolved);
      await gitInstance.init();
      this.setWorkingDir(resolved);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async getDetailedStatus(dirPath: string = this.workingDir): Promise<DetailedStatus> {
    const resolvedPath = path.resolve(dirPath);
    const isRepo = await this.isGitRepository(resolvedPath);

    if (!isRepo) {
      return {
        isRepo: false,
        repoName: path.basename(resolvedPath),
        repoPath: resolvedPath,
        currentBranch: 'N/A',
        headHash: 'N/A',
        files: [],
        stagedCount: 0,
        modifiedCount: 0,
        untrackedCount: 0,
        deletedCount: 0,
        ahead: 0,
        behind: 0,
        remote: null,
        lastCommit: null
      };
    }

    const gitInstance = simpleGit(resolvedPath);

    try {
      const status = await gitInstance.status();
      const repoName = path.basename(resolvedPath);

      const files: FileStatus[] = status.files.map(f => {
        const indexStatus = f.index;
        const workingDirStatus = f.working_dir;
        
        // File is staged if index status is not '?' or ' '
        const staged = indexStatus !== '?' && indexStatus !== ' ' && indexStatus !== 'U';
        const modified = workingDirStatus === 'M' || indexStatus === 'M';
        const untracked = indexStatus === '?' && workingDirStatus === '?';
        const deleted = indexStatus === 'D' || workingDirStatus === 'D';

        return {
          path: f.path,
          index: indexStatus,
          working_dir: workingDirStatus,
          staged,
          modified,
          untracked,
          deleted
        };
      });

      const stagedCount = files.filter(f => f.staged).length;
      const modifiedCount = files.filter(f => f.modified).length;
      const untrackedCount = files.filter(f => f.untracked).length;
      const deletedCount = files.filter(f => f.deleted).length;

      let lastCommit: DetailedStatus['lastCommit'] = null;
      let headHash = 'N/A';

      try {
        const log = await gitInstance.log({ maxCount: 1 });
        if (log.latest) {
          headHash = log.latest.hash;
          lastCommit = {
            hash: log.latest.hash.substring(0, 7),
            message: log.latest.message,
            author: log.latest.author_name,
            date: log.latest.date
          };
        }
      } catch {
        // Empty repository with no commits yet
      }

      let remote: string | null = null;
      try {
        const remotes = await gitInstance.getRemotes(true);
        if (remotes.length > 0) {
          remote = `${remotes[0].name} (${remotes[0].refs.fetch || remotes[0].refs.push})`;
        }
      } catch {
        // Ignore remote fetch error
      }

      return {
        isRepo: true,
        repoName,
        repoPath: resolvedPath,
        currentBranch: status.current || 'HEAD (detached)',
        headHash: headHash.substring(0, 7),
        files,
        stagedCount,
        modifiedCount,
        untrackedCount,
        deletedCount,
        ahead: status.ahead || 0,
        behind: status.behind || 0,
        remote,
        lastCommit
      };
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async stageFiles(files: string[]): Promise<void> {
    if (files.length === 0) return;
    try {
      await this.git.add(files);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async unstageFiles(files: string[]): Promise<void> {
    if (files.length === 0) return;
    try {
      await this.git.reset(['--', ...files]);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async stageAll(): Promise<void> {
    try {
      await this.git.add('.');
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async unstageAll(): Promise<void> {
    try {
      await this.git.reset(['.']);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async commit(message: string): Promise<void> {
    try {
      await this.git.commit(message);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async getBranches(): Promise<BranchInfo[]> {
    try {
      const summary = await this.git.branchLocal();
      return Object.keys(summary.branches).map(name => {
        const b = summary.branches[name];
        return {
          name,
          current: b.current,
          commit: b.commit.substring(0, 7),
          label: b.current ? `${name} (current)` : name
        };
      });
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async createBranch(name: string): Promise<void> {
    try {
      await this.git.checkoutLocalBranch(name);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async switchBranch(name: string): Promise<void> {
    try {
      await this.git.checkout(name);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async deleteBranch(name: string, force = false): Promise<void> {
    try {
      await this.git.deleteLocalBranch(name, force);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async renameBranch(oldName: string, newName: string): Promise<void> {
    try {
      await this.git.branch(['-m', oldName, newName]);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async mergeBranch(branchName: string): Promise<void> {
    try {
      await this.git.merge([branchName]);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async getStashes(): Promise<StashEntry[]> {
    try {
      const stashList = await this.git.stashList();
      return stashList.all.map((item, index) => ({
        id: `stash@{${index}}`,
        index,
        message: item.message || 'No description'
      }));
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async createStash(message?: string): Promise<void> {
    try {
      if (message && message.trim()) {
        await this.git.stash(['push', '-m', message.trim()]);
      } else {
        await this.git.stash(['push']);
      }
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async showStash(stashId: string): Promise<string> {
    try {
      return await this.git.raw(['stash', 'show', '-p', stashId]);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async applyStash(stashId: string): Promise<void> {
    try {
      await this.git.stash(['apply', stashId]);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async popStash(stashId: string): Promise<void> {
    try {
      await this.git.stash(['pop', stashId]);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async dropStash(stashId: string): Promise<void> {
    try {
      await this.git.stash(['drop', stashId]);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async clearStashes(): Promise<void> {
    try {
      await this.git.stash(['clear']);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async push(remote = 'origin', branch?: string, force = false): Promise<void> {
    try {
      const args: string[] = [remote];
      if (branch) {
        args.push(branch);
      }
      if (force) {
        args.push('--force-with-lease');
      }
      await this.git.push(args);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async pull(remote = 'origin', branch?: string): Promise<void> {
    try {
      const args: string[] = [remote];
      if (branch) {
        args.push(branch);
      }
      await this.git.pull(args);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async clone(url: string, targetDir: string): Promise<void> {
    try {
      await simpleGit().clone(url, targetDir);
      this.setWorkingDir(targetDir);
    } catch (err) {
      throw classifyGitError(err);
    }
  }

  public async sparseClone(
    url: string,
    targetDir: string,
    selectedPaths: string[]
  ): Promise<void> {
    try {
      const absTarget = path.resolve(targetDir);
      if (!fs.existsSync(absTarget)) {
        fs.mkdirSync(absTarget, { recursive: true });
      }

      const gitInstance = simpleGit(absTarget);
      await gitInstance.init();
      await gitInstance.addRemote('origin', url);
      await gitInstance.raw(['config', 'core.sparseCheckout', 'true']);

      const sparseFile = path.join(absTarget, '.git', 'info', 'sparse-checkout');
      const sparseDir = path.dirname(sparseFile);
      if (!fs.existsSync(sparseDir)) {
        fs.mkdirSync(sparseDir, { recursive: true });
      }

      fs.writeFileSync(sparseFile, selectedPaths.join('\n') + '\n', 'utf-8');
      await gitInstance.pull('origin', 'main');
      this.setWorkingDir(absTarget);
    } catch (err) {
      // Fallback attempt to pull default branch if main failed
      try {
        const absTarget = path.resolve(targetDir);
        const gitInstance = simpleGit(absTarget);
        await gitInstance.pull('origin', 'master');
        this.setWorkingDir(absTarget);
      } catch {
        throw classifyGitError(err);
      }
    }
  }
}
