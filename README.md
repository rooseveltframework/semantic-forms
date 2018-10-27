# Semantic Forms

A pattern library of forms based on semantic HTML enhanced with a modern UX.

See a [live demo here](https://kethinov.github.io/semanticforms/semanticForms.html).

# Usage

Include the `semanticForms.css` and `semanticForms.js` files from this repo into your project.

If you want to set your own images for the clear fields and dropdown arrows, then include the `semanticFormsNoImages.css` and `semanticForms.js` files from this repo into your project instead, as they do not have any preset images embedded in the CSS and will result in a smaller dependency size.

Apply the `semanticForms` class to your `<form>` elements:

```html
<form class='semanticForms'>
  <!-- your form here -->
</form>
```

Then the CSS/JS enhancements to your forms will apply automatically.

See `semanticForms.html` or the [live demo](https://kethinov.github.io/semanticforms/semanticForms.html) for a complete pattern library with examples of all UI patterns.

# Features

Overview of pattern library features:

## Float label inputs

The float label input pattern is notoriously difficult to implement in a fashion that doesn't degrade HTML semantics or accessibility. This pattern library implements a solution that solves that problem. Your label doesn't need to be a sibling of your input like with other implementations. This implementation also has a custom clear field driven by SVG embedded in the CSS.

### Example

```html
<form class='semanticForms'>
  <dl>
    <dt><label for='name'>Name</label></dt>
    <dd><input id='name' name='name' type='text' placeholder='e.g. John Smith'></dd>
  </dl>
</form>
```

### Or with a `<textarea>`

```html
<form class='semanticForms'>
  <dl>
    <dt><label for='textarea'>Textarea</label></dt>
    <dd><textarea id='textarea' name='textarea' rows='5' cols='50' placeholder='e.g. Long string of text'></textarea></dd>
  </dl>
</form>
```

If you would like to manipulate the size of the area on the input field reserved for the click event of the clear field, apply one or both of the following `data-` attributes to your form.

Adjust the horizontal offset of the clear field's click event click area (the default is 21):

```html
<form class='semanticForms' data-clearfield-horizontal-offset='21'>
  <!-- your form here -->
</form>
```

Adjust the vertical offset of the clear field's click event click area (the default is 5):

```html
<form class='semanticForms' data-clearfield-vertical-offset='5'>
  <!-- your form here -->
</form>
```

## Button groups

You can align buttons side-by-side, or in left/right/center groups.

### Non-grouped example

Nothing fancy here:

```html
<input type='submit' name='submit' value='Non-grouped submit button'>
<input type='submit' name='submit' value='Another one'>
```

### Button groups

Driven by flexbox to intelligently align the buttons based on how many are in the group:

```html
<!-- aligns left/right -->
<div class='buttonGroup'>
  <input type='submit' name='submit' value='Button 1'>
  <input type='submit' name='submit' value='Button 2'>
</div>

<!-- aligns left/center/right -->
<div class='buttonGroup'>
  <input type='submit' name='submit' value='Button 1'>
  <input type='submit' name='submit' value='Button 2'>
  <input type='submit' name='submit' value='Button 3'>
</div>
```

## Other features

- Custom-styled select boxes with a custom drawn arrow graphic driven by SVG embedded in the CSS.
- Custom-styled submit buttons to match the aesthetic of the custom-styled forms.
- Responsive: on wide screens, the forms split into two columns. On smaller screens, they collapse to a single column.
- Low-flow mode that displays on old browsers, JS-disabled browsers, or can be activated manually by adding the `lowFlow` class to your `<form>` element. The low-flow mode reverts the float label pattern to traditional labels and collapses the forms to single column mode, but preserves the other visual design enhancements driven purely by CSS.

See `semanticForms.html` or the [live demo](https://kethinov.github.io/semanticforms/semanticForms.html) for more examples.

# Contributing

- Fork/clone this repo.
- `npm i`
- Make your changes. If you want to alter the CSS, do the changes in `semanticForms.less`.
- `npm run build`. The build step compiles the LESS file into CSS.
- Commit, push, open pull request.

