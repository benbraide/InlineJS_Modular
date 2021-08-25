import { IFetch, IRegion } from '../typedefs'
import { Region } from '../region'
import { DirectiveHandler } from '../directives/generic'

export enum FetchMode{
    Replace,
    Append,
    Prepend,
}

export interface FetchHandlers{
    onLoad?: (data?: any) => void;
    onError?: (err: any) => void;
    onProgress?: (value: number) => void;
    onEmptyMount?: () => void;
    onPropGet?: (prop: string) => void | any;
    onPropSet?: (prop: string, value?: any) => void;
    onBeforePropGet?: (prop: string) => boolean;
    onBeforePropSet?: (prop: string, value?: any) => boolean;
    onBeforeRequest?: (url?: string, mode?: FetchMode) => void;
}

export interface FetchProps{
    mode: FetchMode;
    mount: HTMLElement;
    url: string;
    handlers: FetchHandlers;
}

export class Fetch implements IFetch{
    public props: FetchProps = null;

    private overlapCheckpoint_ = 0;
    private onPropSet_: (prop: string) => void = null;
    
    public constructor(private url_ = '', private mount_: HTMLElement = null, private handlers_: FetchHandlers = null, private mode_ = FetchMode.Replace, private noOverlap_ = true){
        let handlersProxy = DirectiveHandler.CreateProxy((prop) => {
            if (typeof prop !== 'string'){
                return null;
            }

            if (prop in this.handlers_){
                this.AlertAccess_(`handlers.${prop}`, true);
                return this.handlers_[prop];
            }
        }, Object.keys(this.handlers_), (prop, value) => {
            if (typeof prop === 'string'){
                if (this.handlers_.onBeforePropSet && !this.handlers_.onBeforePropSet(`handlers.${prop}`, value)){
                    return false;
                }

                if (prop in this.handlers_ && value !== this.handlers_[prop]){
                    this.handlers_[prop] = value;
                    this.AlertAccess_(`handlers.${prop}`, false, value);
                }
            }
            
            return true;
        });
        
        let proxy = DirectiveHandler.CreateProxy((prop) => {
            if (typeof prop !== 'string'){
                return null;
            }

            let response = (this.handlers_.onBeforePropGet ? (this.handlers_.onBeforePropGet(prop) ? true : false) : null);
            if (response === false){
                return null;
            }
            
            if (prop === 'url'){
                this.AlertAccess_(prop, true);
                return this.url_;
            }
            else if (prop === 'mount'){
                this.AlertAccess_(prop, true);
                return this.mount_;
            }
            else if (prop === 'handlers'){
                this.AlertAccess_(prop, true);
                return handlersProxy;
            }
            else if (prop === 'mode'){
                this.AlertAccess_(prop, true);
                return this.mode_;
            }
            else if (response && this.handlers_.onPropGet){
                try{
                    return this.handlers_.onPropGet(prop);
                }
                catch{}
            }

            return null;
        }, ['url', 'mount', 'handlers', 'mode'], (prop, value) => {
            if (typeof prop !== 'string'){
                return true;
            }

            return this.SetProp_(prop, value);
        });

        this.props = proxy;
    }

    public Reload(): void{
        this.SetProp_('url', this.url_, true);
    }

    public SetProp(prop: string, value: any, force = true): void{
        this.SetProp_(prop, value, force);
    }

    public Get(region?: IRegion): Promise<any>{
        let promise: Promise<any> = null;
        if (!this.url_){//No loading
            if (this.url_ === ''){//Remove children
                this.EmptyMount_();
            }
        }
        else if (this.mount_){
            if (this.mount_ instanceof HTMLSelectElement){
                this.GetList_((item) => {
                    if (Region.IsObject(item) && 'value' in item && 'text' in item){
                        let entry = document.createElement('option');
    
                        entry.value = item['value'];
                        entry.textContent = item['text'];
    
                        this.mount_.appendChild(entry);
                    }
                }, null, region);
            }
            else if (this.mount_ instanceof HTMLUListElement || this.mount_ instanceof HTMLOListElement){
                this.GetList_((item) => {
                    let entry = document.createElement('li');
                    entry.textContent = DirectiveHandler.ToString(item);
                    this.mount_.appendChild(entry);
                }, null, region);
            }
            else if (this.mount_ instanceof HTMLImageElement || this.mount_ instanceof HTMLIFrameElement){
                let onEvent = () => {
                    this.mount_.removeEventListener('load', onEvent);
                    if (this.handlers_.onLoad){
                        this.handlers_.onLoad();
                    }
                };
                
                this.mount_.addEventListener('load', onEvent);
                this.mount_.src = this.url_;
            }
            else{//Other
                let regionId = region?.GetId();
                this.Get_(false, (response) => {
                    Region.InsertHtml(this.mount_, DirectiveHandler.ToString(response), (this.mode_ == FetchMode.Replace), (this.mode_ == FetchMode.Append), Region.Get(regionId));
                });
            }
        }
        else if (this.handlers_.onLoad){
            this.Get_(false);
        }
        else{//No load handler
            promise = new Promise<any>((resolve, reject) => {
                this.Get_(false, resolve, reject);
            });
        }

        return promise;
    }

    public Watch(region?: IRegion, get = true): void{
        if (this.onPropSet_){//Already watching
            return;
        }

        let regionId = region?.GetId();
        this.onPropSet_ = (prop) => {
            if (prop === 'url'){
                this.Get(Region.Get(regionId));
            }
        };

        if (get){
            this.Get();
        }
    };

    public EndWatch(): void{
        this.onPropSet_ = null;
    }

