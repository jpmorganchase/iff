import { AsyncLocalStorage } from 'async_hooks';

export const flagLocalStorage = new AsyncLocalStorage();

export default function iff(flagName: string, defaultValue: any) {
  const flags = flagLocalStorage.getStore();
  if (flags === undefined) {
    throw new Error(
      'iff() was called outside of a user context, please refer to [help docs]',
    );
  }

  if (flags[flagName] === undefined) {
    return defaultValue;
  }

  return flags[flagName];
}

// node 10
// yarn start and yarn build are super slow
