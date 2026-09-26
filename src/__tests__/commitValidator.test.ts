import { describe, it, expect } from 'vitest';
import { buildCommitMessage, validateCommitMessage } from '../utils/validation/commitValidator.js';

describe('Conventional Commit Builder & Validator', () => {
  it('should build simple conventional commit message', () => {
    const msg = buildCommitMessage({
      type: 'feat',
      description: 'add user login'
    });
    expect(msg).toBe('feat: add user login');
  });

  it('should build conventional commit message with scope', () => {
    const msg = buildCommitMessage({
      type: 'fix',
      scope: 'auth',
      description: 'resolve JWT token expiration'
    });
    expect(msg).toBe('fix(auth): resolve JWT token expiration');
  });

  it('should include breaking change indicator and body', () => {
    const msg = buildCommitMessage({
      type: 'feat',
      scope: 'api',
      description: 'migrate to v2 API',
      breakingChange: true,
      breakingChangeDescription: 'Endpoint v1 removed'
    });
    expect(msg).toContain('feat(api)!: migrate to v2 API');
    expect(msg).toContain('BREAKING CHANGE: Endpoint v1 removed');
  });

  it('should validate correctly formatted conventional commit messages', () => {
    expect(validateCommitMessage('feat(auth): add JWT authentication').valid).toBe(true);
    expect(validateCommitMessage('fix: fix crash on launch').valid).toBe(true);
    expect(validateCommitMessage('docs(readme): update install guide').valid).toBe(true);
  });

  it('should reject invalid commit messages', () => {
    expect(validateCommitMessage('').valid).toBe(false);
    expect(validateCommitMessage('invalid format message').valid).toBe(false);
  });
});
