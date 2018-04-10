/**
 * LokiEventEmitter is a minimalist version of EventEmitter. It enables any
 * constructor that inherits EventEmitter to emit events and trigger
 * listeners that have been added to the event through the on(event, callback) method
 *
 * @constructor LokiEventEmitter
 */
export class LokiEventEmitter {
  /**
   * A map, with each property being an array of callbacks.
   */
  protected _events: object = {};

  /**
   * Determines whether or not the callbacks associated with each event should happen in an async fashion or not.
   * Default is false, which means events are synchronous
   */
  protected _asyncListeners: boolean = false;

  /**
   * Adds a listener to the queue of callbacks associated to an event
   * @param {string|string[]} eventName - the name(s) of the event(s) to listen to
   * @param {function} listener - callback function of listener to attach
   * @returns {int} the index of the callback in the array of listeners for a particular event
   */
  public on(eventName: string | string[], listener: Function): Function {
    let event;

    if (Array.isArray(eventName)) {
      eventName.forEach((currentEventName) => {
        this.on(currentEventName, listener);
      });
      return listener;
    }

    event = this._events[eventName];
    if (!event) {
      event = this._events[eventName] = [];
    }
    event.push(listener);
    return listener;
  }

  /**
   * Emits a particular event
   * with the option of passing optional parameters which are going to be processed by the callback
   * provided signatures match (i.e. if passing emit(event, arg0, arg1) the listener should take two parameters)
   * @param {string} eventName - the name of the event
   * @param {object} data - optional object passed with the event
   */
  protected emit(eventName: string, ...data: any[]): void {
    if (eventName && this._events[eventName]) {
      this._events[eventName].forEach((listener: Function) => {
        if (this._asyncListeners) {
          setTimeout(() => {
            listener(...data);
          }, 1);
        } else {
          listener(...data);
        }
      });
    }
  }

  /**
   * Alias of EventEmitter.on().
   */
  public addListener(eventName: string | string[], listener: Function) {
    return this.on(eventName, listener);
  }

  /**
   * Removes the listener at position 'index' from the event 'eventName'
   * @param {string|string[]} eventName - the name(s) of the event(s) which the listener is attached to
   * @param {function} listener - the listener callback function to remove from emitter
   */
  public removeListener(eventName: string | string[], listener: Function) {
    if (Array.isArray(eventName)) {
      eventName.forEach((currentEventName) => {
        this.removeListener(currentEventName, listener);
      });
    }

    if (this._events[eventName as string]) {
      const listeners = this._events[eventName as string];
      listeners.splice(listeners.indexOf(listener), 1);
    }
  }
}
