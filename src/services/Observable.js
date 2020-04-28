/**
 * @return {Object}
 */
export function Subscription() {
    return (function(obj) {
        function subscribe(call) {
            if (!obj.subscriptions) {
                obj.subscriptions = [];
            }
            if (obj.subscriptions.lastIndexOf(call) === -1) {
                obj.subscriptions.push(call)
            }
            return function() {
                var index = obj.subscriptions.lastIndexOf(call);
                if (index > -1) {
                    obj.subscriptions.splice(index, 1);
                }
            }
        }
        function trigger() {
            if (!obj.subscriptions) {
                obj.subscriptions = [];
            }
            const args = Array.prototype.slice.call(arguments);
            obj.subscriptions.forEach(function(call){
                call.apply(null, args);
            });
        }
        return {
            subscribe,
            trigger,
        };
    })({});
}