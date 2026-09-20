# Releasing

Releases are published from GitHub Releases. The release tag must exactly match the package version
with a `v` prefix, such as `v0.1.0`.

## First Publish

npm requires the package to exist before a trusted publisher can be configured. Publish the first
version manually from a clean `main` checkout with two-factor authentication enabled:

```sh
pnpm install --frozen-lockfile
pnpm build:all
pnpm package:check
cd packages/rescript-css
npm login
npm publish --access public
```

Create a GitHub Release for the same tag afterward. The workflow recognizes that the version
already exists and completes without publishing it again.

## Trusted Publisher Setup

After the first publish, add a trusted publisher for `@jvlk/rescript-css` on npm with these values:

| Setting              | Value          |
| -------------------- | -------------- |
| Organization or user | `jderochervlk` |
| Repository           | `rescript-css` |
| Workflow filename    | `publish.yml`  |
| Environment          | `npm`          |

Create an `npm` environment in the GitHub repository. Required reviewers and tag deployment rules
are recommended so a release cannot publish without an explicit approval.

Once trusted publishing succeeds, configure npm to reject token-based package publishing. The
workflow uses GitHub's short-lived OIDC identity and does not need an npm token or repository
secret.

## Later Releases

1. Update `packages/rescript-css/package.json` to the version being released.
2. Merge the version change and wait for CI to pass on `main`.
3. Create a GitHub Release whose tag is `v` followed by that exact version.
4. Approve the `npm` environment deployment when prompted.
5. Confirm the new version and provenance information on npm.

The publish workflow repeats formatting, type checks, tests, builds, and the packed-package smoke
test before it contacts the registry. It only publishes stable GitHub Releases.
