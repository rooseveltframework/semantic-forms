# How to contribute

## Coding

- Fork/clone this repo.
- `npm ci`
- Make your changes. If you want to alter the CSS, do the changes in the `.scss` files.
- `npm run build`. The build step compiles the SCSS file into CSS.
  - You can also run `npm run watch` automatically compiles the CSS file after a change is detected in the SCSS file.
- Test your changes by opening `semanticForms.html` in your browser.
  - If you want to test your work on an actual HTTP server, run `npm run dev` or `npm run d`, and then visit http://localhost:3000/test/semanticForms
- Commit, push, open pull request.

## Before opening a pull request

- Be sure all tests pass: `npm t`.
- Ensure good test coverage and write new tests if necessary: `npm run coverage`.
- Add your changes to `CHANGELOG.md`.

## Release process

If you are a maintainer, please follow the following release procedure:

- Merge all desired pull requests into main.
- Run `npm run build` to generate a new dist bundle.
- Bump `package.json` to a new version and run `npm i` to generate a new `package-lock.json`.
- Add new version to CHANGELOG.
- Paste contents of CHANGELOG into new version commit.
- Open and merge a pull request with those changes.
- Tag the merge commit as the a new release version number.
- Publish commit to npm.
- Submit a pull request to the Roosevelt website [following the instructions here](https://github.com/rooseveltframework/roosevelt-website/blob/main/CONTRIBUTING.md).
