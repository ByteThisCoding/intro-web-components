# intro-web-components
An introduction to web components with a real example component.

## What is a Web Component?
A **web component** is a custom user-built component which can be used as if it were a native HTML element. This enables us to, amongst other things:
* Directly place web components in HTML documents using their own custom selectors.
* Specify input properties directly within the HTML markup.
* Add event listeners directly to the component references.

Here, we're going to walk through the process of creating a custom web component by creating a **countdown timer** which will display how much time remains until a certain target timestamp is reached.

## Example Component Requirements
Before continuing, let's outline what exactly our custom component should do. It should:
* Accept a target timestamp as an input property *targetTimestamp*.
* Display the amount of time remaining in a text format such as: *1 year, 3 months, 10 days*.
* Display *target elapsed* if the target timestamp is in the past.
* Update once per second so the user can see the countdown in action.

## How to Create / Define a Web Component
To create a web component, we will need to:
1. Create a JavaScript class which extends the *HTMLElement* class.
1. Define how the class should render its contents and respond to input changes.
1. Add the class, along with its *html selector*, to JavaScripts *custom elements registry*

There are multiple ways we can have a compoent render its contents and CSS styles, each with its own advantages and disadvantages. We'll cover those in more detail in the sections below.

## Creating the Component Class
Let's start off our implementation by creating the class for our custom component:
```javascript
/**
 * We need to extend HTMLElement for this to work properly
 */ 
class CountdownElement extends HTMLElement {
    constructor() {
        //make sure we call super() for the HTMLElement
        super();
        //declare vars and other functionality
    }
}
```
With that, we have an empty class. That class will encapsulate all of the JavaScript logic required to properly render this component and respond to input changes and events.

Let's add the core functionality we'll need to satisfy the requirements above. In the code below, we've added logic to:
* Create the string which formats the time until the target timestamp.
* Update the display once per second.

```javascript
class CountdownElement extends HTMLElement {

    constructor() {
        super();
        //element ref, so we can update the text display
        this._countdownDescElement = null;
        //timer ref so we can update once per second
        this._tickTimer = null;
        //target timestamp in ms, default to 0
        this._targetTimestamp = 0;
    }

    /**
     * Use getters and setters so we can
     *  control what happens when the field is updated
     */
    get targetTimestamp() {
        return this._targetTimestamp;
    }

    /**
     * If the timestamp is set to something not null,
     * update our component accordingly
     */
    set targetTimestamp(timestamp) {
        if (timestamp === null) {
            timestamp = 0;
        } else if (typeof timestamp === 'string') {
            timestamp = +new Date(timestamp);
        }
        this._targetTimestamp = timestamp
        if (this._tickTimer) {
            clearTimeout(this._tickTimer);
        }
        this.nextTick();
    }

    /**
     * Callback when a second has elapsed,
     * This will update the display
     */
    nextTick() {
        const start = +new Date();
        if (!this._countdownDescElement) {
            return;
        }

        //figure out the description
        let descStr = "";
        const timeDiff = this._targetTimestamp - start;
        if (timeDiff <= 0) {
            descStr = "Already elapsed!";
        } else {
            descStr = this.timeMsDiffToString(timeDiff);
        }

        this._countdownDescElement.innerText = descStr;

        //set the next tick timeout
        const nextTime = Math.floor((start + 1000)/1000);
        const diff = nextTime - start;

        setTimeout(() => this.nextTick(), diff);
    }

    /**
     * Convert a number of milliseconds to a string such as:
     *  1 year, 2 months, 3 days
     */
    timeMsDiffToString(ms) {
        let elapsed = ms;

        const years = Math.floor(elapsed / (1000 * 60 * 60 * 24 * 365));
        elapsed -= years * (1000 * 60 * 60 * 24 * 365);

        const months = Math.floor(elapsed / (1000 * 60 * 60 * 24 * 28));
        elapsed -= months * (1000 * 60 * 60 * 24 * 28);

        const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        elapsed -= days * (1000 * 60 * 60 * 24);

        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        elapsed -= hours * (1000 * 60 * 60);

        const minutes = Math.floor(elapsed / (1000 * 60));
        elapsed -= minutes * (1000 * 60);

        const seconds = Math.floor(elapsed / 1000);
        elapsed -= seconds * 1000;

        const formatTime = (time, desc, showZero = false) =>
            time > 0 || showZero
                ? `${time} ${desc}${time !== 1 ? 's' : ''}, `
                : '';

        const time =
            formatTime(years, 'year') +
            formatTime(months, 'month') +
            formatTime(days, 'day') +
            formatTime(hours, 'hour') +
            formatTime(minutes, 'minute') +
            formatTime(seconds, 'second', true);
        return time.substring(0, time.length - 2);
    }
}
```

There are still a few things missing:
* Respond to input property changes.
* Initially create the child components when the element is attached to the document
* Dipose once the element is disconnected.

