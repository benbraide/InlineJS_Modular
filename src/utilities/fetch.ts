import { Region } from '../region'
import { DirectiveHandler } from '../directives/generic'

export interface FetchHandlers{
    onLoad?: (data?: any) => void;
    onUnload?: () => void;
    onError?: (err: any) => void;
    onProgress?: (e: ProgressEvent<XMLHttpRequestEventTarget>) => void;
    onEmptyMount?: () => void;
    onPropGet?: (prop: string) => void;
    onPropSet?: (prop: string, value?: any) => void;
    onBeforePropSet?: (prop: string, value?: any) => boolean;
}

export enum FetchMode{
    Replace,
    Append,
    Prepend,
}

export interface FetchProps{
    mode: FetchMode;
    mount: HTMLElement;
    url: string;
    handlers: FetchHandlers;
}

export class Fetch{
    public props: FetchProps = null;

    private onPropGet_: (prop: string) => void = null;
    
    public constructor(private url_ = '', private mount_: HTMLElement = null, private handlers_: FetchHandlers = null, private mode_ = FetchMode.Replace){
        let alertAccess = (prop: string, isGet: boolean, value?: any) => {
            if (isGet){
                if (this.handlers_.onPropGet){
                    try{
                        this.handlers_.onPropGet(prop);
                    }
                    catch{}
                }

                if (this.onPropGet_){
                    this.onPropGet_(prop);
                }
            }
            else if (this.handlers_.onPropSet){
                try{
                    this.handlers_.onPropSet(prop, value);
                }
                catch{}
            }
        };

        let handlersProxy = DirectiveHandler.CreateProxy((prop) => {
            if (typeof prop !== 'string'){
                return null;
            }

            if (prop in this.handlers_){
                alertAccess(`handlers.${prop}`, true);
                return this.handlers_[prop];
            }
        }, Object.keys(this.handlers_), (target, prop, value) => {
            if (typeof prop === 'string'){
                if (this.handlers_.onBeforePropSet && !this.handlers_.onBeforePropSet(`handlers.${prop}`, value)){
                    return false;
                }

                if (prop in this.handlers_ && value !== this.handlers_[prop]){
                    this.handlers_[prop] = value;
                    alertAccess(`handlers.${prop}`, false, value);
                }
            }
            
            return true;
        });
        
        let proxy = DirectiveHandler.CreateProxy((prop) => {
            if (typeof prop !== 'string'){
                return null;
            }
            
            if (prop === 'url'){
                alertAccess(prop, true);
                return this.url_;
            }
            else if (prop === 'mount'){
                alertAccess(prop, true);
                return this.mount_;
            }
            else if (prop === 'handlers'){
                alertAccess(prop, true);
                return handlersProxy;
            }
            else if (prop === 'mode'){
                alertAccess(prop, true);
                return this.mode_;
            }
        }, ['url', 'mount', 'handlers', 'mode'], (target, prop, value) => {
            if (typeof prop === 'string'){
                if (this.handlers_.onBeforePropSet && !this.handlers_.onBeforePropSet(prop, value)){
                    return false;
                }
                
                if (prop === 'url' && typeof value === 'string' && (value = value.trim()) !== this.url_){
                    this.url_ = value;
                    alertAccess(prop, false, value);
                }
                else if (prop === 'mount' && value !== this.mount_){
                    this.mount_ = value;
                    alertAccess(prop, false, value);
                }
                else if (prop === 'handlers' && value !== this.handlers_){
                    this.handlers_ = value;
                    alertAccess(prop, false, value);
                }
                else if (prop === 'mode'){
                    let mode: FetchMode = null;
                    if (typeof value === 'number'){
                        if (value == 1){
                            mode = FetchMode.Append;
                        }
                        else if (value == 2){
                            mode = FetchMode.Prepend;
                        }
                        else{
                            mode = FetchMode.Replace;
                        }
                    }
                    else if (typeof value === 'string'){
                        if (value == 'append'){
                            mode = FetchMode.Append;
                        }
                        else if (value == 'prepend'){
                            mode = FetchMode.Prepend;
                        }
                        else{
                            mode = FetchMode.Replace;
                        }
                    }

                    if (mode !== null && mode !== this.mode_){
                        this.mode_ = mode;
                        alertAccess(prop, false, mode);
                    }
                }
            }

            return true;
        });

        this.props = proxy;
    }

    public Get(): Promise<any>{
        let promise: Promise<any> = null;
        if (!this.url_){//Remove children
            this.EmptyMount_();
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
                });
            }
            else if (this.mount_ instanceof HTMLUListElement || this.mount_ instanceof HTMLOListElement){
                this.GetList_((item) => {
                    let entry = document.createElement('li');
                    entry.textContent = DirectiveHandler.ToString(item);
                    this.mount_.appendChild(entry);
                });
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
                this.Get_(false, (response) => {
                    Region.InsertHtml(this.mount_, DirectiveHandler.ToString(response), (this.mode_ == FetchMode.Replace), (this.mode_ == FetchMode.Append));
                });
            }
        }
        else if (this.handlers_.onLoad){
            this.Get_(false, this.handlers_.onLoad, this.handlers_.onError);
        }
        else{//No load handler
            promise = new Promise<any>((resolve, reject) => {
                this.Get_(false, resolve, reject);
            });
        }

        return promise;
    }

    public Watch(): void{
        if (this.onPropGet_){//Already watching
            return;
        }

        this.onPropGet_ = (prop) => {
            this.Get();
        };

        this.Get();
    };

    private EmptyMount_(){
        if (!this.mount_ || !this.mount_.firstElementChild){
            return;
        }

        while (this.mount_.firstElementChild){
            Region.RemoveElement(this.mount_.firstElementChild as HTMLElement);
            this.mount_.removeChild(this.mount_.firstElementChild);
        }

        if (this.handlers_.onEmptyMount){
            this.handlers_.onEmptyMount();
        }
    }

    private Get_(tryJson: boolean, onLoad?: (response: any) => void, onError?: (err?: any) => void){
        let request = new XMLHttpRequest();
        if (this.handlers_.onProgress){
            request.addEventListener('progress', this.handlers_.onProgress);
        }

        request.addEventListener('error', () => {
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

        request.open('GET', this.url_);
        request.send();

        return request;
    }

    private GetList_(onLoad?: (item: any, isArray?: boolean) => void, onError?: (err?: any) => void){
        this.Get_(true, (response) => {
            if (Array.isArray(response)){
                response.forEach((item) => {
                    onLoad(item, true);
                });
            }
            else if (this.mount_){
                Region.InsertHtml(this.mount_, DirectiveHandler.ToString(response), (this.mode_ == FetchMode.Replace), (this.mode_ == FetchMode.Append));
            }
            else if (onLoad){
                onLoad(DirectiveHandler.ToString(response), false);
            }
        }, onError);
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