    private EmptyMount_(){
        if (!this.mount_ || !this.mount_.firstElementChild){
            return;
        }

        while (this.mount_.firstElementChild){
            Region.RemoveElement(this.mount_.firstElementChild as HTMLElement);
            this.mount_.removeChild(this.mount_.firstElementChild);
        }

        try{
            if (this.handlers_.onEmptyMount){
                this.handlers_.onEmptyMount();
            }
        }
        catch{}
    }

    private Get_(tryJson: boolean, onLoad?: (response: any) => void, onError?: (err?: any) => void){
        let request = new XMLHttpRequest(), checkpoint = (this.noOverlap_ ? ++this.overlapCheckpoint_ : null), onProgress = this.handlers_.onProgress;
        if (onProgress){//Bind on progress
            request.addEventListener('progress', (e) => {
                try{
                    if ((checkpoint === null || checkpoint == this.overlapCheckpoint_) && e.lengthComputable){
                        onProgress((e.loaded / e.total) * 100);
                    }
                }
                catch{}
            });
        }

        request.addEventListener('error', () => {
            if (checkpoint !== null && checkpoint != this.overlapCheckpoint_){
                return;
            }
            
            let err = {
                status: request.status,
                statusText: request.statusText,
            };

            try{
                if (onError){
                    onError(err);
                }
            }
            catch{}
            
            try{
                if (this.handlers_.onError){
                    this.handlers_.onError(err);
                }
            }
            catch{}
        });

        request.addEventListener('load', () => {
            if (checkpoint !== null && checkpoint != this.overlapCheckpoint_){
                return;
            }
            
            let parsedData: any;
            try{
                if (tryJson){
                    parsedData = JSON.parse(request.responseText);    
                    if (Region.Alert(parsedData)){
                        return;
                    }
                }
                else{
                    parsedData = request.responseText;
                }
            }
            catch{
                parsedData = request.responseText;
            }

            try{
                if (onLoad){
                    onLoad(parsedData);
                }
            }
            catch{}
            
            try{
                if (this.handlers_.onLoad){
                    this.handlers_.onLoad(parsedData);
                }
            }
            catch{}
        });

        try{
            if (this.handlers_.onBeforeRequest){
                this.handlers_.onBeforeRequest(this.url_, this.mode_);
            }
        }
        catch{}

        request.open('GET', this.url_);
        request.send();

        return request;
    }

    private GetList_(onLoad?: (item: any, isArray?: boolean) => void, onError?: (err?: any) => void, region?: IRegion){
        let regionId = region?.GetId();
        this.Get_(true, (response) => {
            if (Array.isArray(response)){
                response.forEach((item) => {
                    onLoad(item, true);
                });
            }
            else if (this.mount_){
                Region.InsertHtml(this.mount_, DirectiveHandler.ToString(response), (this.mode_ == FetchMode.Replace), (this.mode_ == FetchMode.Append), Region.Get(regionId));
            }
            else if (onLoad){
                onLoad(DirectiveHandler.ToString(response), false);
            }
        }, onError);
    }

    private SetProp_(prop: string, value: any, force = false){
        let response = (this.handlers_.onBeforePropSet ? (this.handlers_.onBeforePropSet(prop, value) ? true : false) : null);
        if (response === false){
            return false;
        }
        
        if (prop === 'url'){
            if (typeof value === 'string' && (value = value.trim()) !== this.url_ || force){
                this.url_ = value;
                this.AlertAccess_(prop, false, value);
            }
            else if ((value === null || value === undefined) && (value !== this.url_ || force)){
                this.url_ = value;
                this.AlertAccess_(prop, false, value);
            }
        }
        else if (prop === 'mount'){
            if (force || value !== this.mount_){
                this.mount_ = value;
                this.AlertAccess_(prop, false, value);
            }
        }
        else if (prop === 'handlers'){
            if (force || value !== this.handlers_){
                this.handlers_ = value;
                this.AlertAccess_(prop, false, value);
            }
        }
        else if (prop === 'mode'){
            let mode: FetchMode = null;
            if (typeof value === 'number'){
                if (value == 0){
                    mode = FetchMode.Replace;
                }
                else if (value == 1){
                    mode = FetchMode.Append;
                }
                else if (value == 2){
                    mode = FetchMode.Prepend;
                }
            }
            else if (typeof value === 'string'){
                if (value === 'replace'){
                    mode = FetchMode.Replace;
                }
                else if (value == 'append'){
                    mode = FetchMode.Append;
                }
                else if (value == 'prepend'){
                    mode = FetchMode.Prepend;
                }
            }

            if (mode !== null && (force || mode !== this.mode_)){
                this.mode_ = mode;
                this.AlertAccess_(prop, false, mode);
            }
        }
        else if (response && this.handlers_.onPropSet){
            try{
                this.handlers_.onPropSet(prop, value);
            }
            catch{}
        }

        return true;
    }

    private AlertAccess_(prop: string, isGet: boolean, value?: any){
        if (!isGet){
            if (this.handlers_.onPropSet){
                try{
                    this.handlers_.onPropSet(prop, value);
                }
                catch{}
            }

            if (this.onPropSet_){
                this.onPropSet_(prop);
            }
        }
        else if (this.handlers_.onPropGet){
            try{
                this.handlers_.onPropGet(prop);
            }
            catch{}
        }
    }
    
    public static HandleJsonResponse(response: Response){
        if (response.ok){
            return response.json();
        }

        let alertHandler = Region.GetAlertHandler();
        if (alertHandler){
            alertHandler.ServerError({
                status: response.status,
                statusText: response.statusText,
            });
        }
    }

    public static HandleTextResponse(response: Response){
        if (response.ok){
            return response.text();
        }

        let alertHandler = Region.GetAlertHandler();
        if (alertHandler){
            alertHandler.ServerError({
                status: response.status,
                statusText: response.statusText,
            });
        }
    }
}
