import { select, input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { GitService } from '../../core/git/GitService.js';
import { COMMIT_TYPES, buildCommitMessage, validateCommitMessage } from '../../utils/validation/commitValidator.js';
import { logger } from '../../utils/logger/index.js';
import { renderFriendlyError } from '../../utils/errors/index.js';
import { withSpinner } from '../../ui/components/spinner.js';

export async function showCommitMenu(gitService: GitService): Promise<void> {
  const status = await gitService.getDetailedStatus();

  if (status.stagedCount === 0) {
    logger.warning('No changes staged for commit.');
    const stageNow = await confirm({
      message: 'Would you like to open Interactive Staging first?',
      default: true
    });

    if (stageNow) {
      const { showStagingMenu } = await import('./stagingMenu.js');
      await showStagingMenu(gitService);
      const updatedStatus = await gitService.getDetailedStatus();
      if (updatedStatus.stagedCount === 0) {
        logger.warning('Still no files staged. Commit cancelled.');
        return;
      }
    } else {
      return;
    }
  }

  logger.title('MAGIC CONVENTIONAL COMMIT BUILDER');

  // Step 1: Select commit type
  const typeChoice = await select({
    message: 'Step 1: Select commit type:',
    choices: COMMIT_TYPES.map(t => ({
      name: `${chalk.bold(t.value.padEnd(10))} - ${chalk.dim(t.description)}`,
      value: t.value
    }))
  });

  // Step 2: Optional scope
  const scopeInput = await input({
    message: 'Step 2: Enter optional scope (e.g., auth, ui, api) [Press Enter to skip]:'
  });

  // Step 3: Description
  const descriptionInput = await input({
    message: 'Step 3: Enter brief description of change:',
    validate: (val) => {
      if (!val || val.trim().length === 0) return 'Description is required';
      if (val.trim().length > 100) return 'Description should be 100 characters or fewer';
      return true;
    }
  });

  // Step 4: Breaking change option
  const isBreaking = await confirm({
    message: 'Is this a breaking change?',
    default: false
  });

  let breakingDesc: string | undefined;
  if (isBreaking) {
    breakingDesc = await input({
      message: 'Describe the breaking change:',
      validate: (val) => (val && val.trim().length > 0 ? true : 'Description required for breaking changes')
    });
  }

  // Step 5: Issue reference
  const issueRef = await input({
    message: 'Enter issue reference (e.g. #123) [Press Enter to skip]:'
  });

  const generatedMessage = buildCommitMessage({
    type: typeChoice,
    scope: scopeInput,
    description: descriptionInput,
    breakingChange: isBreaking,
    breakingChangeDescription: breakingDesc,
    issueReference: issueRef
  });

  const validation = validateCommitMessage(generatedMessage);
  if (!validation.valid) {
    logger.error(`Validation failed: ${validation.error}`);
    return;
  }

  // Preview
  console.log('\n' + chalk.bold.cyan('--- Commit Preview ---'));
  console.log(chalk.bold(`Type:    `) + typeChoice);
  if (scopeInput.trim()) console.log(chalk.bold(`Scope:   `) + scopeInput.trim());
  console.log(chalk.bold(`Message: `) + generatedMessage.split('\n')[0]);
  if (generatedMessage.includes('\n')) {
    console.log(chalk.dim('\n' + generatedMessage));
  }
  console.log(chalk.bold.cyan('----------------------\n'));

  const confirmed = await confirm({
    message: 'Execute commit with this message?',
    default: true
  });

  if (!confirmed) {
    logger.info('Commit operation cancelled.');
    return;
  }

  try {
    await withSpinner('Creating commit...', () => gitService.commit(generatedMessage));
    logger.success(`Commit created successfully!`);
    console.log(chalk.green.bold(`✔ ${generatedMessage.split('\n')[0]}`));
  } catch (err) {
    renderFriendlyError(err);
  }
}
