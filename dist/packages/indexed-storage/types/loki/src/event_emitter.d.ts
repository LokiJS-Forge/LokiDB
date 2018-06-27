/**
 * LokiEventEmitter is a minimalist version of EventEmitter. It enables any
 * constructor that inherits EventEmitter to emit events and trigger
 * listeners that have been added to the event through the on(event, callback) method
 *
 * @constructor LokiEventEmitter
 */
export declare class LokiEventEmitter {
    /**
     * A map, with each property being an array of callbacks.
     */
    protected _events: object;
    /**
     * Determines whether or not the callbacks associated with each event should happen in an async fashion or not.
     * Default is false, which means events are synchronous
     */
    protected _asyncListeners: boolean;
    /**
     * Adds a listener to the queue of callbacks associated to an event
     * @param {string|string[]} eventName - the name(s) of the event(s) to listen to
     * @param {function} listener - callback function of listener to attach
     * @returns {int} the index of the callback in the array of listeners for a particular event
     */
    on(eventName: string | string[], listener: Function): Function;
    /**
     * Emits a particular event
     * with the option of passing optional parameters which are going to be processed by the callback
     * provided signatures match (i.e. if passing emit(event, arg0, arg1) the listener should take two parameters)
     * @param {string} eventName - the name of the event
     * @param {object} data - optional object passed with the event
     */
    protected emit(eventName: string, ...data: any[]): void;
    /**
     * Alias of EventEmitter.on().
     */
    addListener(eventName: string | string[], listener: Function): Function;
    /**
     * Removes the listener at position 'index' from the event 'eventName'
     * @param {string|string[]} eventName - the name(s) of the event(s) which the listener is attached to
     * @param {function} listener - the listener callback function to remove from emitter
     */
    removeListener(eventName: string | string[], listener: Function): void;
}
