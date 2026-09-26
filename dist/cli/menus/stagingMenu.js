import { checkbox, select } from '@inquirer/prompts';
import chalk from 'chalk';
import path from 'node:path';
import { logger } from '../../utils/logger/index.js';
import { confirmAction } from '../../ui/components/safetyPrompt.js';
import { renderFriendlyError } from '../../utils/errors/index.js';
import { withSpinner } from '../../ui/components/spinner.js';
const SENSITIVE_PATTERNS = ['.env', '.env.local', '.env.production', 'id_rsa', 'credentials.json', 'secrets'];
function isSensitiveFile(filePath) {
    const baseName = path.basename(filePath).toLowerCase();
    return SENSITIVE_PATTERNS.some(pat => baseName.includes(pat));
}
export async function showStagingMenu(gitService) {
    const status = await gitService.getDetailedStatus();
    if (status.files.length === 0) {
        logger.info('No modified, untracked, or staged files found.');
        return;
    }
    logger.title('INTERACTIVE STAGING');
    const action = await select({
        message: 'Choose staging action:',
        choices: [
            { name: '☑ Select individual files to stage/unstage', value: 'SELECT' },
            { name: '➕ Stage all files', value: 'STAGE_ALL' },
            { name: '➖ Unstage all files', value: 'UNSTAGE_ALL' },
            { name: '🔙 Back', value: 'BACK' }
        ]
    });
    if (action === 'BACK')
        return;
    if (action === 'STAGE_ALL') {
        const sensitiveFiles = status.files.filter(f => isSensitiveFile(f.path));
        if (sensitiveFiles.length > 0) {
            const sensitiveList = sensitiveFiles.map(f => f.path).join(', ');
            const confirmed = await confirmAction('Stage all files including sensitive files?', `Detected sensitive file(s): ${sensitiveList}. Are you sure you want to stage them?`, true);
            if (!confirmed) {
                logger.info('Staging cancelled.');
                return;
            }
        }
        try {
            await withSpinner('Staging all files...', () => gitService.stageAll());
            logger.success('All changes staged successfully!');
        }
        catch (err) {
            renderFriendlyError(err);
        }
        return;
    }
    if (action === 'UNSTAGE_ALL') {
        try {
            await withSpinner('Unstaging all files...', () => gitService.unstageAll());
            logger.success('All changes unstaged successfully!');
        }
        catch (err) {
            renderFriendlyError(err);
        }
        return;
    }
    if (action === 'SELECT') {
        const fileChoices = status.files.map(f => {
            let stateTag = chalk.yellow('[Modified]');
            if (f.untracked)
                stateTag = chalk.red('[Untracked]');
            if (f.deleted)
                stateTag = chalk.gray('[Deleted]');
            const sensitiveWarning = isSensitiveFile(f.path) ? chalk.bgRed.white.bold(' ⚠ SENSITIVE ') : '';
            return {
                name: `${f.staged ? chalk.green('✔ Staged') : chalk.dim('☐ Unstaged')} - ${f.path} ${stateTag} ${sensitiveWarning}`,
                value: f,
                checked: f.staged
            };
        });
        const selectedFiles = await checkbox({
            message: 'Toggle checkboxes (Space to select, Enter to confirm):',
            choices: fileChoices
        });
        const newlySelected = selectedFiles.map(f => f.path);
        // Filter sensitive files that were newly checked
        const newlySelectedSensitive = selectedFiles.filter(f => !f.staged && isSensitiveFile(f.path));
        if (newlySelectedSensitive.length > 0) {
            const confirmed = await confirmAction('Stage sensitive file(s)?', `You have selected sensitive file(s): ${newlySelectedSensitive.map(f => f.path).join(', ')}`, true);
            if (!confirmed) {
                logger.info('Staging operation cancelled.');
                return;
            }
        }
        const filesToStage = selectedFiles.filter(f => !f.staged).map(f => f.path);
        const filesToUnstage = status.files
            .filter(f => f.staged && !newlySelected.includes(f.path))
            .map(f => f.path);
        try {
            if (filesToStage.length > 0) {
                await withSpinner(`Staging ${filesToStage.length} file(s)...`, () => gitService.stageFiles(filesToStage));
                logger.success(`Staged ${filesToStage.length} file(s).`);
            }
            if (filesToUnstage.length > 0) {
                await withSpinner(`Unstaging ${filesToUnstage.length} file(s)...`, () => gitService.unstageFiles(filesToUnstage));
                logger.success(`Unstaged ${filesToUnstage.length} file(s).`);
            }
        }
        catch (err) {
            renderFriendlyError(err);
        }
    }
}
