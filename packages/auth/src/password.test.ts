import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password hashing', () => {
  it('produces a hash that is not the plaintext and verifies correctly', async () => {
    const hash = await hashPassword('Demo1234!');
    expect(hash).not.toBe('Demo1234!');
    expect(await verifyPassword('Demo1234!', hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('Demo1234!');
    expect(await verifyPassword('WrongPass9', hash)).toBe(false);
  });
});
