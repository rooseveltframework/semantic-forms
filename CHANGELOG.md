## 5.3.2

- Fixed various layout spacings.

## 5.3.1

- Fixed broken exports.
- Updated dependencies.

## 5.3.0

- Added `align-start`, `align-center`, and `align-end` classes that align form inputs within their available space.
- Added the ability to include individual buttons into the responsive form grid.
- Updated the preferred form markup to wrap each `<dt>` and `<dd>` pair in a `<div>`.
- Updated dependencies.

## 5.2.2

- Fixed a bug in `data-auto-grow` fields that would apply a scrollbar inappropriately.
- Updated dependencies.

## 5.2.1

- Fixed a bug where `colspan-` classes were not working as expected.
- Fixed a bug where `<dl>` elements did not have enough space above them when nested in a `<details>` element.

## 5.2.0

- Added the ability to set input focus keyboard shortcuts using the `data-focus-key` and `data-focus-modifier` attributes.
- Fixed a visual bug where unstyled content would flash on initial load.
- Nested fieldsets now use relative colors.

## 5.1.12

- Fixed a visual bug with details element arrows.
- Added the ability to place buttons and submit inputs next to other form inputs.
- Added the ability to allow fixed-width form elements to grow with their content using the `data-max-content` attribute.
- Added the ability to create one-line textareas that grow in height using the `data-auto-grow` attribute.

## 5.1.11

- Fixed offset of `button-link` elements when in menus.

## 5.1.10

- Added ability to style links to look like Semantic Forms buttons using the `button-link` class.
- Updated dependencies.

## 5.1.9

- Fixed issues related to adding `hidden` attributes to Semantic Forms elements.
- Updated dependencies.

## 5.1.8

- Fixed padding on details element contents.

## 5.1.7

- Added styling to details elements.
- Added a "scale down" effect to pressed buttons.
- Updated dependencies.

## 5.1.6

- Added feature to autosize textareas based on input text. This can be disabled with `data-no-autosize` attribute. The row count can also be limited with `data-max-rows` attribute.
- Altered button aesthetics.
- Adjusted the size and placement of help icons.
- Added pointer cursor styling to range and color inputs.
- Fixed a visual bug where the clear field displaced input typing areas even when it was not visible.
- Fixed a bug where forms with an explicit light/dark class would be overwritten by the system preference.
- Updated dependencies.

## 5.1.5

- Added `no-float-label` class to disable float labels on a per input basis.
- Updated dependencies.

## 5.1.4

- Fixed clipped help icon on Firefox.
- Updated dependencies.

## 5.1.3

- Added support for range inputs that display their value as you slide it around.
- Updated dependencies.

## 5.1.2

- Added a search icon to search inputs.
- Added support for select elements with the multiple attribute.
- Added styling to tables within a form, or tables with the `semanticForm` class.
- Fixed missing styles on single radios.
- Fixed a bug that caused additional text labels to not work on checkbox groups, single checkboxes, and radios.
- Fixed alignment issues on checkbox and radio groups.
- Updated dependencies.

## 5.1.1

- Fixed broken low flow styling.
- Fixed a visual bug on button gradients in Firefox.
- Fixed background styling on nested fieldsets within `<detail>` elements.
- Updated dependencies.

## 5.1.0

- Added ability to more conveniently override default CSS via additional CSS variables.
- Updated all CSS variables to be prefixed with `semanticForms` (i.e. `--semanticFormsFontFamily`) to minimize the chance of naming collisions with the rest of your CSS.
- Fixed bug that prevented input label ellipses from being responsive to the input width.
- Updated dependencies.

## 5.0.10

- Fixed bug causing active styles to apply to focused buttons.
- Updated dependencies.

## 5.0.9

- Fixed bug causing native clear field to appear on search inputs.
- Updated dependencies.

## 5.0.8

- Altered dark mode support so that it does not apply if the `<html>` or `<body>` tag has a class of `"light"`.
- Updated dependencies.

## 5.0.7

- Fixed a bug where the responsive grid layout would not always line up correctly.
- Fixed a bug that prevented text from being longer than input element, causing graphical errors.
- Updated dependencies.

## 5.0.6

- Added slicker live demo docs.
- Fixed a bug causing dark mode not to respect OS preference.
- Updated dependencies.

## 5.0.5

- Added better error handling to the JS.
- Updated dependencies.

## 5.0.4

- Fixed a periodic JS error.

## 5.0.3

- Fixed a bug that prevented `semantic-forms` from detecting when you inserted new forms into the page.
- Updated dependencies.

## 5.0.2

- Fixed a bug that would cause errors when `reinitialize()` was called.
- Fixed a bug that caused nested selects to lose their dropdown icon.
- Fixed a bug where required single checkboxes would not show an asterisk.
- Added a help text icon beside labels with a `title` attribute on their respective inputs, or on labels for checkboxes and radios. Enabled with a `data-show-help-icon` attribute.
- Updated various dependencies.

## 5.0.1

- Fixed a bug that caused some devDependencies to end up in the production build.
- Updated various dependencies.

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
