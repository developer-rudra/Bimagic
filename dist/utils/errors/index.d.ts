import { ErrorCategory } from '../../types/index.js';
export declare class BimagicError extends Error {
    category: ErrorCategory;
    userExplanation: string;
    suggestion: string;
    rawError?: string;
    constructor(category: ErrorCategory, userExplanation: string, suggestion: string, rawError?: string);
}
export declare function classifyGitError(error: unknown): BimagicError;
export declare function renderFriendlyError(error: unknown, showRaw?: boolean): void;
