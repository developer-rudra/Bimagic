import { z } from 'zod';
import { ConventionalCommitInput } from '../../types/index.js';
export declare const COMMIT_TYPES: readonly [{
    readonly value: "feat";
    readonly description: "A new feature";
}, {
    readonly value: "fix";
    readonly description: "A bug fix";
}, {
    readonly value: "docs";
    readonly description: "Documentation only changes";
}, {
    readonly value: "style";
    readonly description: "Changes that do not affect the meaning of the code (formatting, whitespace)";
}, {
    readonly value: "refactor";
    readonly description: "A code change that neither fixes a bug nor adds a feature";
}, {
    readonly value: "perf";
    readonly description: "A code change that improves performance";
}, {
    readonly value: "test";
    readonly description: "Adding missing tests or correcting existing tests";
}, {
    readonly value: "build";
    readonly description: "Changes that affect the build system or external dependencies";
}, {
    readonly value: "ci";
    readonly description: "Changes to CI configuration scripts and workflows";
}, {
    readonly value: "chore";
    readonly description: "Other changes that do not modify src or test files";
}];
export declare const ConventionalCommitSchema: z.ZodObject<{
    type: z.ZodEnum<["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore"]>;
    scope: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    description: z.ZodString;
    breakingChange: z.ZodOptional<z.ZodBoolean>;
    breakingChangeDescription: z.ZodOptional<z.ZodString>;
    issueReference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore";
    description: string;
    scope?: string | undefined;
    breakingChange?: boolean | undefined;
    breakingChangeDescription?: string | undefined;
    issueReference?: string | undefined;
}, {
    type: "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore";
    description: string;
    scope?: string | undefined;
    breakingChange?: boolean | undefined;
    breakingChangeDescription?: string | undefined;
    issueReference?: string | undefined;
}>;
export declare function buildCommitMessage(input: ConventionalCommitInput): string;
export declare function validateCommitMessage(message: string): {
    valid: boolean;
    error?: string;
};
