import chalk from 'chalk';
export class BimagicError extends Error {
    category;
    userExplanation;
    suggestion;
    rawError;
    constructor(category, userExplanation, suggestion, rawError) {
        super(userExplanation);
        this.name = 'BimagicError';
        this.category = category;
        this.userExplanation = userExplanation;
        this.suggestion = suggestion;
        this.rawError = rawError;
    }
}
export function classifyGitError(error) {
    if (error instanceof BimagicError) {
        return error;
    }
    const rawMsg = error instanceof Error ? error.message : String(error);
    if (/not a git repository/i.test(rawMsg)) {
        return new BimagicError('NOT_A_GIT_REPO', 'The current directory is not a Git repository.', 'Initialize a new repository with "git init" or select a valid repository folder.', rawMsg);
    }
    if (/Permission denied|Authentication failed|could not read Username/i.test(rawMsg)) {
        return new BimagicError('AUTH_FAILURE', 'Git authentication failed for remote repository.', 'Check your SSH keys, personal access tokens, or Git credentials.', rawMsg);
    }
    if (/Could not resolve host|Failed to connect|network|Connection refused|timed out/i.test(rawMsg)) {
        return new BimagicError('NETWORK_FAILURE', 'Network connection failed while communicating with remote.', 'Check your internet connection and remote URL.', rawMsg);
    }
    if (/Merge conflict|Automatic merge failed|CONFLICT/i.test(rawMsg)) {
        return new BimagicError('MERGE_CONFLICT', 'Automatic merge failed due to conflicting file changes.', 'Resolve the conflicted files manually or abort the merge.', rawMsg);
    }
    if (/rebase in progress|cannot rebase/i.test(rawMsg)) {
        return new BimagicError('REBASE_CONFLICT', 'A Git rebase operation is currently in progress or encountered conflicts.', 'Resolve conflicts and run "git rebase --continue" or abort with "git rebase --abort".', rawMsg);
    }
    if (/local changes to the following files would be overwritten/i.test(rawMsg) || /please commit your changes or stash them/i.test(rawMsg)) {
        return new BimagicError('UNCOMMITTED_CHANGES', 'You have uncommitted local changes that prevent this operation.', 'Commit your changes or stash them before trying again.', rawMsg);
    }
    if (/pathspec .* did not match any file|revision .* unknown|not a valid object name|branch .* not found/i.test(rawMsg)) {
        return new BimagicError('INVALID_BRANCH', 'The specified branch or reference does not exist.', 'Check branch name spelling or list available branches using the Branch menu.', rawMsg);
    }
    if (/No remote repository specified|'origin' does not appear to be a git repository|No configured push destination/i.test(rawMsg)) {
        return new BimagicError('MISSING_REMOTE', 'No remote repository is configured for this operation.', 'Add a remote using "git remote add origin <url>" or configure your upstream branch.', rawMsg);
    }
    if (/Permission denied \(publickey\)|cannot open .git\/|Access is denied/i.test(rawMsg)) {
        return new BimagicError('PERMISSION_ERROR', 'Permission denied when accessing repository files.', 'Verify file permissions or SSH key configuration.', rawMsg);
    }
    if (/is not a git command|unknown command/i.test(rawMsg)) {
        return new BimagicError('INVALID_COMMAND', 'Git reported an unrecognized command.', 'Make sure Git is installed and updated on your system.', rawMsg);
    }
    return new BimagicError('UNKNOWN', 'An unexpected Git error occurred.', 'Inspect the raw Git error below for details.', rawMsg);
}
export function renderFriendlyError(error, showRaw = false) {
    const classified = classifyGitError(error);
    console.log();
    console.log(chalk.red.bold(`✖ ${classified.userExplanation}`));
    console.log(chalk.yellow(`  Suggestion: ${classified.suggestion}`));
    if (showRaw && classified.rawError) {
        console.log();
        console.log(chalk.dim('--- Original Git Error ---'));
        console.log(chalk.dim(classified.rawError));
        console.log(chalk.dim('--------------------------'));
    }
    console.log();
}
