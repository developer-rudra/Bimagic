import { select, input } from '@inquirer/prompts';
import chalk from 'chalk';
import { GitService } from '../../core/git/GitService.js';
import { logger } from '../../utils/logger/index.js';
import { confirmAction } from '../../ui/components/safetyPrompt.js';
import { renderFriendlyError } from '../../utils/errors/index.js';
import { withSpinner } from '../../ui/components/spinner.js';

export async function showStashMenu(gitService: GitService): Promise<void> {
  const stashes = await gitService.getStashes();

  logger.title('STASH MANAGEMENT');

  const action = await select({
    message: 'Select stash action:',
    choices: [
      { name: '📋 List Stashes', value: 'LIST' },
      { name: '📦 Save New Stash', value: 'CREATE' },
      { name: '👁️  View Stash Content', value: 'SHOW' },
      { name: '📥 Apply Stash (Keep in list)', value: 'APPLY' },
      { name: '📤 Pop Stash (Apply & Remove)', value: 'POP' },
      { name: '🗑️  Drop Stash', value: 'DROP' },
      { name: '🔥 Clear All Stashes', value: 'CLEAR' },
      { name: '🔙 Back', value: 'BACK' }
    ]
  });

  if (action === 'BACK') return;

  if (action === 'LIST') {
    if (stashes.length === 0) {
      logger.info('No stashes found in this repository.');
      return;
    }
    console.log('\n' + chalk.bold.underline('Stash List:'));
    for (const s of stashes) {
      console.log(`  ${chalk.cyan(s.id)} — ${s.message}`);
    }
    console.log();
    return;
  }

  if (action === 'CREATE') {
    const stashMsg = await input({
      message: 'Enter stash description [Press Enter for default]:'
    });

    try {
      await withSpinner(
        'Saving changes to stash...',
        () => gitService.createStash(stashMsg)
      );
      logger.success('Stash saved successfully!');
    } catch (err) {
      renderFriendlyError(err);
    }
    return;
  }

  if (stashes.length === 0) {
    logger.info('No stashes exist to perform this action.');
    return;
  }

  const selectedStash = await select({
    message: 'Select stash entry:',
    choices: stashes.map(s => ({
      name: `${s.id} — ${s.message}`,
      value: s.id
    }))
  });

  if (action === 'SHOW') {
    try {
      const diff = await gitService.showStash(selectedStash);
      console.log('\n' + chalk.bold.cyan(`--- Content of ${selectedStash} ---`));
      console.log(diff ? chalk.dim(diff) : chalk.dim('No visual diff available'));
      console.log(chalk.bold.cyan('-----------------------------------\n'));
    } catch (err) {
      renderFriendlyError(err);
    }
    return;
  }

  if (action === 'APPLY') {
    try {
      await withSpinner(
        `Applying ${selectedStash}...`,
        () => gitService.applyStash(selectedStash)
      );
      logger.success(`Applied ${selectedStash} successfully!`);
    } catch (err) {
      renderFriendlyError(err);
    }
    return;
  }

  if (action === 'POP') {
    try {
      await withSpinner(
        `Popping ${selectedStash}...`,
        () => gitService.popStash(selectedStash)
      );
      logger.success(`Popped ${selectedStash} successfully!`);
    } catch (err) {
      renderFriendlyError(err);
    }
    return;
  }

  if (action === 'DROP') {
    const confirmed = await confirmAction(
      `Drop ${selectedStash}?`,
      'Stashed changes in this entry will be lost permanently.',
      true
    );
    if (!confirmed) return;

    try {
      await withSpinner(
        `Dropping ${selectedStash}...`,
        () => gitService.dropStash(selectedStash)
      );
      logger.success(`Dropped ${selectedStash}.`);
    } catch (err) {
      renderFriendlyError(err);
    }
    return;
  }

  if (action === 'CLEAR') {
    const confirmed = await confirmAction(
      'CLEAR ALL STASHES?',
      `This will permanently delete all ${stashes.length} stash entries!`,
      true
    );
    if (!confirmed) return;

    try {
      await withSpinner(
        'Clearing all stashes...',
        () => gitService.clearStashes()
      );
      logger.success('All stashes cleared successfully.');
    } catch (err) {
      renderFriendlyError(err);
    }
  }
}
