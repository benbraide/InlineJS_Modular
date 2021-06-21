import { IOutsideEventManager } from '../typedefs'

interface HandlerInfo{
    callback: (event?: Event) => void;
    excepts: Array<HTMLElement>;
}

interface ListenersInfo{
    handlers: Array<HandlerInfo>;
    excepts: Array<HTMLElement>;
}

interface TargetScope{
    target: HTMLElement;
    listeners: Record<string, ListenersInfo>;
}

export class OutsideEventManager implements IOutsideEventManager{
    private targetScopes_ = new Array<TargetScope>();
    private eventCallbacks_: Record<string, (event: Event) => void> = {};

    public AddListener(target: HTMLElement, events: string | Array<string>, handler: (event?: Event) => void): void{
        let targetScope = this.targetScopes_.find(scope => (scope.target === target));
        if (!targetScope){//Add new entry
            targetScope = {
                target: target,
                listeners: {},
            };
            this.targetScopes_.push(targetScope);
        }

        ((typeof events === 'string') ? [events] : events).forEach((event) => {
            if (!(event in targetScope.listeners)){//Add new entry
                targetScope.listeners[event] = {
                    handlers: new Array<HandlerInfo>(),
                    excepts: null,
                };
            }

            targetScope.listeners[event].handlers.push({
                callback: handler,
                excepts: null,
            });

            if (!(event in this.eventCallbacks_)){//Bind
                this.eventCallbacks_[event] = (e: Event) => {
                    this.targetScopes_.forEach((scope) => {//Traverse scopes
                        if (!(e.type in scope.listeners) || scope.target === e.target || scope.target.contains(e.target as Node)){
                            return;
                        }

                        if (scope.listeners[e.type].excepts && scope.listeners[e.type].excepts.findIndex(except => (except === e.target || except.contains(e.target as Node))) != -1){
                            return;
                        }

                        scope.listeners[e.type].handlers.forEach((myHandler) => {
                            if (!myHandler.excepts || myHandler.excepts.findIndex(except => (except === e.target || except.contains(e.target as Node))) == -1){
                                try{
                                    myHandler.callback(e);
                                }
                                catch{}
                            }
                        });
                    });
                };

                document.body.addEventListener(event, this.eventCallbacks_[event]);
            }
        });
    }

    public RemoveListener(target: HTMLElement, events: string | Array<string>, handler?: (event?: Event) => void): void{
        let targetScope = this.targetScopes_.find(scope => (scope.target === target));
        if (!targetScope){
            return;
        }

        ((typeof events === 'string') ? [events] : events).forEach((event) => {
            if (event in targetScope.listeners){
                if (handler){
                    targetScope.listeners[event].handlers = targetScope.listeners[event].handlers.filter(myHandler => (myHandler.callback !== handler));
                }
                else{//Remove all
                    delete targetScope.listeners[event];
                }
            }
        });
    }

    public AddExcept(target: HTMLElement, list: Record<string, Array<HTMLElement> | HTMLElement>, handler?: (event?: Event) => void): void{
        let targetScope = this.targetScopes_.find(scope => (scope.target === target));
        if (!targetScope){
            return;
        }

        Object.keys(list).forEach((event) => {
            if (!(event in targetScope.listeners)){
                return;
            }

            if (handler){
                let myHandler = targetScope.listeners[event].handlers.find(item => (item.callback === handler));
                if (myHandler){
                    myHandler.excepts = (myHandler.excepts || new Array<HTMLElement>());
                    (Array.isArray(list[event]) ? (list[event] as Array<HTMLElement>) : [(list[event] as HTMLElement)]).forEach((item) => {
                        myHandler.excepts.push(item);
                    });
                }
            }
            else{//General
                targetScope.listeners[event].excepts = (targetScope.listeners[event].excepts || new Array<HTMLElement>());
                (Array.isArray(list[event]) ? (list[event] as Array<HTMLElement>) : [(list[event] as HTMLElement)]).forEach((item) => {
                    targetScope.listeners[event].excepts.push(item);
                });
            }
        });
    }

    public Unbind(target: HTMLElement): void{
        this.targetScopes_ = this.targetScopes_.filter(scope => (scope.target !== target && target.contains(scope.target)));
    }
}
