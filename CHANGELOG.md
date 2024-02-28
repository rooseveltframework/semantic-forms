# semanticforms changelog

## Next version

- Put your changes here...

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

- Removed defualt two column layout. Now defaults to as many columns as the container is wide.
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
