import { select, input, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import path from 'node:path';
import fs from 'node:fs';
import { RepositoryManager } from '../../core/repository/RepositoryManager.js';
import { logger } from '../../utils/logger/index.js';
import { renderFriendlyError } from '../../utils/errors/index.js';
import { withSpinner } from '../../ui/components/spinner.js';

export async function showCloneMenu(repoManager: RepositoryManager): Promise<boolean> {
  logger.title('INTERACTIVE REPOSITORY CLONE');

  const url = await input({
    message: 'Enter Repository URL (HTTPS or SSH):',
    validate: (val) => (val && val.trim().length > 0 ? true : 'Repository URL is required')
  });

  const defaultDirName = url.trim().split('/').pop()?.replace('.git', '') || 'cloned-repo';
  const targetDir = await input({
    message: 'Enter local target directory:',
    default: path.join(process.cwd(), defaultDirName)
  });

  const cloneType = await select({
    message: 'Select clone mode:',
    choices: [
      { name: '🌐 Clone entire repository', value: 'FULL' },
      { name: '🎯 Sparse clone (Selective directories/files)', value: 'SPARSE' },
      { name: '🔙 Cancel', value: 'CANCEL' }
    ]
  });

  if (cloneType === 'CANCEL') return false;

  const resolvedTarget = path.resolve(targetDir.trim());

  if (cloneType === 'FULL') {
    try {
      await withSpinner(
        `Cloning repository into "${resolvedTarget}"...`,
        () => repoManager.getGitService().clone(url.trim(), resolvedTarget)
      );
      await repoManager.setRepositoryPath(resolvedTarget);
      logger.success(`Repository cloned successfully into: ${resolvedTarget}`);
      return true;
    } catch (err) {
      renderFriendlyError(err, true);
      return false;
    }
  }

  if (cloneType === 'SPARSE') {
    console.log(chalk.cyan('\nSparse checkout allows downloading only specific subfolders/files.'));
    const pathsInput = await input({
      message: 'Enter folder/file paths to checkout (comma-separated, e.g., frontend, docs, src/api):',
      validate: (val) => (val && val.trim().length > 0 ? true : 'At least one path is required')
    });

    const selectedPaths = pathsInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    try {
      await withSpinner(
        `Sparse cloning selected paths into "${resolvedTarget}"...`,
        () => repoManager.getGitService().sparseClone(url.trim(), resolvedTarget, selectedPaths)
      );
      await repoManager.setRepositoryPath(resolvedTarget);
      logger.success(`Sparse clone completed successfully at: ${resolvedTarget}`);
      return true;
    } catch (err) {
      renderFriendlyError(err, true);
      return false;
    }
  }

  return false;
}
