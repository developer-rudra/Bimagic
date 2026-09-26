export interface BimagicConfig {
    recentRepositories: string[];
    preferences: {
        defaultRemote: string;
        confirmDestructiveActions: boolean;
        autoStageNewFiles: boolean;
    };
}
export interface FileStatus {
    path: string;
    index: string;
    working_dir: string;
    staged: boolean;
    modified: boolean;
    untracked: boolean;
    deleted: boolean;
}
export interface DetailedStatus {
    isRepo: boolean;
    repoName: string;
    repoPath: string;
    currentBranch: string;
    headHash: string;
    files: FileStatus[];
    stagedCount: number;
    modifiedCount: number;
    untrackedCount: number;
    deletedCount: number;
    ahead: number;
    behind: number;
    remote: string | null;
    lastCommit: {
        hash: string;
        message: string;
        author: string;
        date: string;
    } | null;
}
export interface ConventionalCommitInput {
    type: string;
    scope?: string;
    description: string;
    breakingChange?: boolean;
    breakingChangeDescription?: string;
    issueReference?: string;
}
export interface BranchInfo {
    name: string;
    current: boolean;
    commit: string;
    label: string;
}
export interface StashEntry {
    id: string;
    index: number;
    message: string;
}
export type ErrorCategory = 'GIT_NOT_INSTALLED' | 'NOT_A_GIT_REPO' | 'INVALID_REPO' | 'AUTH_FAILURE' | 'NETWORK_FAILURE' | 'MERGE_CONFLICT' | 'REBASE_CONFLICT' | 'UNCOMMITTED_CHANGES' | 'INVALID_BRANCH' | 'MISSING_REMOTE' | 'PERMISSION_ERROR' | 'INVALID_COMMAND' | 'CANCELLED' | 'UNKNOWN';
