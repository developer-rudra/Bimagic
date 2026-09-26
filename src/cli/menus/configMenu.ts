import { select, input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { ConfigManager } from '../../core/config/index.js';
import { logger } from '../../utils/logger/index.js';

export async function showConfigMenu(): Promise<void> {
  const configManager = ConfigManager.getInstance();
  const config = configManager.getConfig();

  logger.title('BIMAGIC CONFIGURATION & PREFERENCES');

  console.log(`${chalk.bold('Default Remote:')}                ${chalk.cyan(config.preferences.defaultRemote)}`);
  console.log(`${chalk.bold('Confirm Destructive Actions:')} ${config.preferences.confirmDestructiveActions ? chalk.green('Enabled') : chalk.red('Disabled')}`);
  console.log(`${chalk.bold('Recent Repositories Count:')}  ${chalk.yellow(config.recentRepositories.length)}`);
  console.log();

  const action = await select({
    message: 'Select settings action:',
    choices: [
      { name: '⚙️  Toggle Destructive Action Confirmation', value: 'TOGGLE_CONFIRM' },
      { name: '🌐 Set Default Remote Name', value: 'SET_REMOTE' },
      { name: '📜 View Recent Repositories', value: 'VIEW_RECENT' },
      { name: '🧹 Clear Recent Repositories History', value: 'CLEAR_RECENT' },
      { name: '🔙 Back', value: 'BACK' }
    ]
  });

  if (action === 'BACK') return;

  if (action === 'TOGGLE_CONFIRM') {
    const newValue = !config.preferences.confirmDestructiveActions;
    configManager.updatePreferences({ confirmDestructiveActions: newValue });
    logger.success(`Confirm Destructive Actions set to: ${newValue ? 'Enabled' : 'Disabled'}`);
    return;
  }

  if (action === 'SET_REMOTE') {
    const newRemote = await input({
      message: 'Enter default remote name (e.g. origin, upstream):',
      default: config.preferences.defaultRemote,
      validate: (val) => (val && val.trim().length > 0 ? true : 'Remote name cannot be empty')
    });
    configManager.updatePreferences({ defaultRemote: newRemote.trim() });
    logger.success(`Default remote name updated to: ${newRemote.trim()}`);
    return;
  }

  if (action === 'VIEW_RECENT') {
    const recent = configManager.getRecentRepositories();
    if (recent.length === 0) {
      logger.info('No recent repositories recorded.');
      return;
    }
    console.log('\n' + chalk.bold.underline('Recent Repositories:'));
    for (const r of recent) {
      console.log(`  🕒 ${r}`);
    }
    console.log();
    return;
  }

  if (action === 'CLEAR_RECENT') {
    const confirmed = await confirm({
      message: 'Clear all recent repositories from history?',
      default: false
    });
    if (confirmed) {
      for (const r of config.recentRepositories) {
        configManager.removeRecentRepository(r);
      }
      logger.success('Recent repository history cleared.');
    }
  }
}
