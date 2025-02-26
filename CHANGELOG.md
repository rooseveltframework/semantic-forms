# Semantic Forms changelog

## Next version

- Put your changes here...

## 5.0.0

- Breaking: Added JS module bundling to make it possible for you to import CJS, ESM, or a standalone version of the JavaScript in this library to your project. However you will need to change your imports to match the new file names. See README for details.
- Added show/hide toggle to password fields which can be disabled with a `data-no-reveal` attribute.
- Added hover text for the clear field button and the show/hide password button.
- Added ability to customize clear field button hover text and show/hide password button hover text using data attributes as well.
- Added support for undo/redo keyboard commands when pressing the clear field.
- Added test suite.
- Fixed some accessibility issues.
- Updated various dependencies.

## 4.0.4

- Fixed a bug that caused menu items with buttons to appear as a list.
- Updated various dependencies.

## 4.0.3

- Fixed bug in which a form entry consisting of a single checkbox would be misaligned.
- Fixed bug that prevented some inputs from expanding to the width of its container.
- Fixed bug in which CSS reset for elements within a semantic forms form was overly aggressive, making it harder to style unrelated content within such a form.
- Updated various dependencies.

## 4.0.2

- Fixed a visual bug that occurred when single checkbox elements had extra elements included.
- Updated various dependencies.

## 4.0.1

- Added invalid help text support.
- Fixed a bug that caused float labels to break when certain browser extensions were enabled.

## 4.0.0

- Breaking: Overhauled entire codebase to drive it using mostly CSS grid instead of flexbox. This makes everything more flexible overall and fit more designs better. However the CSS and markup changes will likely cause breaking changes to previous integrations, so when upgrading make some time to visually test all your pages to alter any CSS overrides you had in place accordingly. You also might want to make some markup changes to make use of new available classes to tweak the fit of individual form fields on specific forms.
- Altered fields to fit available space better at various screen sizes.
- Added multiple utility classes that define how wide inputs will span in the responsive layout.
- Added support for input type=image.
- Added support for secondary labels.
- Added styling for invalid form fields.
- Added asterisk that appears on required inputs.
- Improved accessibility considerably. Now has 100% Lighthouse score.
- Added feature to progressively nest fieldsets with progressively darker/lighter background colors.
- Fixed bug causing clear button appearing on disabled inputs.
- Fixed bug causing clear button to overlap with scrollbars on textareas.
- Fixed bug causing nested fieldset to have incorrect padding and margins.
- Fixed various other small bugs.
- Replaced the `less` CSS preprocessor with `sass`.
- Updated various dependencies.

## 3.2.1

- Fixed a bug that could cause checkboxes and radio buttons to not submit their values to the server properly.
- Updated various dependencies.

## 3.2.0

- Added a reinitialization method to re-scan existing forms. Called with `window.semanticForms.reinitialize(formName)`.
- Altered logic to enhance forms so that it now ignores inputs that have already been enhanced.
- Updated dependencies.

## 3.1.0

- Added dark mode support.
- Deprecated "reset" versions and "no images" versions.
- Added mutation observer that monitors changes to the DOM and will enhance any additional `semanticForms` forms you insert, but the monitoring may not be perfect. If you want to re-scan for new forms to enhance manually, you may still need to call `window.semanticForms()`.
- Fixed a bug that caused DOM events to be duplicated when DOM elements are added dynamically after the first page load.
- Updated dependencies.

## 3.0.8

- Fixed main export on case-sensitive file systems.
- Updated dependencies.

## 3.0.7

- Fixed Chrome issue for forms with no placeholder.

## 3.0.6

- Fixed missing files in npm package.

## 3.0.5

- Added "reset" versions of the CSS files that set `all: unset;` before applying any semantic forms styles to help avoid conflicts with other CSS. There is a performance degradation to using this technique, so you should only use this if absolutely necessary.

## 3.0.4

- Reduced size of select box text.

## 3.0.3

- Fixed issue that prevented id selectors from allowing dots in the string.
- Fixed issue that prevented the clear field from dispatching an input event.

## 3.0.2

- Added support for a single checkbox rather than a group of checkboxes.

## 3.0.1

- Fixed alignment issue.

## 3.0.0

- Removed default two column layout. Now defaults to as many columns as the container is wide.
- Added `x2` class you can put on `dd` elements to double the width of a form. Does not apply on small screens.

## 2.1.2

- Added a function to the JS files's global scope called `semanticForms` that you can call to initialize new forms that have been added to the DOM since the initial initialization.
- Updated dependencies.

## 2.1.1

- Fixed a situation that could lead to a JS error.
- Fix minor alignment issue.

## 2.1.0

- Added all input types.
- Fixed clear field.
- Fixed markup mistakes in the examples.
- Fixed CSS to support `<menu>` elements correctly.
- Refactored the JavaScript to modernize it.
- Updated dependencies.

## 2.0.0

- Replaced `<div class="buttonGroup">` with a `<menu>` element. You will need to refactor your HTML accordingly.
- Fixed alignment issue caused by browser engines changing their alignment calculations since the first release.
- Various other refactoring.
- Pinned deps.
- Updated dependencies.

## 1.0.5

- Restricted JS events to target elements within `semanticForms` class form elements.
- Switched font sizes to % in case someone finds 16px too small and changes the default font size in the browser, these form fields will no longer stay fixed.
- Published to npm.
- Started CHANGELOG.
- Updated dependencies.

## 1.0.4 and below

[Here be dragons](https://en.wikipedia.org/wiki/Here_be_dragons)...