There are a few *lifecycle* hooks we need to integrate. We'll cover those in the sections below.

## Web Component Lifecycle
A web component's **lifecycle** is a description of what happens to that web component throughout an instance's life. A *lifecycle hook* is a method which will be invoked by the browser when a certain type of event occurs. The following lifecycle hooks apply:
* **connectedCallback()**: when the component is attached to the document, the browser will invoke this method.
* **adoptedCallback()**: invoked when this element is moved from one HTML document to another.
* **attributeChangedCallback(name, oldValue, newValue)**: invoked when a property of this component is changed.
* **disconectedCallbac()**: invoked when the component is disconnected from the DOM.

For this example, we will be using all hooks except for *adoptedCallback()*. Note that any unneeded lifecycle hooks can be omitted from the component class. We'll cover each hook in more detail in the sections below.

## Connected Callback
If our component needs to take some action when it is attached to the DOM, we'll need to implement the *connectedCallback* method in our class. In our countdown timer, we'll need to create the child element which will render the countdown timer string. In the code below, we've implemented the connectedCallback hook within our class and have put logic to create the child component.
```javascript
class CountdownElement extends HTMLElement {

    /* .... other code omitted for brevity .... */

    /**
    * Initialize the content children here
    */
    connectedCallback() {
        //initially create the child components
        const textDiv = document.createElement('div');
        this.appendChild(textDiv);
        this._countdownDescElement = textDiv;
        
        //reset to apply setter
        this.targetTimestamp = this.targetTimestamp;
    }
}
```
Now that we've implemented the method, the browser itself will take care of invoking it when needed; we do not need to take any further action for that lifecycle hook.

## Disconnected Callback
If our component needs to take action when it is removed from the DOM, such as resource cleanup, we'll need to implement the *disconnectedCallback* method in our class. In our countdown timer, we'll need to clear the timer we're using. In the code below, we've implemented that lifecycle hook with that logic:
```javascript
class CountdownElement extends HTMLElement {

    /* .... other code omitted for brevity .... */

    /**
     * Dispose of any resources, such as timers, here
     */
    disconnectedCallback() {
        if (this._tickTimer) {
            clearTimeout(this._tickTimer);
        }

        this._targetTimestamp = null;
        this._countdownDescElement = null;
        this._tickTimer = null;
    }
}
```

## Attribute Changed Callback
If our component needs to respond to attribute / property changes, we'll need to implement the *attributeChangedCallback* method. We'll also need to implement a static getter method *observedAttributes* so the browser knows which attributes we need to listen to. In our countdown timer, we need to listen to a custom attribute **target-timestamp**, which means we'll need to specify that as an attribute to observe and respond to that when it is updated. For each method:
* **observedAttributes** will return an array of strings corresponding to which attributes we need to respond to. Note that this must be a static getter.
* **attributeChangedCallback** will be invoked with parameters *name*, *oldValue*, and *newValue* corresponding to the name of the attribute which has just changed, its previous value, and its new value.

We've implemented these methods below:
```javascript
class CountdownElement extends HTMLElement {

    /* .... other code omitted for brevity .... */

    /**
     * Let the browser know what attributes we need to keep track of
     */
    static get observedAttributes() { 
        //we could put the attr name in a constant if desired
        return ["target-timestamp"];
    }

    /**
     * When the user changes the attribute, this will be invoked
     */
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "target-timestamp":
                this.targetTimestamp = newValue;
                break;
        }
    }
}
```

## Registering the Component
In order to reference the component within the HTML document by its selector, we'll need to register the component with the browser's *custom elements registry*. The code below registers our countdown timer element and associates it with the selector we want to use for it:
```javascript
customElements.define(
    'countdown-timer',
    CountdownElement
);
```

## Using our Component in the DOM
With the JavaScript class well defined and registered, we can use our component in our document. In the code below, we're declaring where to put our component and giving it *id* and *target-timestamp* values.
```html
<countdown-timer id="timer" target-timestamp="10/12/2022"></countdown-timer>
```
Note that we've added the *id* attribute and can add others as well, such as *class*, allowing us to apply styles and otherwise work with custom web components as if they were native HTML elements.

## Alternative Ways of Defining HTML Contents
In this example, we've created our child components using the ``document.createElement`` function. We only had one child element to create, but the same approach can be taken if multiple children need to be created. However, there are multiple ways we can define the component's elements / HTML contents, and it is worth discussing the alternatives (not mutually exclusive):
* **Shadow Dom:** instead of creating / appending children directly to the component, create a shadow dom and append there.
* **Template:** declare the template for this component on the HTML document itself inside of ``<template>...</template>`` tags, then clone that template in and append.
* **HTML String:** store the template as an HTML string and apply directly.

The same approaches can also be taken for CSS properties. We will not cover those alternative in any detail here, but it is good to know they exist.