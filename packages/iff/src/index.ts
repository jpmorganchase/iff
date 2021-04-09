export default function iff<T>(flagName: string, defaultValue?: T) {
  // @ts-expect-error
  const flags = window.__IFF_VALUES__;
  if (flags === undefined) {
    throw new Error('feature flags were not populated');
  }

  if (flags[flagName] === undefined) {
    return defaultValue;
  }

  return flags[flagName];
}
