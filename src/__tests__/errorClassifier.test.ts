import { describe, it, expect } from 'vitest';
import { classifyGitError } from '../utils/errors/index.js';

describe('Git Error Classifier', () => {
  it('should classify NOT_A_GIT_REPO error', () => {
    const err = classifyGitError(new Error('fatal: not a git repository (or any of the parent directories)'));
    expect(err.category).toBe('NOT_A_GIT_REPO');
    expect(err.userExplanation).toContain('not a Git repository');
  });

  it('should classify AUTH_FAILURE error', () => {
    const err = classifyGitError(new Error('Permission denied (publickey). Could not read Username for...'));
    expect(err.category).toBe('AUTH_FAILURE');
  });

  it('should classify NETWORK_FAILURE error', () => {
    const err = classifyGitError(new Error('Could not resolve host: github.com'));
    expect(err.category).toBe('NETWORK_FAILURE');
  });

  it('should classify UNCOMMITTED_CHANGES error', () => {
    const err = classifyGitError(new Error('error: Your local changes to the following files would be overwritten by checkout:'));
    expect(err.category).toBe('UNCOMMITTED_CHANGES');
  });

  it('should classify MERGE_CONFLICT error', () => {
    const err = classifyGitError(new Error('Automatic merge failed; fix conflicts and then commit the result.'));
    expect(err.category).toBe('MERGE_CONFLICT');
  });
});
