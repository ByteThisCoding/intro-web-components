/**
 * This will represent a countdown timer
 * User will input a target timestamp in JavaScript milliseconds
 * The component will render the countdown from there
 * 
 * Some web components use the shadow dom, but we will not do so here
 */
class CountdownElement extends HTMLElement {

    constructor() {
        super();
        //element ref, so we can update the text display
        this._countdownDescElement = null;
        //timer ref so we can update once per second
        this._tickTimer = null;
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
        if (!timestamp) {
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

    /**
     * This is fired by the browser when the element
     *  is connected / placed onto the DOM
     * 
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

    /**
     * This is fired by the browser when the element
     *  is removed / disconnected from the dom
     * 
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

//in order to use this as a custom component, we need to register it with a selector
customElements.define(
    'countdown-timer',
    CountdownElement
);