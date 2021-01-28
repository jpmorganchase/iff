_Disclaimer: This project is in a design phase, and is not usable right now._

## `iff`: Feature Flags for User Interfaces

[Feature flags](https://martinfowler.com/articles/feature-toggles.html) are an
incredible tool for buulding and shipping software. `iff` provides a javascript
client for using feature flags in User Interfaces, agnostic of the backing
service.

[Read this explainer for more details on its implementation design.](implementation.md)

### Install

`npm install iff`

### Usage

```js
import iff from 'iff';

const value = iff('flag-name', defaultValue);
```

### Setup

- [TODO: How to integrate with a service for use in a browser]
- [TODO: How to integrate with a service for use in a server]

### Tools

- `iff scan`: Scan a codebase and output an array of all used flags. Used to
  make sure only used flags in an application are fetched from a service
- `iff outdated`: Scan a codebase, and output which flags are at 100%/full
  rollout in a service. Used to cleanup old flags and unused code branches from
  a codebase.

### Thanks

Thanks to [Jon Brennecke](https://github.com/jonbrennecke) for giving us the
package name `iff`.
