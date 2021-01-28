export default function iff(flagName: string, defaultValue?: any) {
  // @ts-expect-error
  const flags = window.__iff_VALUES___;
  if (flags === undefined) {
    throw new Error('feature flags were not populated');
  }

  if (flags[flagName] === undefined) {
    return defaultValue;
  }

  return flags[flagName];
}
