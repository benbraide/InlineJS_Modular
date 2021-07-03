export class OutsideEventManager {
    constructor() {
        this.targetScopes_ = new Array();
        this.eventCallbacks_ = {};
    }
    AddListener(target, events, handler) {
        let targetScope = this.targetScopes_.find(scope => (scope.target === target));
        if (!targetScope) { //Add new entry
            targetScope = {
                target: target,
                listeners: {},
            };
            this.targetScopes_.push(targetScope);
        }
        ((typeof events === 'string') ? [events] : events).forEach((event) => {
            if (!(event in targetScope.listeners)) { //Add new entry
                targetScope.listeners[event] = {
                    handlers: new Array(),
                    excepts: null,
                };
            }
            targetScope.listeners[event].handlers.push({
                callback: handler,
                excepts: null,
            });
            if (!(event in this.eventCallbacks_)) { //Bind
                this.eventCallbacks_[event] = (e) => {
                    this.targetScopes_.forEach((scope) => {
                        if (!(e.type in scope.listeners) || scope.target === e.target || scope.target.contains(e.target)) {
                            return;
                        }
                        if (scope.listeners[e.type].excepts && scope.listeners[e.type].excepts.findIndex(except => (except === e.target || except.contains(e.target))) != -1) {
                            return;
                        }
                        scope.listeners[e.type].handlers.forEach((myHandler) => {
                            if (!myHandler.excepts || myHandler.excepts.findIndex(except => (except === e.target || except.contains(e.target))) == -1) {
                                try {
                                    myHandler.callback(e);
                                }
                                catch (_a) { }
                            }
                        });
                    });
                };
                document.body.addEventListener(event, this.eventCallbacks_[event]);
            }
        });
    }
    RemoveListener(target, events, handler) {
        let targetScope = this.targetScopes_.find(scope => (scope.target === target));
        if (!targetScope) {
            return;
        }
        ((typeof events === 'string') ? [events] : events).forEach((event) => {
            if (event in targetScope.listeners) {
                if (handler) {
                    targetScope.listeners[event].handlers = targetScope.listeners[event].handlers.filter(myHandler => (myHandler.callback !== handler));
                }
                else { //Remove all
                    delete targetScope.listeners[event];
                }
            }
        });
    }
    AddExcept(target, list, handler) {
        let targetScope = this.targetScopes_.find(scope => (scope.target === target));
        if (!targetScope) {
            return;
        }
        Object.keys(list).forEach((event) => {
            if (!(event in targetScope.listeners)) {
                return;
            }
            if (handler) {
                let myHandler = targetScope.listeners[event].handlers.find(item => (item.callback === handler));
                if (myHandler) {
                    myHandler.excepts = (myHandler.excepts || new Array());
                    (Array.isArray(list[event]) ? list[event] : [list[event]]).forEach((item) => {
                        myHandler.excepts.push(item);
                    });
                }
            }
            else { //General
                targetScope.listeners[event].excepts = (targetScope.listeners[event].excepts || new Array());
                (Array.isArray(list[event]) ? list[event] : [list[event]]).forEach((item) => {
                    targetScope.listeners[event].excepts.push(item);
                });
            }
        });
    }
    Unbind(target) {
        this.targetScopes_ = this.targetScopes_.filter(scope => (scope.target !== target && target.contains(scope.target)));
    }
}
