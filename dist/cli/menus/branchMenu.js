import { select, input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { logger } from '../../utils/logger/index.js';
import { confirmAction } from '../../ui/components/safetyPrompt.js';
import { renderFriendlyError } from '../../utils/errors/index.js';
import { withSpinner } from '../../ui/components/spinner.js';
export async function showBranchMenu(gitService) {
    const branches = await gitService.getBranches();
    const currentBranch = branches.find(b => b.current)?.name || 'HEAD';
    logger.title(`BRANCH MANAGEMENT - Current: ${currentBranch}`);
    const action = await select({
        message: 'Select branch action:',
        choices: [
            { name: '📋 List Branches', value: 'LIST' },
            { name: '✨ Create New Branch', value: 'CREATE' },
            { name: '🔀 Switch Branch', value: 'SWITCH' },
            { name: '🤝 Merge Branch into Current', value: 'MERGE' },
            { name: '✏️  Rename Branch', value: 'RENAME' },
            { name: '🗑️  Delete Branch', value: 'DELETE' },
            { name: '🔙 Back', value: 'BACK' }
        ]
    });
    if (action === 'BACK')
        return;
    if (action === 'LIST') {
        console.log('\n' + chalk.bold.underline('Local Branches:'));
        for (const b of branches) {
            if (b.current) {
                console.log(`  ${chalk.green.bold('* ' + b.name.padEnd(25))} ${chalk.dim('(' + b.commit + ')')}`);
            }
            else {
                console.log(`    ${b.name.padEnd(25)} ${chalk.dim('(' + b.commit + ')')}`);
            }
        }
        console.log();
        return;
    }
    if (action === 'CREATE') {
        const newName = await input({
            message: 'Enter name for new branch:',
            validate: (val) => (val && val.trim().length > 0 ? true : 'Branch name cannot be empty')
        });
        try {
            await withSpinner(`Creating and switching to branch "${newName}"...`, () => gitService.createBranch(newName.trim()));
            logger.success(`Switched to new branch: ${newName.trim()}`);
        }
        catch (err) {
            renderFriendlyError(err);
        }
        return;
    }
    if (action === 'SWITCH') {
        const otherBranches = branches.filter(b => !b.current);
        if (otherBranches.length === 0) {
            logger.info('No other local branches exist.');
            return;
        }
        const targetBranch = await select({
            message: 'Select branch to switch to:',
            choices: otherBranches.map(b => ({
                name: `${b.name} (${b.commit})`,
                value: b.name
            }))
        });
        try {
            await withSpinner(`Switching to branch "${targetBranch}"...`, () => gitService.switchBranch(targetBranch));
            logger.success(`Switched to branch: ${targetBranch}`);
        }
        catch (err) {
            renderFriendlyError(err);
        }
        return;
    }
    if (action === 'MERGE') {
        const otherBranches = branches.filter(b => !b.current);
        if (otherBranches.length === 0) {
            logger.info('No other branches to merge.');
            return;
        }
        const branchToMerge = await select({
            message: `Select branch to merge into "${currentBranch}":`,
            choices: otherBranches.map(b => ({
                name: b.name,
                value: b.name
            }))
        });
        const confirmed = await confirm({
            message: `Merge branch "${branchToMerge}" into "${currentBranch}"?`,
            default: true
        });
        if (!confirmed)
            return;
        try {
            await withSpinner(`Merging ${branchToMerge}...`, () => gitService.mergeBranch(branchToMerge));
            logger.success(`Merged ${branchToMerge} into ${currentBranch} successfully!`);
        }
        catch (err) {
            renderFriendlyError(err);
        }
        return;
    }
    if (action === 'RENAME') {
        const branchToRename = await select({
            message: 'Select branch to rename:',
            choices: branches.map(b => ({
                name: b.label,
                value: b.name
            }))
        });
        const newName = await input({
            message: `Enter new name for branch "${branchToRename}":`,
            validate: (val) => (val && val.trim().length > 0 ? true : 'New branch name required')
        });
        try {
            await withSpinner(`Renaming branch...`, () => gitService.renameBranch(branchToRename, newName.trim()));
            logger.success(`Renamed branch "${branchToRename}" to "${newName.trim()}".`);
        }
        catch (err) {
            renderFriendlyError(err);
        }
        return;
    }
    if (action === 'DELETE') {
        const otherBranches = branches.filter(b => !b.current);
        if (otherBranches.length === 0) {
            logger.info('Cannot delete current branch when no other local branches exist.');
            return;
        }
        const branchToDelete = await select({
            message: 'Select branch to delete:',
            choices: otherBranches.map(b => ({
                name: b.name,
                value: b.name
            }))
        });
        const confirmed = await confirmAction(`Are you sure you want to delete branch "${branchToDelete}"?`, `This action cannot be undone if branch contains unmerged commits.`, true);
        if (!confirmed)
            return;
        try {
            await withSpinner(`Deleting branch "${branchToDelete}"...`, () => gitService.deleteBranch(branchToDelete));
            logger.success(`Deleted branch "${branchToDelete}".`);
        }
        catch (err) {
            const isUnmerged = String(err).includes('not fully merged');
            if (isUnmerged) {
                const forceDelete = await confirmAction(`Force delete unmerged branch "${branchToDelete}"?`, 'FORCE DELETION: Unmerged changes will be permanently lost!', true);
                if (forceDelete) {
                    try {
                        await withSpinner(`Force deleting branch "${branchToDelete}"...`, () => gitService.deleteBranch(branchToDelete, true));
                        logger.success(`Force deleted branch "${branchToDelete}".`);
                    }
                    catch (forceErr) {
                        renderFriendlyError(forceErr);
                    }
                }
            }
            else {
                renderFriendlyError(err);
            }
        }
    }
}
