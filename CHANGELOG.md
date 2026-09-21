## 5.3.9

- Fixed nested fieldsets in tab boxes.
- Updated dependencies.

## 5.3.8

- Fixed tabs in a nested fieldset.
- Updated dependencies.

## 5.3.7

- Fixed details/summary styling.
- Updated dependencies.

## 5.3.6

- Added support for the HTML `switch` attribute on checkboxes. Browsers with native support render their own switch; elsewhere Semantic Forms draws one, applies the `switch` ARIA role, and supports dragging the thumb to toggle it.
- Added `col-1` through `col-5` classes for placing a field in a particular grid column, which can be combined with `colspan-#`. Like spans, positions fall back to normal flow when the form narrows to fewer columns than the class asks for.
- Added a `--semanticFormsInputColumnMaxWidth` variable, defaulting to `1fr`, which sets the widest an input column in the layout grid may grow. `--semanticFormsInputMaxWidth` is unchanged and still caps the field itself within its column.
- Added tab support. An element with the `tabs` class holding one `<fieldset>` per tab becomes a tab strip, titled by each fieldset's `<legend>`, with the `tab` and `tabpanel` roles and arrow key navigation. Without JavaScript the fieldsets stay stacked and readable.
- Added a `data-display-value` attribute for range inputs, matching how every other per-field option is set. The `displayValue` class it replaces still works.
- Fixed lowFlow single checkbox and radio styling leaking. The rule matched any ancestor `<div>` containing a checkbox rather than the one wrapping it, so every field inside such a container lost the space above its label.
- Fixed fields being reordered on enhancement. Every enhanced field was moved to the end of its `<dl>`, which pushed anything the enhancer leaves alone, such as a `<dd>` containing only a button, to the top. Fields now stay where they were written.
- Fixed the float label, the clear button and the keyboard shortcut hint sitting slightly off center on their fields. Each was placed with a fixed offset that only centered the one font size it was written for. They are now positioned from the field's own height, so they stay centered when `--semanticFormsInputHeight` or `--semanticFormsInputFontSize` is overridden.
- Fixed the float label's text still reading low even once its box was centered. Browsers position a line of text by the font's ascent and descent, which are rarely symmetrical, so the letters sit slightly off center inside the box holding them by an amount that differs with the font the page resolves. Semantic Forms now measures that for whichever font is in use and corrects for it, to the nearest whole pixel the display can draw.
- Fixed the focus highlight rendering thinner on fields sitting flush against the edge of their form. It is now drawn inside the field, where the form's overflow clipping cannot cut it off.
- `semanticForms()` now takes an optional document or shadow root to search, so forms inside a shadow root can be enhanced with `semanticForms(myElement.shadowRoot)`. Each tree is watched separately, and `reinitialize()` works out which tree a form belongs to. Labels are now looked up in the form's own tree rather than the document, which is what previously stopped fields in a shadow root from being enhanced at all.
- Fixed inputs with the `readonly` or `disabled` attribute being given a clear button, which could empty a field the visitor is not meant to be able to change. A field made readonly after the enhancement has run has its clear button hidden by the stylesheet instead.
- Fixed an error thrown when undo was pressed while a field with no clear button was focused, such as a range input.
- Fixed undo and redo duplicating a field's contents. The browser's own undo ran in addition to the library's, applying the edit it reverses on top of the value the library had already restored.
- Fixed the library styling markup outside its own forms. A bare `fieldset` selector gave every fieldset on the host page a container context, which then applied the responsive grid to any `<dl>` inside any fieldset, and the `.checkboxes`/`.radios` list rule was not scoped to the form either.
- Improved docs.
- Updated dependencies.

## 5.3.5

- Fixed visual issues that occurred on standalone and nested `<details>` elements.
- Updated various dependencies.

## 5.3.4

- Reverted a change to single radio and checkbox inputs.
- Added sample forms to the demo page.

## 5.3.3

- Fixed a bug where radio and checkbox inputs would be moved to the end of the parent `<dl>`.
- Updated dependencies.

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
