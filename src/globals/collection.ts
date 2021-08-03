import { GlobalHandler } from './generic'
import { Region } from '../region'
import { DirectiveHandlerReturn, IAuthGlobalHandler, IDirective, IRegion } from '../typedefs';
import { ExtendedDirectiveHandler } from '../directives/extended/generic';

export interface CollectionItem<EntryType>{
    quantity: number;
    entry: EntryType;
}

export interface CollectionStoredItem{
    quantity: number;
    idValue: any;
}

export interface CollectionOptions<EntryType>{
    idKey: string;
    idKeyPlural?: string;
    entryName?: string;
    entryNamePlural?: string;
    caches?: Record<string, (items?: Array<CollectionItem<EntryType>>) => any>;
    props?: Record<string, any>;
    itemsPath?: string;
    enttriesRetriever?: (idValues: Array<any>, callback: (data: Record<string, any>) => void) => void;
    afterUpdate?: (items?: Array<CollectionItem<EntryType>>) => void;
}

export class CollectionDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(global: GlobalHandler){
        super(global.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (!directive.arg || !directive.arg.key){
                return DirectiveHandlerReturn.Handled;
            }

            if (directive.arg.key === 'update' || ExtendedDirectiveHandler.IsEventRequest(directive.arg.key)){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.update`);
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class CollectionGlobalHandler<EntryType> extends GlobalHandler{
    protected listProxy_ = null;
    private origin_ = window.location.origin;
    
    protected scopeId_: string;
    protected options_: CollectionOptions<EntryType> = {
        idKey: '',
        idKeyPlural: '',
        entryName: '',
        entryNamePlural: '',
        caches: {},
        props: {},
        itemsPath: '',
        enttriesRetriever: null,
        afterUpdate: null,
    };
    
    protected items_ = new Array<CollectionItem<EntryType>>();
    protected proxies_ = new Array<any>();

    protected count_ = 0;
    protected cached_: Record<string, any> = {};
    protected queuedRequests_: Array<() => void> = null;

    public constructor(key: string, protected auth_: IAuthGlobalHandler, options: CollectionOptions<EntryType>){
        super(key, null, null, () => {
            Region.GetDirectiveManager().AddHandler(new CollectionDirectiveHandler(this));
            
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop in this.cached_){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.cached.${prop}`);
                    return this.cached_[prop];
                }

                if (prop in this.options_.props){
                    return this.options_.props[prop];
                }
                
                if (prop === 'count'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.count_;
                }

                if (prop === 'items'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.proxies_;
                }

                if (prop === 'update'){
                    return (quantity: number, idValue: any, incremental = true) => this.UpdateItem_(quantity, idValue, incremental);
                }

                if (prop === 'remove'){
                    return (idValue: any) => this.RemoveItem_(idValue);
                }

                if (prop === 'clear'){
                    return () => this.RemoveAll_();
                }

                if (prop === 'import'){
                    return (items: Array<CollectionItem<EntryType>>, incremental = true) => this.Import_(items, incremental);
                }

                if (prop === 'export'){
                    return (withEntryInfo = false) => this.Export_(withEntryInfo);
                }

                if (prop === 'reload'){
                    return () => this.Reload_();
                }

