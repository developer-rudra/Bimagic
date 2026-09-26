import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { ConfigManager } from '../../core/config/index.js';

export async function confirmAction(
  message: string,
  warningText?: string,
  forceConfirm = false
): Promise<boolean> {
  const config = ConfigManager.getInstance().getConfig();

  if (!forceConfirm && !config.preferences.confirmDestructiveActions) {
    return true;
  }

  if (warningText) {
    console.log(chalk.yellow.bold(`⚠ WARNING: ${warningText}`));
  }

  const answer = await confirm({
    message: chalk.bold(message),
    default: false
  });

  return answer;
}
