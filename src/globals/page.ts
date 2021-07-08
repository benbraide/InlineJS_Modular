import { ExtendedPathInfo, IPageGlobalHandler, IRouterGlobalHandler, OnRouterLoadHandlerType } from '../typedefs'
import { GlobalHandler } from './generic'
import { Region } from '../region'

export class PageGlobalHandler extends GlobalHandler implements IPageGlobalHandler{
    private scopeId_: string;
    private proxy_ = null;
    private observer_: MutationObserver = null;

    private path_: ExtendedPathInfo = null;
    private persistent_ = false;

    private title_ = '';
    private titleDOM_: HTMLTitleElement = null;
    
    private data_: Record<string, any> = {};
    private nextData_: Record<string, any> = null;
    private onLoad_: OnRouterLoadHandlerType = null;
    
    public constructor(private router_: IRouterGlobalHandler){
        super('page', () => this.proxy_, null, null, () => {
            this.router_.BindOnLoad(this.onLoad_);
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'title'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.title_;
                }

                if (prop === 'persistent'){
                    return this.persistent_;
                }

                if (prop === 'path'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return {...this.path_};
                }

                if (prop === 'data'){
                    return this.data_;
                }

                if (prop === 'reload'){
                    return () => this.router_.Reload();
                }

                if (prop === 'refresh'){
                    return () => {
                        if (this.persistent_ && this.path_){
                            Region.GetDatabase().Write(this.path_.base, this.data_, () => window.location.reload(), () => window.location.reload());
                        }
                        else{
                            window.location.reload();
                        }
                    };
                }
            }, ['title', 'persistent', 'path', 'data', 'reload', 'refresh'], (target, prop, value) => {
                if (typeof prop !== 'string'){
                    return true;
                }
                
                if (prop === 'title'){
                    if (this.title_ !== value){
                        GlobalHandler.region_.GetChanges().AddComposed('title', this.scopeId_);
                        document.title = (this.title_ = value);
                    }
                }
                else if (prop === 'persistent'){
                    this.persistent_ = value;
                }

                return true;
            });

            this.titleDOM_ = document.querySelector('title');
            if (!this.titleDOM_){
                this.titleDOM_ = document.createElement('title');
                document.head.append(this.titleDOM_);
            }

            this.title_ = document.title;
            this.observer_.observe(this.titleDOM_, {
                subtree: true,
                characterData: true,
                childList: true,
            });
        }, () => {
            this.observer_.disconnect();
            this.proxy_ = null;
            this.router_.UnbindOnLoad(this.onLoad_);
        });

        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
        this.onLoad_ = (path, reloaded) => {
            let nextData = (this.nextData_ || {});
            if (this.persistent_){
                if (reloaded || (this.path_ && path.base === this.path_.base)){
                    if (!this.path_ || path.base !== this.path_.base || path.query !== this.path_.query){
                        GlobalHandler.region_.GetChanges().AddComposed('path', this.scopeId_);
                        this.path_ = path;
                    }
                    return;
                }

                Region.GetDatabase().Write(path.base, this.data_);
            }
            
            this.data_ = nextData;
            this.nextData_ = null;
            
            this.persistent_ = false;
            if (!this.path_ || path.base !== this.path_.base || path.query !== this.path_.query){
                GlobalHandler.region_.GetChanges().AddComposed('path', this.scopeId_);
                this.path_ = path;
            }
            
            Region.GetDatabase().Read(path.base, (data) => {
                if (Region.IsObject(data)){
                    this.persistent_ = true;
                    this.data_ = data;
                    Object.entries(nextData).forEach(([key, value]) => this.data_[key] = value);
                }
            });
        };

        this.observer_ = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target === this.titleDOM_ && this.titleDOM_.textContent !== this.title_){
                    GlobalHandler.region_.GetChanges().AddComposed('title', this.scopeId_);
                    this.title_ = this.titleDOM_.textContent;
                }
            });
        });
    }

    public SetNextPageData(data: Record<string, any>){
        this.nextData_ = (Region.IsObject(data) ? data : null);
    }
}