                if (prop === 'setOption'){
                    return (key: string, value: any) => {
                        if (key in this.options_){
                            this.options_[key] = value;
                        }
                    };
                }
            }, ['count', 'items', 'update', 'remove', 'clear', 'import', 'export', 'reload', 'setOption', ...Object.keys(this.options_.props)]);

            this.listProxy_ = Region.CreateProxy((prop) => {
                if (prop === '__InlineJS_Target__'){
                    return this.proxies_;
                }

                if (prop === '__InlineJS_Path__'){
                    return `${this.scopeId_}.items`;
                }

                return this.proxies_[prop];
            }, ['__InlineJS_Target__', '__InlineJS_Path__']);

            this.Reload_();
        }, () => {
            this.listProxy_ = null;
            this.proxy_ = null;
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });

        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
        this.options_.enttriesRetriever = (idValues, callback) => {
            let params = '', key = (this.options_.idKeyPlural || `${this.options_.idKey}s`);
            (Array.isArray(idValues) ? idValues : [idValues]).forEach((value) => {
                if (params){
                    params += `&${key}[]=${value}`;
                }
                else{//First item
                    params = `${key}[]=${value}`;
                }
            });

            let path = this.BuildPath_(this.options_.entryNamePlural || (this.options_.entryName ? `${this.options_.entryName}s` : 'entries'));
            fetch(`${path}?${params}`, {
                method: 'GET',
                credentials: 'same-origin',
            }).then(response => response.json()).then((response) => {
                if (response && response['ok'] !== false){
                    callback(response['data']);
                }
            });
        };
        
        Object.entries(options).forEach(([key, value]) => {
            if (key in this.options_){
                this.options_[key] = value;
            }
        });
    }

    protected RemoveItem_(idValue: any){
        this.UpdateItem_(0, idValue, false);
    }

    protected UpdateItem_(quantity: number, idValue: any, incremental = true, changes?: Array<() => void>, updates?: Array<any>){
        if (this.queuedRequests_){
            this.queuedRequests_.push(() => {
                this.UpdateItem_(quantity, idValue, incremental);
            });
            return;
        }
        
        let index = this.FindItem_(idValue), item: CollectionItem<EntryType>, proxy: any;
        if (index == -1){//Create new
            item = {
                quantity: 0,
                entry: this.BuildEntry(idValue),
            };
            proxy = this.CreateItemProxy_(item);
        }
        else{//Use existing
            item = this.items_[index];
            proxy = this.proxies_[index];
        }

        let previousQuantity = item.quantity;
        if (incremental){
            item.quantity += quantity;
        }
        else{//Assign
            item.quantity = quantity;
        }

        if (item.quantity == previousQuantity){//No changes
            return;
        }

        this.count_ += (item.quantity - previousQuantity);
        if (!changes){
            GlobalHandler.region_.GetChanges().AddComposed('count', this.scopeId_);
        }

        if (item.quantity == 0){//Remove from list
            this.items_.splice(index, 1);
            this.proxies_.splice(index, 1);

            if (!changes){
                GlobalHandler.region_.GetChanges().AddComposed(`${index}.1.0`, `${this.scopeId_}.items.splice`, `${this.scopeId_}.items`);
                GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);
            }
            else{
                changes.push(() => {
                    GlobalHandler.region_.GetChanges().AddComposed(`${index}.1.0`, `${this.scopeId_}.items.splice`, `${this.scopeId_}.items`);
                });
            }
        }
        else if (index == -1){//Add to list
            this.items_.unshift(item);
            this.proxies_.unshift(this.CreateItemProxy_(item));

            if (!changes){
                GlobalHandler.region_.GetChanges().AddComposed('1', `${this.scopeId_}.items.unshift`, `${this.scopeId_}.items`);
                GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);
            }
            else{
                changes.push(() => {
                    GlobalHandler.region_.GetChanges().AddComposed('1', `${this.scopeId_}.items.unshift`, `${this.scopeId_}.items`);
                });
            }

            if (updates){
                updates.push(idValue);
            }
            else{
                this.UpdateEntries_(idValue);
            }
        }
        else{//Alert
            GlobalHandler.region_.GetChanges().AddComposed('quantity', `${this.scopeId_}.${this.GetIdValue_(item.entry)}`);
        }

        if (changes){
            return;
        }

        if (this.options_.afterUpdate){
            this.options_.afterUpdate(this.items_);
        }
        
        this.cached_ = {};
        Object.entries(this.options_.caches).forEach(([key, value]) => {
            try{
                let evaluated = value(this.items_);
                if (!(key in this.cached_) || !Region.IsEqual(evaluated, this.cached_[key])){
                    this.cached_[key] = evaluated;
                    GlobalHandler.region_.GetChanges().AddComposed(key, `${this.scopeId_}.cached`);
                }
            }
            catch{}
        });

        if (this.auth_ && this.auth_.Check()){
            let path = this.auth_.BuildPath(this.options_.itemsPath || this.key_);
            fetch(`${path}/update?${this.options_.idKey}=${idValue}&quantity=${quantity}&incremental=${incremental ? 1 : 0}`, {
                method: 'GET',
                credentials: 'same-origin',
            });
        }
        else{//Use database
            this.WriteToDatabase_();
        }
    }

    protected RemoveAll_(){
        if (this.queuedRequests_){
            this.queuedRequests_.push(() => {
                this.RemoveAll_();
            });
            return;
        }

        if (this.items_.length == 0){//Nothing to remove
            return;
        }

        this.count_ = 0;
        GlobalHandler.region_.GetChanges().AddComposed('count', this.scopeId_);

        this.items_ = [];
        this.proxies_ = [];
        GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);

        if (this.options_.afterUpdate){
            this.options_.afterUpdate(this.items_);
        }
        
        this.cached_ = {};
        Object.entries(this.options_.caches).forEach(([key, value]) => {
            try{
                let evaluated = value(this.items_);
                if (!(key in this.cached_) || !Region.IsEqual(evaluated, this.cached_[key])){
                    this.cached_[key] = evaluated;
                    GlobalHandler.region_.GetChanges().AddComposed(key, `${this.scopeId_}.cached`);
                }
            }
            catch{}
        });

        if (this.auth_ && this.auth_.Check()){
            let path = this.auth_.BuildPath(this.options_.itemsPath || this.key_);
            fetch(`${path}/clear`, {
                method: 'GET',
                credentials: 'same-origin',
            });
        }
        else{//Use database
            this.WriteToDatabase_();
        }
    }

    protected Import_(items: Array<CollectionItem<EntryType>>, incremental = true){
        if (items.length == 0){//Nothing to import
            return;
        }
        
        let changes = new Array<() => void>(), updates = new Array<any>(), count = this.count_;
        items.forEach (item => this.UpdateItem_(item.quantity, this.GetIdValue_(item.entry), incremental, changes, updates));

        changes.forEach(change => change());
        this.UpdateEntries_(updates);

        if (this.count_ != count){//Count changed
            GlobalHandler.region_.GetChanges().AddComposed('count', this.scopeId_);
        }

        if (updates.length > 0){//items changed
            GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);
        }

        if (this.options_.afterUpdate){
            this.options_.afterUpdate(this.items_);
        }
        
        this.cached_ = {};
        Object.entries(this.options_.caches).forEach(([key, value]) => {
            try{
                let evaluated = value(this.items_);
                if (!(key in this.cached_) || !Region.IsEqual(evaluated, this.cached_[key])){
                    this.cached_[key] = evaluated;
                    GlobalHandler.region_.GetChanges().AddComposed(key, `${this.scopeId_}.cached`);
                }
            }
            catch{}
        });

        if (this.auth_ && this.auth_.Check()){
            let path = this.auth_.BuildPath(this.options_.itemsPath || this.key_), params = '', key = (this.options_.idKeyPlural || `${this.options_.idKey}s`);
            updates.forEach((value) => {
                if (params){
                    params += `&${key}[]=${value}`;
                }
                else{//First item
                    params = `${key}[]=${value}`;
                }
            });

            let quantityParams = '';
            items.forEach((item) => {
                if (params){
                    params += `&quantities[]=${item.quantity}`;
                }
                else{//First item
                    params = `quantities[]=${item.quantity}`;
                }
            });
            
            fetch(`${path}/update?${params}&${quantityParams}&incremental=${incremental ? 1 : 0}`, {
                method: 'GET',
                credentials: 'same-origin',
            });
        }
        else{//Use database
            this.WriteToDatabase_();
        }
    }

    protected Export_(withEntryInfo = false){
        if (withEntryInfo){
            return this.items_.map(item => ({...item}));
        }

        return this.items_.map((item) => {
            let info = {
                quantity: item.quantity,
            };

            info[this.options_.idKey] = item.entry[this.options_.idKey];
            return info;
        });
    }

    protected UpdateEntries_(idValues: Array<any> | any){
        if (this.options_.enttriesRetriever){
            this.options_.enttriesRetriever((Array.isArray(idValues) ? idValues : [idValues]), (data) => {
                this.items_.forEach((item) => {
                    let idValue = this.GetIdValue_(item.entry);
                    if (idValue in data){
                        item.entry = data[idValue];
                    }
                });
            });
        }
    }

    protected GetIdValue_(entry: EntryType){
        return ((this.options_.idKey in entry) ? entry[this.options_.idKey] : null);
    }

    protected BuildEntry(idValue: any): EntryType{
        let entry = {};
        entry[this.options_.idKey] = idValue;
        return (entry as EntryType);
    }

    protected FindItem_(idValue: any){
        return this.items_.findIndex((item) => ((this.options_.idKey in item.entry) && item.entry[this.options_.idKey] === idValue));
    }

    protected CreateItemProxy_(item: CollectionItem<EntryType>){
        let idValue = this.GetIdValue_(item.entry);
        return Region.CreateProxy((prop) => {
            if (prop === 'quantity'){
                GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${idValue}.${prop}`);
                return item.quantity;
            }
            
            if (prop === (this.options_.entryName || 'entry')){
                return item.entry;
            }
        }, ['quantity']);
    }

    protected Reload_(){
        this.cached_ = {};
        if (this.count_ != 0){
            this.count_ = 0;
            GlobalHandler.region_.GetChanges().AddComposed('count', this.scopeId_);
        }

        if (this.items_.length > 0){
            this.items_ = [];
            this.proxies_ = [];
            GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);
        }
        
        let onLoad = () => {
            if (this.items_.length <= 0){
                return;
            }

            GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);
            Object.entries(this.options_.caches).forEach(([key, value]) => {
                try{
                    let evaluated = value(this.items_);
                    if (!(key in this.cached_) || !Region.IsEqual(evaluated, this.cached_[key])){
                        this.cached_[key] = evaluated;
                        GlobalHandler.region_.GetChanges().AddComposed(key, `${this.scopeId_}.cached`);
                    }
                }
                catch{}
            });

            this.count_ = this.items_.reduce((prev, item) => (item.quantity + prev), 0);
            GlobalHandler.region_.GetChanges().AddComposed('count', this.scopeId_);

            if (this.queuedRequests_){
                let queued = this.queuedRequests_;

                this.queuedRequests_ = null;
                queued.forEach((request) => {
                    try{
                        request();
                    }
                    catch{}
                });
            }
        };
        
        this.queuedRequests_ = new Array<() => void>();
        if (this.auth_ && this.auth_.Check()){
            fetch(this.auth_.BuildPath(this.options_.itemsPath || this.key_), {
                method: 'GET',
                credentials: 'same-origin',
            }).then(response => response.json()).then((response) => {
                if (response && response['ok'] !== false){
                    this.items_ = response['data'];
                    this.listProxy_ = this.items_.map(item => this.CreateItemProxy_(item));
                }

                onLoad();
            }).catch(() => {
                onLoad();
            });
        }
        else{//Use database
            this.ReadFromDatabase_(onLoad);
        }
    }

    protected WriteToDatabase_(){
        let items = this.items_.map(item => ({
            quantity: item.quantity,
            idValue: this.GetIdValue_(item.entry)
        } as CollectionStoredItem));
        Region.GetDatabase().Write(this.GetDatabaseKey_(), items);
    }

    protected ReadFromDatabase_(callback: () => void){
        Region.GetDatabase().Read(this.GetDatabaseKey_(), (items: Array<CollectionStoredItem>) => {
            if (!items || items.length == 0){
                callback();
                return;
            }

            this.items_ = items.map((item) => {
                let info: CollectionItem<EntryType> = {
                    quantity: item.quantity,
                    entry: ({} as EntryType),
                };

                info.entry[this.options_.idKey] = item.idValue;
                return info;
            });

            this.listProxy_ = this.items_.map(item => this.CreateItemProxy_(item));
            this.UpdateEntries_(items.map(item => item.idValue));
        }, callback);
    }

    protected BuildPath_(path: string){
        return (this.auth_ ? this.auth_.BuildPath(path) : `${this.origin_}/${path}`);
    }
    
    protected GetDatabaseKey_(){
        return `__InlineJS_Collection_${this.key_}__`;
    }
}
