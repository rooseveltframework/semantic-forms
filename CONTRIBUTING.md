# How to contribute

## Coding

- Fork/clone this repo.
- `npm ci`
- Make your changes. If you want to alter the CSS, do the changes in the `.scss` files.
- `npm run build`. The build step compiles the SCSS file into CSS.
  - You can also run `npm run watch` automatically compiles the CSS file after a change is detected in the SCSS file.
- Test your changes by running `npm run dev` (or `npm run d`) and visiting http://localhost:6588/fullDemo.html. The dev server rebuilds the library and the docs site as you edit them.
- Commit, push, open pull request.

## Before opening a pull request

- Be sure all tests pass: `npm t`.
- Ensure good test coverage and write new tests if necessary: `npm run coverage`.
- Run visual regression tests too (see below).
- If your change affects how anything looks, refresh the visual baselines (see below).
- Add your changes to `CHANGELOG.md`.

### Visual regression tests

These compare screenshots of the demo page against committed baselines. Screenshots depend on the operating system, the browser and the installed fonts, so they run inside the official Playwright container, which pins that environment for everyone. They stay out of `npm t` so an ordinary test run does not need Docker.

To run them:

Do not run `npm run test-visual` directly. It renders with your fonts rather than the container's and reports differences that are not real.

Install [Docker](https://www.docker.com) and [Git LFS](https://git-lfs.com), then `npm ci`, then:

```bash
npm run test-visual-docker
```

A failed comparison writes `-expected.png`, `-actual.png` and `-diff.png` into `test-results`, which CI uploads as the `visual-regression-report` artifact. Look at the diff: if the change is one you meant to make, refresh the baselines and commit the images it writes to `test/visual.spec.js-snapshots`:

```bash
npm run test-visual-docker -- --update-snapshots
```

If the visual diff is not a diff you meant to make, then you have found a regression.

#### Updating the Playwright dependency

A Playwright dependency update may cause the visual diff tests to fail, even though there is no actual bug to fix, due to subtle changes in how the browser renders things. When this happens, regenerate the baselines alongside the dependency update:

```bash
npm run test-visual-docker -- --update-snapshots
```

## Release process

If you are a maintainer, please follow the following release procedure:

- Merge all desired pull requests into main.
- Bump `package.json` to a new version and run `npm i` to generate a new `package-lock.json`.
- Add new version to CHANGELOG.
- Paste contents of CHANGELOG into new version commit.
- Open and merge a pull request with those changes.
- Tag the merge commit as the a new release version number.
- Publish commit to npm.
- Submit a pull request to the Roosevelt website [following the instructions here](https://github.com/rooseveltframework/roosevelt-website/blob/main/CONTRIBUTING.md).
