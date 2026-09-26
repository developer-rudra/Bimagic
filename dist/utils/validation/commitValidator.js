import { z } from 'zod';
export const COMMIT_TYPES = [
    { value: 'feat', description: 'A new feature' },
    { value: 'fix', description: 'A bug fix' },
    { value: 'docs', description: 'Documentation only changes' },
    { value: 'style', description: 'Changes that do not affect the meaning of the code (formatting, whitespace)' },
    { value: 'refactor', description: 'A code change that neither fixes a bug nor adds a feature' },
    { value: 'perf', description: 'A code change that improves performance' },
    { value: 'test', description: 'Adding missing tests or correcting existing tests' },
    { value: 'build', description: 'Changes that affect the build system or external dependencies' },
    { value: 'ci', description: 'Changes to CI configuration scripts and workflows' },
    { value: 'chore', description: 'Other changes that do not modify src or test files' }
];
export const ConventionalCommitSchema = z.object({
    type: z.enum([
        'feat', 'fix', 'docs', 'style', 'refactor',
        'perf', 'test', 'build', 'ci', 'chore'
    ]),
    scope: z.string().optional().transform(val => val ? val.trim().toLowerCase() : undefined),
    description: z.string().min(1, 'Commit description cannot be empty').max(100, 'Description should be under 100 characters'),
    breakingChange: z.boolean().optional(),
    breakingChangeDescription: z.string().optional(),
    issueReference: z.string().optional()
});
export function buildCommitMessage(input) {
    const type = input.type.trim().toLowerCase();
    const scopeStr = input.scope && input.scope.trim() ? `(${input.scope.trim().toLowerCase()})` : '';
    const breakingMarker = input.breakingChange ? '!' : '';
    const header = `${type}${scopeStr}${breakingMarker}: ${input.description.trim()}`;
    let body = '';
    if (input.breakingChange && input.breakingChangeDescription) {
        body += `\n\nBREAKING CHANGE: ${input.breakingChangeDescription.trim()}`;
    }
    if (input.issueReference && input.issueReference.trim()) {
        body += `\n\nCloses ${input.issueReference.trim()}`;
    }
    return header + body;
}
export function validateCommitMessage(message) {
    if (!message || message.trim().length === 0) {
        return { valid: false, error: 'Commit message cannot be empty' };
    }
    const firstLine = message.split('\n')[0];
    const regex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore)(\([a-z0-9_/-]+\))?!?: .+/i;
    if (!regex.test(firstLine)) {
        return {
            valid: false,
            error: 'Message does not follow Conventional Commit format "type(scope): description"'
        };
    }
    return { valid: true };
}
