# syntax

### .property

Binds a DOM property to a reactive expression.

```html
<input .value="someSignal()" />
```

### :attribute

Binds a DOM attribute to a reactive expression.

```html
<img :src="imageUrl()" />
```

### @event

Binds a DOM event to a reactive expression.

```html
<button @click="handleClick()" />
```

### {{ expression }}

Embeds a reactive expression inside text content.

```html
<p>Total: {{ total() }}</p>
```

### #if="condition"

Conditionally renders an element based on a reactive expression.

```html
<div #if="isVisible()">This content is visible only if isVisible() is true.</div>
```

### #for="arrayExpression"

Renders a list of elements based on a reactive array expression.

```html
<li #for="items().map(item => ({ item }))">{{ item.name }}</li>
```
