# Releasing

Stable releases are created and published automatically when a package-version change reaches
`main`. The release tag exactly matches the package version with a `v` prefix, such as `v0.1.0`.

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

After the first publish, use npm `11.15.0` or newer to add the trusted publisher:

```sh
npm install --global npm@^11.15.0
npm trust github @jvlk/rescript-css \
  --file publish.yml \
  --repo jderochervlk/rescript-css \
  --env npm \
  --allow-publish
```

The command registers these values on npm:

| Setting              | Value          |
| -------------------- | -------------- |
| Organization or user | `jderochervlk` |
| Repository           | `rescript-css` |
| Workflow filename    | `publish.yml`  |
| Environment          | `npm`          |

Create an `npm` environment in the GitHub repository. Required reviewers are recommended so a
release cannot publish without an explicit approval. If deployment branch or tag restrictions are
enabled, they must allow `main`: the workflow publishes from `main` and creates the release tag
after publishing. A tag-only policy blocks the automatic release path.

Once trusted publishing succeeds, configure npm to reject token-based package publishing. The
workflow uses GitHub's short-lived OIDC identity and does not need an npm token or repository
secret.

## Later Releases

1. Update `packages/rescript-css/package.json` to the version being released.
2. Merge the version change to `main`.
3. Approve the `npm` environment deployment when prompted.
4. Confirm the generated GitHub Release, new npm version, and provenance information.

The publish workflow detects whether the package version actually changed, then repeats formatting,
type checks, tests, builds, and the packed-package smoke test before it contacts the registry. It
creates the GitHub Release only after the package is available from npm. A manually published stable
GitHub Release remains a supported way to retry a publication.
