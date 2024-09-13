# Semantic Forms

[![npm](https://img.shields.io/npm/v/semantic-forms.svg)](https://www.npmjs.com/package/semantic-forms)

A pattern library of forms based on semantic HTML enhanced with a modern UX.

See a [live demo here](https://kethinov.github.io/semanticforms/semanticForms.html).

# Usage

Include the `semanticForms.css` and `semanticForms.js` files from this repo into your project.

Then apply the `semanticForms` class to your `<form>` elements:

```html
<form class="semanticForms">
  <!-- your form here -->
</form>
```

Then the CSS/JS enhancements to your forms will apply automatically, assuming the markup structure you use is one of the supported patterns.

This library also monitors changes to the DOM and will enhance any additional `semanticForms` forms you insert, but the monitoring may not be perfect. If you want to re-scan for new forms to enhance manually, simply call `window.semanticForms()`. If you only want to reinitialize one form instead of all of them, call `window.semanticForms.reinitialize(formName)`.

# Features

Overview of pattern library features:

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

Include a label in the `<dd>` element with a matching `for` attribute to place help text beneath the input.

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
You can limit the number of columns on your forms using the `colspan-#` class on a `<dl>` element. Applying the class to a `<fieldset>` will apply that styling to all nested `<dl>` elements.

```html
<form class="semanticForms">
  <dl class="colspan-2">
    <dt><label for="input-a">Input A</label></dt>
    <dd><input type="text" id="input-a" name="input-a"></dd>

    <dt><label for="input-b">Input B</label></dt>
    <dd ><input type="text" id="input-b" name="input-b"></dd>

    <!-- wraps to the next row -->
    <dt><label for="input-c">Input C</label></dt>
    <dd><input type="text" id="input-c" name="input-c"></dd>
  </dl>
</form>
```

```html
<form class="semanticForms">
  <fieldset class="colspan-3">
    <!-- inherits 3 column class -->
    <dl>
      <dt><label for="input-a">Input A</label></dt>
      <dd><input type="text" id="input-a" name="input-a"></dd>

      <dt><label for="input-b">Input B</label></dt>
      <dd ><input type="text" id="input-b" name="input-b"></dd>

      <dt><label for="input-c">Input C</label></dt>
      <dd><input type="text" id="input-c" name="input-c"></dd>
    </dl>

    <!-- has 4 columns -->
    <dl class="colspan-4">
      <dt><label for="input-d">Input D</label></dt>
      <dd><input type="text" id="input-d" name="input-d"></dd>

      <dt><label for="input-e">Input E</label></dt>
      <dd ><input type="text" id="input-e" name="input-e"></dd>

      <dt><label for="input-f">Input F</label></dt>
      <dd><input type="text" id="input-f" name="input-f"></dd>
    </dl>
  </fieldset>
</form>
```

### Specify input columns
You can specify the number of columns an input will span using the `colspan-#` class on the `<dd>` element. The inputs are responsive and will shrink according to available space. Available numbered classes are `colspan-1` through `colspan-5`.


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

`colspan-full` can also be used to force an input to take up the entire width of a form.

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

> #### Low flow `colspan-#`
> To apply `colspan-#` styles to lowFlow form inputs, you will need to manually wrap your `<dt>` and `<dd>` elements in a `<div>`.

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
    <dt><label for="checkbox">Single checkbox</label></dt>
    <dd><input id="checkbox" name="checkbox" type="checkbox"></dd>
  </dl>
</form>
```

### Checkbox group

```html
<form class="semanticForms">
  <dl>
    <dt><label data-for="some_field_name">Checkboxes:</label></dt>
    <dd class="checkboxes">
      <ul id="some_field_name">
        <li><input type="checkbox" name="some_field_name" id="c_one"> <label for="c_one">One</label></li>
        <li><input type="checkbox" name="some_field_name" id="c_two"> <label for="c_two">Two</label></li>
        <li><input type="checkbox" name="some_field_name" id="c_three"> <label for="c_three">Three</label></li>
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

## Other features

- Custom-styled select boxes with a custom drawn arrow graphic driven by SVG embedded in the CSS.
- Custom-styled submit buttons to match the aesthetic of the custom-styled forms.
- Required inputs add a red asterisk to their labels.
- Responsive: on wide screens, the forms split into multiple columns. On smaller screens, they collapse to a single column.
- Validation: Valid and invalid styling are automatically applied to all inputs, including select and textarea elements. Validation styling may be added manually using the `valid` and `invalid` classes for the input. `valid` styling is only applied to inputs that also have the `required` attribute.
- Dark mode: apply an additional class of `dark` to your `<form>` elements to use the dark mode.
- Low-flow mode that displays on old browsers, JS-disabled browsers, or can be activated manually by adding the `lowFlow` class to your `<form>` element. The low-flow mode reverts the float label pattern to traditional labels and collapses the forms to single column mode, but preserves the other visual design enhancements driven purely by CSS.

See `semanticForms.html` or the [live demo](https://kethinov.github.io/semanticforms/semanticForms.html) for a full demo of all the markup patterns.

# Contributing

- Fork/clone this repo.
- `npm ci`
- Make your changes. If you want to alter the CSS, do the changes in the `.scss` files.
  - `npm run watch` automatically compiles the CSS file after a change is detected in the SCSS file.
- `npm run build`. The build step compiles the SCSS file into CSS.
- Test your changes by opening `semanticForms.html` in your browser.
- Commit, push, open pull request.
