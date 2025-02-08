# Semantic Forms

[![npm](https://img.shields.io/npm/v/semantic-forms.svg)](https://www.npmjs.com/package/semantic-forms)

A pattern library of attractive forms for your website with the following design goals:

- Attractive, modern float label visual design.
- Responsive layout based on modern CSS grid technique.
- Clear fields.
- Light and dark mode.
- Invalid field styling.
- Good accessibility.
- Semantic HTML (no div soup).
- Uses a progressive enhancement approach so that core functionality and most of the features still work with JavaScript disabled.
- Sets no global styles and is scoped by a single class name `semanticForms` applied to `<form>` elements.
- No dependencies.

See a [live demo here](https://rooseveltframework.github.io/semantic-forms/semanticForms.html).

This module was built and is maintained by the [Roosevelt web framework](https://github.com/rooseveltframework/roosevelt) [team](https://github.com/orgs/rooseveltframework/people), but it can be used independently of Roosevelt as well.

# Usage

Include the `semanticForms.css` and `semanticForms.js` files from this repo into your project.

Then apply the `semanticForms` class to your `<form>` elements:

```html
<form class="semanticForms">
  <!-- your form here -->
</form>
```

Then apply the JavaScript enhancements:

```javascript
window.semanticForms()
```

Then the CSS/JS enhancements to your forms will apply automatically, assuming the markup structure you use is one of the supported patterns.

If you make changes to the DOM after Semantic Forms is activated and want to activate any additional `semanticForms` forms you insert, you can re-scan for new forms by calling `window.semanticForms()` again. If you only want to reinitialize one form instead of all of them, call `window.semanticForms.reinitialize(formElement)`.

# Features

## Float label inputs

The float label input pattern is notoriously difficult to implement in a fashion that doesn't degrade HTML semantics or accessibility. This pattern library implements a solution that solves that problem. Your label doesn't need to be a sibling of your input like with other implementations. This implementation also has a custom clear button for each input.

### Example

```html
<form class="semanticForms">
  <dl>
    <dt><label for="name">Name</label></dt>
    <dd><input id="name" name="name" type="text" placeholder="e.g. John Smith"></dd>
  </dl>
</form>
```

### Or with a `<textarea>`

```html
<form class="semanticForms">
  <dl>
    <dt><label for="textarea">Textarea</label></dt>
    <dd><textarea id="textarea" name="textarea" rows="5" cols="50" placeholder="e.g. Long string of text"></textarea></dd>
  </dl>
</form>
```

### Add help text

Include a label in the `<dd>` element with a matching `for` attribute to place help text beneath the input:

```html
<form class="semanticForms">
  <dl>
    <dt><label for="password">Password</label></dt>
    <dd>
      <input id="password" name="password" type="password" placeholder="Enter a password" minlength="8" required>
      <label for="password">Must be at least 8 characters long.</label>
    </dd>
  </dl>
</form>
```

## Responsive columns

This feature makes it so the form fields will grow, shrink, expand the number of columns, or reduce the number of columns based on how much space exists in the container. You can customize it by applying various `colspan-#` classes to various elements in the form markup structure.

### Set number of columns for a group of forms

You can limit the number of columns on your forms using the `colspan-#` class on a `<dl>` element:

```html
<form class="semanticForms">
  <dl class="colspan-2">
    <dt><label for="input-a">Input A</label></dt>
    <dd><input type="text" id="input-a" name="input-a"></dd>

    <dt><label for="input-b">Input B</label></dt>
    <dd><input type="text" id="input-b" name="input-b"></dd>

    <!-- wraps to the next row -->
    <dt><label for="input-c">Input C</label></dt>
    <dd><input type="text" id="input-c" name="input-c"></dd>
  </dl>
</form>
```

You can also apply the class to a `<fieldset>` which will apply that styling to all nested `<dl>` elements:

```html
<form class="semanticForms">
  <fieldset class="colspan-3">
    <!-- inherits 3 column class -->
    <dl>
      <dt><label for="input-a">Input A</label></dt>
      <dd><input type="text" id="input-a" name="input-a"></dd>

      <dt><label for="input-b">Input B</label></dt>
      <dd><input type="text" id="input-b" name="input-b"></dd>

      <dt><label for="input-c">Input C</label></dt>
      <dd><input type="text" id="input-c" name="input-c"></dd>
    </dl>

    <!-- has 4 columns -->
    <dl class="colspan-4">
      <dt><label for="input-d">Input D</label></dt>
      <dd><input type="text" id="input-d" name="input-d"></dd>

      <dt><label for="input-e">Input E</label></dt>
      <dd><input type="text" id="input-e" name="input-e"></dd>

      <dt><label for="input-f">Input F</label></dt>
      <dd><input type="text" id="input-f" name="input-f"></dd>
    </dl>
  </fieldset>
</form>
```

### Set number of columns a single input field takes up
You can specify the number of columns an input will span using the `colspan-#` class on the `<dd>` element. The inputs are responsive and will shrink according to available space. Available numbered classes are `colspan-1` through `colspan-5`:


```html
<form class="semanticForms">
  <fieldset>
    <dl>
      <dt><label for="input-a">Input A</label></dt>
      <!-- 1 column -->
      <dd class="colspan-1"><input type="text" id="input-a" name="input-a"></dd>

      <dt><label for="input-b">Input B</label></dt>
      <!-- 2 columns  -->
      <dd class="colspan-2"><input type="text" id="input-b" name="input-b"></dd>

      <dt><label for="input-c">Input C</label></dt>
      <!-- 5 columns (max) -->
      <dd class="colspan-5"><input type="text" id="input-c" name="input-c"></dd>
    </dl>
  </fieldset>
</form>
```

`colspan-full` can also be used to force an input to take up the entire width of a form:

```html
<form class="semanticForms">
  <fieldset>
    <dl>
      <dt><label for="input-a">Input A</label></dt>
      <!-- this spans 2 columns on row 1 -->
      <dd class="colspan-2"><input type="text" id="input-a" name="input-a"></dd>

      <dt><label for="input-b">Input B</label></dt>
      <!-- this spans the full width of row 2 -->
      <dd class="colspan-full"><input type="text" id="input-b" name="input-b"></dd>

      <!-- this spans 1 column on row 3 -->
      <dt><label for="input-c">Input C</label></dt>
      <dd><input type="text" id="input-c" name="input-c"></dd>
    </dl>
  </fieldset>
</form>
```

#### Set number of columns a single input field takes up on the low flow (JavaScript disabled flow)

To apply `colspan-#` styles to low flow (JavaScript disabled flow) form inputs, you will need to manually wrap your `<dt>` and `<dd>` elements in a `<div>`:

```html
<form class="semanticForms">
  <fieldset>
    <dl>
      <div>
        <dt><label for="input-a">Input A</label></dt>
        <!-- this spans 2 columns on row 1 -->
        <dd class="colspan-2"><input type="text" id="input-a" name="input-a"></dd>
			</div>
    </dl>
  </fieldset>
</form>
```

## Button groups

You can align buttons side-by-side, or in left/right/center groups.

### Non-grouped example

Nothing fancy here:

```html
<button type="submit" name="submit">Non-grouped submit button</button>
<button type="submit" name="submit">Another one</button>
```

### Button groups

Driven by flexbox to intelligently align the buttons based on how many are in the group:

```html
<!-- aligns left/right -->
<menu>
  <li><button type="submit" name="submit">Button 1</button></li>
  <li><button type="submit" name="submit">Button 2</button></li>
</menu>

<!-- aligns left/center/right -->
<menu>
  <li><button type="submit" name="submit">Button 1</button></li>
  <li><button type="submit" name="submit">Button 2</button></li>
  <li><button type="submit" name="submit">Button 3</button></li>
</menu>
```

## Checkboxes and radio buttons

Checkboxes and radio buttons need to follow the following markup structure:

### A single checkbox

Not too different than other inputs:

```html
<form class="semanticForms">
  <dl>
    <dt><label for="some_field_name">Single checkbox</label></dt>
    <dd><input type="checkbox" name="some_field_name" id="checkbox"></dd>
  </dl>
</form>
```

### Checkbox group

```html
<form class="semanticForms">
  <dl>
    <dt><label data-for="some_field_name">Checkboxes:</label></dt>
    <dd class="checkboxes">
      <ul id="some_field_name_checkboxes">
        <li><input type="checkbox" name="some_field_name" id="some_field_name_checkboxes_one"> <label for="some_field_name_checkboxes_one">One</label></li>
        <li><input type="checkbox" name="some_field_name" id="some_field_name_checkboxes_two"> <label for="some_field_name_checkboxes_two">Two</label></li>
        <li><input type="checkbox" name="some_field_name" id="some_field_name_checkboxes_three"> <label for="some_field_name_checkboxes_three">Three</label></li>
      </ul>
    </dd>
  </dl>
</form>
```
### Radio buttons

```html
<form class="semanticForms">
  <dl>
    <dt><label data-for="some_field_name">Radios:</label></dt>
    <dd class="radios">
      <ul id="some_field_name">
        <li><input type="radio" name="some_field_name" id="r_one"> <label for="r_one">One</label></li>
        <li><input type="radio" name="some_field_name" id="r_two"> <label for="r_two">Two</label></li>
        <li><input type="radio" name="some_field_name" id="r_three"> <label for="r_three">Three</label></li>
      </ul>
    </dd>
  </dl>
</form>
```

## Validation styles

Inputs with the `required` attribute will result in a visual indicator (*) being added to its label. You can disable this indicator with the `data-no-asterisk` attribute on the label element:

```html
<form class="semanticForms">
  <dl>
    <dt><label for="input" data-no-asterisk>Input label</label></dt>
    <dd><input type="text" name="input" id="input" required>
  </dl>
</form>
```

You can set a paragraph of text below a field to only appear when a field is invalid with the `data-invalid-text` attribute:

```html
<form class="semanticForms">
  <dl>
    <dt><label for="password">Password label</label><dt>
    <dd>
      <input type="password" name="password" id="password" minlength="8">
      <p data-invalid-text>Password must be at least 8 characters long.</p>
    </dd>
  </dl>
</form>
```

You can adjust the tooltip text of the asterisk with the `data-asterisk-text` attribute:

```html
<form class="semanticForms">
  <dl>
    <dt><label for="input" data-asterisk-text="This is a custom tooltip.">Input label</label></dt>
    <dd><input type="text" name="input" id="input" required>
  </dl>
</form>
```
## Dark mode

To set the dark mode, apply an additional class of `dark` to your `<form>` elements to force the dark mode.

## Low flow (JavaScript disabled) mode

The low flow will be displayed if JS is disabled.

You can also activate the low flow (JavaScript disabled) mode manually by adding the `lowFlow` class to your `<form>` element.

The low-flow mode reverts the float label pattern to traditional labels and doesn't include other JS-exclusive enhancements, but preserves the other visual design enhancements driven purely by CSS.

# Contributing

- Fork/clone this repo.
- `npm ci`
- Make your changes. If you want to alter the CSS, do the changes in the `.scss` files.
- `npm run build`. The build step compiles the SCSS file into CSS.
  - You can also run `npm run watch` automatically compiles the CSS file after a change is detected in the SCSS file.
- Test your changes by opening `semanticForms.html` in your browser.
  - If you want to test your work on an actual HTTP server, run `npm run dev` or `npm run d`.
- Commit, push, open pull request.
