import { IResizeObserver, ResizeObserverHandlerType } from "../typedefs";

interface BindInfo{
    element: HTMLElement;
    handler: ResizeObserverHandlerType;
}

interface ObserveInfo{
    element: HTMLElement;
    count: number;
}

export class ResizeObserver implements IResizeObserver{
    private observer_: globalThis.ResizeObserver = null;
    private observes_ = new Array<ObserveInfo>();

    private binds_: Record<string, BindInfo> = {};
    private lastKeyCount_ = 0;

    public constructor(private regionId_: string){
        this.observer_ = new globalThis.ResizeObserver((entries, observer) => {
            entries.forEach((entry: ResizeObserverEntry) => {
                Object.entries(this.binds_).forEach(([key, value]) => {
                    if (entry.target === value.element){
                        try{
                            value.handler(entry, key, this);
                        }
                        catch{}
                    }
                });
            });
        });
    }

    public Bind(element: HTMLElement, handler: ResizeObserverHandlerType){
        let key = `${this.regionId_}.reszobs.${this.lastKeyCount_++}`;
        this.binds_[key] = {
            element: element,
            handler: handler,
        };

        this.Observe_(element);

        return key;
    }

    public Unbind(target: string | HTMLElement){
        if (typeof target !== 'string'){
            Object.entries(this.binds_).forEach(([key, value]) => {
                if (target === value.element){
                    delete this.binds_[key];
                }
            });

            this.Unobserve_(target, -1);
        }
        else if (target in this.binds_){
            this.Unobserve_(this.binds_[target].element);
            delete this.binds_[target];
        }
    }

    public GetObserver(): globalThis.ResizeObserver{
        return this.observer_;
    }

    private Observe_(element: HTMLElement){
        let entry = this.observes_.find(item => (item.element === element));
        if (!entry || entry.count <= 0){
            this.observer_.observe(element);
            if (!entry){
                this.observes_.push({
                    element: element,
                    count: 1,
                });
            }
            else{//Use instance
                entry.count = 1;
            }
        }
        else{//Increment
            ++entry.count;
        }
    }

    private Unobserve_(element: HTMLElement, count = 1){
        let index = this.observes_.findIndex(item => (item.element === element));
        if (index == -1){//Not found
            return;
        }

        if (this.observes_[index].count <= 0){//Clean up
            this.observes_.splice(index, 1);
            return;
        }

        this.observer_.unobserve(element);
        this.observes_[index].count -= ((count == -1) ? this.observes_[index].count : count);
        
        if (this.observes_[index].count <= 0){//Remove entry
            this.observes_.splice(index, 1);
        }
    }
}
