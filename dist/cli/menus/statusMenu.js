import chalk from 'chalk';
import { logger } from '../../utils/logger/index.js';
import { withSpinner } from '../../ui/components/spinner.js';
export async function showStatusDashboard(gitService) {
    const status = await withSpinner('Fetching repository status...', () => gitService.getDetailedStatus());
    logger.title(`BIMAGIC STATUS DASHBOARD - ${status.repoName.toUpperCase()}`);
    console.log(`${chalk.bold('Repository:')} ${chalk.cyan(status.repoPath)}`);
    console.log(`${chalk.bold('Branch:')}     ${chalk.green.bold(status.currentBranch)}`);
    console.log(`${chalk.bold('HEAD:')}       ${chalk.yellow(status.headHash)}`);
    if (status.remote) {
        console.log(`${chalk.bold('Remote:')}     ${chalk.dim(status.remote)}`);
    }
    console.log(`${chalk.bold('Sync Status:')} ${chalk.blue(`Ahead: ${status.ahead}`)} | ${chalk.magenta(`Behind: ${status.behind}`)}`);
    console.log('\n' + chalk.bold.underline('File Changes:'));
    console.log(`  ${chalk.green('● Staged:')}    ${status.stagedCount}`);
    console.log(`  ${chalk.yellow('● Modified:')}  ${status.modifiedCount}`);
    console.log(`  ${chalk.red('● Untracked:')} ${status.untrackedCount}`);
    console.log(`  ${chalk.gray('● Deleted:')}   ${status.deletedCount}`);
    if (status.lastCommit) {
        console.log('\n' + chalk.bold.underline('Last Commit:'));
        console.log(`  ${chalk.bold('Hash:')}   ${status.lastCommit.hash}`);
        console.log(`  ${chalk.bold('Author:')} ${status.lastCommit.author}`);
        console.log(`  ${chalk.bold('Date:')}   ${status.lastCommit.date}`);
        console.log(`  ${chalk.bold('Msg:')}    ${chalk.cyan(status.lastCommit.message)}`);
    }
    else {
        console.log('\n' + chalk.dim('No commits yet in this repository.'));
    }
    if (status.files.length > 0) {
        console.log('\n' + chalk.bold.underline('File List Summary:'));
        const displayFiles = status.files.slice(0, 15);
        for (const f of displayFiles) {
            let flag = chalk.yellow('[M]');
            if (f.staged)
                flag = chalk.green('[S]');
            else if (f.untracked)
                flag = chalk.red('[?]');
            else if (f.deleted)
                flag = chalk.gray('[D]');
            console.log(`  ${flag} ${f.path}`);
        }
        if (status.files.length > 15) {
            console.log(chalk.dim(`  ... and ${status.files.length - 15} more files`));
        }
    }
    else {
        console.log('\n' + chalk.green('✔ Working tree clean, nothing to commit!'));
    }
    console.log();
}
