import { AsyncLocalStorage } from 'async_hooks';

export const flagLocalStorage = new AsyncLocalStorage();

export default function iff(flagName: string) {
  if (typeof flagName !== 'string') {
    throw TypeError('flagName must be a string');
  }

  const flags: any = flagLocalStorage.getStore();
  if (flags === undefined) {
    throw new Error(
      'iff() was called outside of a user context, please refer to [help docs]',
    );
  }

  if (flags[flagName] === undefined) {
    return null;
  }

  return flags[flagName];
}
