import {each, isUndefined, isFunction, find} from 'underscore';

/**
 * Created by Lukas Vyslocky <lukas@netaffinity.com> on 03-Oct-19.
 * This service creates observable out of ordinary service
 * obj                         is service that should be converted to observable
 * subscriptionDefinitions     definitions of subscriptions of the service
 *
 * example :
 *
 * Following example creates observable of service with reset function,
 * this service now have additional function (subscribe, unsubscribe) and definition of function
 * onReset.
 * Subscribe and unsubscribe takes key and value as parameters, where value is a call back that will be stored
 * on object. Definition of onReset is just syntactic sugar on subscribe('onReset', someCallback)
 *
 * call back is invoked after every time reset function of service was ran
 * ( with returned values of reset function)
 *
 * return Create({
 *     reset : reset
 * }, [reset])
 *
 * function reset()
 * {
 *     doSomething()
 * }
 *
 *
 *
 * dont forget to unsubscribe from service when subscribing from components :
 *
 * example
 *
 * function setValue() {
 *
 * }
 *
 *
 *  const toRemove =  AdvancedSearchService.onReset(setValue)
 *
 *
 * vm.$onDestroy = function() {
 *      toRemove()
 * };
 *
 *
 * New observable can be created with array of keys eg
 * Observable.create(['test','newTest']) is the same as  :
 *
 * Create({
 *     test : function(){},
 *     newTest : function(){}
 * }, [test, newTest])
 *
 */

/**
 * Create observable object and returns options
 * @param obj {Object}  service to create observable from
 * @param subscriptionDefinitions {Object}  (optional) subscription definitions
 * @constructor
 */
export function Create(obj, subscriptionDefinitions) {
    obj._subscriptions = {};
    obj.onBefore = function (key, call) {
        key = 'onBefore' + key.charAt(0).toUpperCase() + key.slice(1);
        if (isUndefined(obj._subscriptions[key])) {
            obj._subscriptions[key] = [];
        }
        if (obj._subscriptions[key].lastIndexOf(call) < 0)
        {
            obj._subscriptions[key].push(call);
            return function () {
                obj.unsubscribe(key, call);
            };
        }
    };
    obj.on = function (key, call) {
        key = 'on' + key.charAt(0).toUpperCase() + key.slice(1);
        if (isUndefined(obj._subscriptions[key])) {
            obj._subscriptions[key] = [];
        }
        if (obj._subscriptions[key].lastIndexOf(call) < 0)
        {
            obj._subscriptions[key].push(call);
            return function () {
                obj.unsubscribe(key, call);
            };
        }
    };
    obj.unsubscribe = function (key, call) {
        if (!isUndefined(obj._subscriptions[key]) && obj._subscriptions[key].lastIndexOf(call) > -1)
        {
            obj._subscriptions[key].splice(obj._subscriptions[key].lastIndexOf(call), 1)
        }
    };
    if (isUndefined(subscriptionDefinitions))
    {
        subscriptionDefinitions = {};
        each(obj, (value, key) => {
            subscriptionDefinitions[key] = value
        });
    }
    each(subscriptionDefinitions, function (value, key) {
        each(obj, function (objValue, objKey) {
            if (objKey.match(/^_/) || objKey === 'on'
                || objKey === 'onBefore' || objKey === 'unsubscribe')
            {
                return;
            }
            if (objValue === value)
            {
                const onKey = 'on' + key.charAt(0).toUpperCase() + key.slice(1);
                const onBeforeKey = 'onBefore' + key.charAt(0).toUpperCase() + key.slice(1);
                obj[onKey] = function(call) {
                   return obj.on(objKey, call);
                };
                obj[onBeforeKey] = function(call) {
                    return obj.onBefore(objKey, call);
                };
                obj[objKey] = function () {
                    each(obj._subscriptions[onBeforeKey], call => call.apply(null, Array.prototype.slice.call(arguments)));
                    const result = objValue.apply(null, Array.prototype.slice.call(arguments));
                    each(obj._subscriptions[onKey], call => call(result));
                    return result;
                };
                obj['remove' + onKey.charAt(0).toUpperCase() + onKey.slice(1)] =
                    function (call) {
                        obj.unsubscribe(onKey, call)
                    };
                obj['remove' + onBeforeKey.charAt(0).toUpperCase() + onBeforeKey.slice(1)] =
                    function (call) {
                        obj.unsubscribe(onBeforeKey, call)
                    }
            }
        });
    });
    return obj;
}