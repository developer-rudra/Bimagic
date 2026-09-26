import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { GitService } from '../core/git/GitService.js';
import { RepositoryManager } from '../core/repository/RepositoryManager.js';

describe('Real Git Integration Tests', () => {
  let tempRepoDir: string;
  let gitService: GitService;
  let repoManager: RepositoryManager;

  beforeAll(async () => {
    tempRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bimagic-test-repo-'));
    gitService = new GitService(tempRepoDir);
    repoManager = new RepositoryManager(gitService);
  });

  afterAll(() => {
    try {
      fs.rmSync(tempRepoDir, { recursive: true, force: true });
    } catch {
      // Cleanup fallback
    }
  });

  it('should detect non-repo directory initially', async () => {
    const hasGitDir = fs.existsSync(path.join(tempRepoDir, '.git'));
    expect(hasGitDir).toBe(false);
  });

  it('should initialize repository', async () => {
    await gitService.initRepository(tempRepoDir);
    const isRepo = await gitService.isGitRepository(tempRepoDir);
    expect(isRepo).toBe(true);
  });

  it('should detect untracked file, stage, and commit', async () => {
    const testFile = path.join(tempRepoDir, 'sample.txt');
    fs.writeFileSync(testFile, 'Hello Bimagic!', 'utf-8');

    let status = await gitService.getDetailedStatus(tempRepoDir);
    expect(status.untrackedCount).toBe(1);

    await gitService.stageFiles(['sample.txt']);
    status = await gitService.getDetailedStatus(tempRepoDir);
    expect(status.stagedCount).toBe(1);

    await gitService.commit('feat(test): initial test commit');
    status = await gitService.getDetailedStatus(tempRepoDir);
    expect(status.stagedCount).toBe(0);
    expect(status.untrackedCount).toBe(0);
    expect(status.lastCommit?.message).toContain('initial test commit');
  });

  it('should create, switch, and delete branch', async () => {
    await gitService.createBranch('feature/test-branch');
    let branches = await gitService.getBranches();
    const current = branches.find(b => b.current);
    expect(current?.name).toBe('feature/test-branch');

    await gitService.switchBranch('master'); // or main
    branches = await gitService.getBranches();
    expect(branches.find(b => b.current)?.name).not.toBe('feature/test-branch');

    await gitService.deleteBranch('feature/test-branch');
    branches = await gitService.getBranches();
    expect(branches.find(b => b.name === 'feature/test-branch')).toBeUndefined();
  });

  it('should create, apply, and drop stash', async () => {
    const testFile = path.join(tempRepoDir, 'sample.txt');
    fs.writeFileSync(testFile, 'Modified content for stash test', 'utf-8');

    await gitService.createStash('WIP stash test');
    let stashes = await gitService.getStashes();
    expect(stashes.length).toBeGreaterThan(0);
    expect(stashes[0].message).toContain('WIP stash test');

    await gitService.applyStash('stash@{0}');
    const content = fs.readFileSync(testFile, 'utf-8');
    expect(content).toBe('Modified content for stash test');

    await gitService.clearStashes();
    stashes = await gitService.getStashes();
    expect(stashes.length).toBe(0);
  });
});
