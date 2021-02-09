## On implementing a client for feature flags in your UI codebase

This document isn't an explainer on Feature Flags, you can find that with
[my amateur writeup](https://gist.github.com/threepointone/2c2fae0622681284410ec9edcc6acf9e),
or literally hundreds of better writeups out there.

This document is also agnostic to the choice of service you'd use: LaunchDarkly
or split.io or optimizely or whatever; that's orthogonal to this conversation.

Instead, this document is a list of considerations for implementing a client for
using Feature Flags for User Interface development. Service providers usually
give a simple fetch and use client and that's it; I contend that there's a lot
more to care about. Let's dive in.

To encourage usage, we'd like for the developer experience to be as brutally
simple as possible. So, this should be valid usage:

```js
import iff from 'iff';

// ...

const flagValue = iff('flag-name');
```

This basic experience already raises some implementation details:

- We would like for this call to be typechecked, so `'flag-name'` errors if it's
  of the wrong type (i.e. not a string). The data for the type of `'flag-name'`
  will be inside the service, which means we need a tool that will pull this
  data from the service and generate a local `iff.d.ts` signature (during build?
  periodically on dev's machines?).
- The `iff()` call is synchronous. What we'd like, is for all required flags to
  be fetched at one go when the application is started. This would be great.
  That approach involves statically analysing an entire codebase and figuring
  out which flags have been used.
  - This also implies that only string literals can be passed as flag names to
    `iff()` (i.e. no vars or nothing dynamic).
  - This also implies that this should work even if the requests for flags are
    inside `node_modules`.
  - This also gives us the opportunity to verify that the flag is spelled
    correctly.
- Alternately, we could use a `stale-while-revalidate` approach, where any
  existing value is used immediately while the flag is fetched again in the
  background, and any future uses (i.e. after a page refresh) uses the fresh
  flag value (stored in localStorage or something). (pros and cons of either
  approach left as an exercise to the reader)
- You will notice that the call doesn't require any user identifier. This is
  because it's not needed for client side data; the 'thread' is separate from
  other user's 'threads' (where thread = browser process).
- However, this doesn't hold true if you're planning on using the flags in a
  server context (which is true if you're doing isomorphic code, or just serving
  different data for different users based on flags). There, multiple user
  requests will be passing through the same process (specifically with node.js).
  It would suck if we have to thread a request context with every `iff()` call,
  and it would make the isomorphic story a bit icky.
- Instead, we could use
  [async_hooks/AsyncLocalStorage](https://nodejs.org/api/async_hooks.html#async_hooks_class_asynclocalstorage)
  to establish request contexts, and on the server, `iff()` should read this
  context to read the right flag value for a user.
  - The caveat here is there are some circumstances in which this maybe a bit
    buggy (particularly around using pooled objects, see this issue for some
    more context https://github.com/nodejs/node/issues/34401). I don't think
    it's a deal breaker, but definitely something to look out for.
  - Which means we'll load different versions of `'iff'` for the client side and
    server side.
- And of course, feature flags might not be tied to a user context. It could
  also be tied to the product context, or something else. For example, (your
  design system) might be using a feature flag to roll out a feature. Products
  could opt-in to using a feature or not. We may have to introduce "product" (or
  url?) as a first class type with the service we use. (TODO: discuss this
  further)
- We shouldn't use `stale-while-revalidate` on the server side. That would imply
  that we're holding flag values in memory for multiple users over a period of
  time. Let's just not do that, costs memory, and not great in a
  serverless/multi-server world.
  - This implies your feature flag service should be physically close to your
    actual servers, or it'll end up being a bottleneck to all requests.
- I think it would also be useful to have a mechanism to explicitly override
  flags, probably with a url scheme (ONLY IN DEV MODE). So a url like
  jpmchase.com/some/page?iff=feature-A:true&feature-B:false would set flag
  values for `feature-A` and `feature-B`, regardless of what the service
  returned for them.
- One of the concerns with feature flags, is that a codebase eventually gets
  littered with flags after a period of time. I do believe that's a better
  situation to be in than branching hell, but I commiserate and empathise.
  - One of the tools we can build that makes this better, is being able to scan
    a codebase, and tell which flags are at 100%. This makes it easier to do
    cleanup rounds, where the non-matching code is removed the codebase.
  - A cool feature would be if PRs were automatically generated that removed
    dead branches.
  - It's also important to follow this up with with removing the actual flag
    from the service (after it's actual usage drops to near 0).
- TODO: stickiness
- TODO: expiry on flags

### Bundlers

With the way we use this and the current state of bundlers (webpack, parcel,
etc), you'll see that we ship the code for multiple branches inside a bundle.
This isn't a _very_ critical problem for us at (heavily client side rendered
software firm); we don't optimise as much for Time To First Interaction. But,
there are a couple of options we can take, each with it's own tradeoffs.

- Use the flag as a signal to dynamically import code, like
  `flagValue ? import('feature-A') : import('feature-B')`. While this means less
  code loaded overall, this might mean even slower initial load time, since
  you'll have a waterfall of js requests before the app starts up for good.
- Invest in bundler/serving infrastructure that considers feature flags as a
  first class concept. A naive approach would be to generate bundles for every
  combination of flags, but a better approach would be to break the bundles up
  into chunks that can be loaded dynamically and stictched together on the
  browser. This is more of a long term plan of course, but we can get there.

### Analytics

It's important to tie this closely with our analytics story, whatever that may
be.

- We should send all used flag values with every analytics event. It would be
  tempting to try to deduce them post-facto, but that way dragons lie.
- This will be particularly useful later for tracking down errors and issues, if
  and when we can slice and dice analytics by flag values.

TODO: Flesh this out in more detail

### Education for developers

We can't just ship this feature and assume it'll be used perfectly immediately.
This is a massive culture change for (our firm), and we'll have to guide
everyone through this journey (which may last for months, if not years)

- We'll want to write resources on how to use flags. Complete with examples and
  recipes. A debugging helper may also be nice, as a chrome extension or
  something.
- It's also important that we show how not to use flags. There will be initial
  temptation to use flags for business logic features, since it'll look so
  similar to 'configuration' and we must push back against that.
- We also want to show how to write tests for code that uses flags, This maybe
  as simple as showing show to mock `'iff'` and writing tests against different
  values, but it must still exist.
- As a specific note because of how it can be complicated, we want to show how
  to debug issues with `async_hooks` when feature flags are used on the server.

### Education for SDLC

The above is useful for the actual act of writing code, but there's also
education to be developed in the broader context; how to use feature flags to
ship softeare effectively.

- How does one ship a feature with feature flags? How does one ship parts of the
  feature incrementally and validate in safely in a production context before
  turning on the feature fully for everyone?
- What are the caveats and problems that may arise in these scenarios? Say when
  it comes to flags that seem mutually exclusive but subtly clash together in an
  unexpected manner? And so on.
- How does this affect the QA cycle? What does it mean when one can ship a
  feature, but totally turned off to production, then have QA validate features?
- Similarly, how can we then gradually roll out features in production, testing
  that we haven't broken anything, and have the freedom to roll it back?
