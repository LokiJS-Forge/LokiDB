/*
 'listen' is not defined  no-undef
 */

/**
 * LokiEventEmitter is a minimalist version of EventEmitter. It enables any
 * constructor that inherits EventEmitter to emit events and trigger
 * listeners that have been added to the event through the on(event, callback) method
 *
 * @constructor LokiEventEmitter
 */
export class LokiEventEmitter {

  constructor() {
		/**
		 * @prop {hashmap} events - a hashmap, with each property being an array of callbacks
		 */
    this.events = {};

		/**
		 * @prop {boolean} asyncListeners - boolean determines whether or not the callbacks associated with each event
		 * should happen in an async fashion or not
		 * Default is false, which means events are synchronous
		 */
    this.asyncListeners = false;
  }

	/**
	 * on(eventName, listener) - adds a listener to the queue of callbacks associated to an event
	 * @param {string|string[]} eventName - the name(s) of the event(s) to listen to
	 * @param {function} listener - callback function of listener to attach
	 * @returns {int} the index of the callback in the array of listeners for a particular event
	 */
  on(eventName, listener) {
    let event;

    if (Array.isArray(eventName)) {
      eventName.forEach((currentEventName) => {
        this.on(currentEventName, listener);
      });
      return listener;
    }

    event = this.events[eventName];
    if (!event) {
      event = this.events[eventName] = [];
    }
    event.push(listener);
    return listener;
  }

	/**
	 * emit(eventName, data) - emits a particular event
	 * with the option of passing optional parameters which are going to be processed by the callback
	 * provided signatures match (i.e. if passing emit(event, arg0, arg1) the listener should take two parameters)
	 * @param {string} eventName - the name of the event
	 * @param {object=} data - optional object passed with the event
	 */
  emit(eventName, data) {
    if (eventName && this.events[eventName]) {
      this.events[eventName].forEach((listener) => {
        if (this.asyncListeners) {
          setTimeout(() => {
            listener(data);
          }, 1);
        } else {
          listener(data);
        }

      });
    }
  }

	/**
	 * Alias of LokiEventEmitter.prototype.on
	 * addListener(eventName, listener) - adds a listener to the queue of callbacks associated to an event
	 * @param {string|string[]} eventName - the name(s) of the event(s) to listen to
	 * @param {function} listener - callback function of listener to attach
	 * @returns {int} the index of the callback in the array of listeners for a particular event
	 */
  addListener(eventName, listener) {
    return this.on(eventName, listener);
  }

	/**
	 * removeListener() - removes the listener at position 'index' from the event 'eventName'
	 * @param {string|string[]} eventName - the name(s) of the event(s) which the listener is attached to
	 * @param {function} listener - the listener callback function to remove from emitter
	 */
  removeListener(eventName, listener) {
    if (Array.isArray(eventName)) {
      eventName.forEach((currentEventName) => {
        this.removeListener(currentEventName, listener);
      });
    }

    if (this.events[eventName]) {
      const listeners = this.events[eventName];
      listeners.splice(listeners.indexOf(listener), 1);
    }
  }
}
