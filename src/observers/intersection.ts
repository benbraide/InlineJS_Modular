import { IIntersectionObserver, IntersectionObserverHandlerType } from '../typedefs'
import { Region } from '../region'

export class IntersectionObserver implements IIntersectionObserver{
    private observer_: globalThis.IntersectionObserver = null;
    private handlers_ = new Array<IntersectionObserverHandlerType>();
    private isObserving_ = false;
    
    public constructor(private key_: string, private target_: HTMLElement, private options_: IntersectionObserverInit){
        let key = this.key_;
        this.observer_ = new globalThis.IntersectionObserver((entries, observer) => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                if (!entry.isIntersecting){
                    return;
                }
                
                this.handlers_.forEach((handler) => {
                    try{
                        handler(entry, key, observer);
                    }
                    catch{}
                });
            });
        }, this.options_);
    }
    
    public GetKey(): string{
        return this.key_;
    }

    public GetObserver(): globalThis.IntersectionObserver{
        return this.observer_;
    }

    public GetTarget(): HTMLElement{
        return this.target_;
    }

    public GetOptions(): IntersectionObserverInit{
        return this.options_;
    }

    public AddHandler(handler: IntersectionObserverHandlerType): void{
        this.handlers_.push(handler);
    }

    public RemoveHandler(handler: IntersectionObserverHandlerType): void{
        this.handlers_.splice(this.handlers_.findIndex(item => (item === handler)), 1);
    }

    public Start(handler?: IntersectionObserverHandlerType): void{
        if (!this.isObserving_){
            if (handler){
                this.AddHandler(handler);
            }
            
            this.isObserving_ = true;
            this.observer_.observe(this.target_);
        }
    }

    public Stop(): void{
        if (this.isObserving_){
            this.observer_.unobserve(this.target_);
            this.isObserving_ = false;
        }
    }

    public static BuildOptions(value: any){
        let options: IntersectionObserverInit = {
            root: null,
            rootMargin: '0px',
            threshold: 0,
        };

        if (Region.IsObject(value)){
            Object.entries(value).forEach(([key, entry]) => {
                if (key in options){
                    if (key === 'root' && !(entry instanceof HTMLElement)){
                        let query = Region.ToString(entry);
                        options[key] = (query ? document.querySelector(query) : null);
                    }
                    else{
                        options[key] = entry;
                    }
                }
            });
        }

        return options;
    }
}
