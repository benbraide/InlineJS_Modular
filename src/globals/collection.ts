import { GlobalHandler } from './generic'
import { Region } from '../region'
import { DirectiveHandlerReturn, IAuthGlobalHandler, IDirective, IRegion } from '../typedefs';
import { ExtendedDirectiveHandler } from '../directives/extended/generic';

export interface CollectionItem<EntryType>{
    quantity: number;
    entry: EntryType;
}

export interface CollectionStoredItem<EntryType>{
    quantity: number;
    entry: EntryType;
}

export interface CollectionOptions<EntryType>{
    idKey: string;
    idKeyPlural?: string;
    entryName?: string;
    entryNamePlural?: string;
    caches?: Record<string, (items?: Array<CollectionItem<EntryType>>) => any>;
    props?: Record<string, any>;
    itemsPath?: string;
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

            if (directive.arg.key === 'insert' || directive.arg.key === 'delete'){
                return region.ForwardEventBinding(element, directive.value, [...directive.arg.options, 'window'], `${this.key_}.${directive.arg.key}`);
            }

            return DirectiveHandlerReturn.Handled;
        });
    }
}

export class CollectionGlobalHandler<EntryType> extends GlobalHandler{
    protected listProxy_ = null;
    protected keyedProxy_ = null;

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
        afterUpdate: null,
    };
    
    protected items_ = new Array<CollectionItem<EntryType>>();
    protected proxies_ = new Array<any>();

    protected entryKeys_: Array<string> = null;
    protected defaultEntryKeys_: Array<string>;

    protected count_ = 0;
    protected cached_: Record<string, any> = {};
    protected queuedRequests_: Array<() => void> = null;

    public constructor(key: string, protected auth_: IAuthGlobalHandler, options: CollectionOptions<EntryType>){
        super(key, null, null, () => {
            Region.GetDirectiveManager().AddHandler(new CollectionDirectiveHandler(this));
            
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop in this.options_.caches){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.cached.${prop}`);
                    return ((prop in this.cached_) ? this.cached_[prop] : null);
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
                    return this.listProxy_;
                }

                if (prop === 'keyed'){
                    GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.${prop}`);
                    return this.keyedProxy_;
                }

                if (prop === 'contains'){
                    return (key: any) => {
                        GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.items`);
                        return (this.items_.findIndex(item => Region.IsEqual(item.entry[this.options_.idKey], key)) != -1);
                    };
                }

                if (prop === 'put'){
                    return (entry: EntryType, quantity = 1, incremental = true) => this.PutItem_(entry, quantity, incremental);
                }

                if (prop === 'update'){
                    return (entry: EntryType, quantity: number, incremental = true) => this.UpdateItem_(entry, quantity, incremental);
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
                    return (items?: Array<CollectionItem<EntryType>>) => this.Reload_(items);
                }

                if (prop === 'setOption'){
                    return (key: string, value: any) => {
                        if (key in this.options_){
                            this.options_[key] = value;
                        }
                    };
                }
            }, ['count', 'items', 'keyed', 'contains', 'put', 'update', 'remove', 'clear', 'import', 'export', 'reload', 'setOption', ...Object.keys(this.options_.props)]);

            this.listProxy_ = Region.CreateProxy((prop) => {
                if (prop === '__InlineJS_Target__'){
                    return this.proxies_;
                }

                if (prop === '__InlineJS_Path__'){
                    return `${this.scopeId_}.items`;
                }
                
                return this.proxies_[prop];
            }, ['__InlineJS_Target__', '__InlineJS_Path__'], null, []);

            this.keyedProxy_ = Region.CreateProxy((prop) => {
                GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.items.${prop}`);
                let index = this.FindItem_(prop);
                return ((index == -1) ? null : this.proxies_[index]);
            }, []);
        }, () => {
            this.listProxy_ = null;
            this.proxy_ = null;
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });

        this.scopeId_ = GlobalHandler.region_.GenerateDirectiveScopeId(null, `_${this.key_}`);
        Object.entries(options).forEach(([key, value]) => {
            if (key in this.options_){
                this.options_[key] = value;
            }
        });

        this.defaultEntryKeys_ = [options.idKey, 'title', 'avatar', 'price'];
    }

    protected PutItem_(entry: EntryType, quantity = 1, incremental = true){
        this.UpdateItem_(entry, quantity, incremental, null, null, false);
    }

    protected RemoveItem_(entry: EntryType){
        this.UpdateItem_(entry, 0, false);
    }

    protected UpdateItem_(entry: EntryType, quantity: number, incremental = true, changes?: Array<() => void>, updates?: Array<any>, save = true){
        if (this.queuedRequests_){
            this.queuedRequests_.push(() => {
                this.UpdateItem_(entry, quantity, incremental);
            });
            return;
        }
        
        let idValue = entry[this.options_.idKey], index = this.FindItem_(idValue), item: CollectionItem<EntryType>, proxy: any;
        if (index == -1){//Create new
            item = {
                quantity: 0,
                entry: entry,
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
                GlobalHandler.region_.GetChanges().AddComposed(idValue, `${this.scopeId_}.items`);
                GlobalHandler.region_.GetChanges().AddComposed(`${index}.1.0`, `${this.scopeId_}.items.splice`, `${this.scopeId_}.items`);
                GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);
            }
            else{
                changes.push(() => {
                    GlobalHandler.region_.GetChanges().AddComposed(`${index}.1.0`, `${this.scopeId_}.items.splice`, `${this.scopeId_}.items`);
                });
            }

            window.dispatchEvent(new CustomEvent(`${this.key_}.delete`, {
                detail: {
                    entry: entry,
                },
            }));

            window.dispatchEvent(new CustomEvent(`${this.key_}.update`, {
                detail: {
                    action: 'delete',
                    entry: entry,
                },
            }));
        }
        else if (index == -1){//Add to list
            this.items_.unshift(item);
            this.proxies_.unshift(proxy);

            if (!changes){
                GlobalHandler.region_.GetChanges().AddComposed('quantity', `${this.scopeId_}.items.${idValue}`);
                GlobalHandler.region_.GetChanges().AddComposed(idValue, `${this.scopeId_}.items`);
                
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

            window.dispatchEvent(new CustomEvent(`${this.key_}.insert`, {
                detail: {
                    entry: entry,
                    quantity: item.quantity,
                },
            }));

            window.dispatchEvent(new CustomEvent(`${this.key_}.update`, {
                detail: {
                    action: 'insert',
                    entry: entry,
                    quantity: item.quantity,
                },
            }));
        }
        else{//Alert
            GlobalHandler.region_.GetChanges().AddComposed('quantity', `${this.scopeId_}.items.${idValue}`);
            GlobalHandler.region_.GetChanges().AddComposed(idValue, `${this.scopeId_}.items`);

            window.dispatchEvent(new CustomEvent(`${this.key_}.update`, {
                detail: {
                    action: 'increment',
                    entry: entry,
                    quantity: item.quantity,
                },
            }));
        }

        if (changes){
            return;
        }

        if (this.options_.afterUpdate){
            this.options_.afterUpdate(this.items_);
        }
        
        this.Recache_();
        if (!save){
            return;
        }

        if (this.auth_ && this.auth_.Check()){
            fetch(this.auth_.BuildPath(this.options_.itemsPath || this.key_), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded',
                },
                body: `${this.options_.idKey}=${idValue}&quantity=${quantity}&incremental=${incremental ? 1 : 0}`,
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
        
        this.Recache_();
        if (this.auth_ && this.auth_.Check()){
            let body = new FormData();

            body.append('_method', 'DELETE');
            fetch(this.auth_.BuildPath(this.options_.itemsPath || this.key_), {
                method: 'POST',
                credentials: 'same-origin',
                body: body,
            });
        }
        else{//Use database
            this.WriteToDatabase_();
        }
    }

    protected Import_(items: Array<CollectionItem<EntryType>>, incremental = true){
        if (this.queuedRequests_){
            this.queuedRequests_.push(() => {
                this.Import_(items, incremental);
            });
            return;
        }
        
        if (items.length == 0){//Nothing to import
            return;
        }
        
        let changes = new Array<() => void>(), updates = new Array<any>(), count = this.count_;
        items.forEach (item => this.UpdateItem_(item.entry, item.quantity, incremental, changes, updates));

        changes.forEach(change => change());
        if (this.count_ != count){//Count changed
            GlobalHandler.region_.GetChanges().AddComposed('count', this.scopeId_);
        }

        if (updates.length > 0){//items changed
            GlobalHandler.region_.GetChanges().AddComposed('items', this.scopeId_);
        }

        if (this.options_.afterUpdate){
            this.options_.afterUpdate(this.items_);
        }
        
        this.Recache_();
        if (this.auth_ && this.auth_.Check()){
            let params = '', key = (this.options_.idKeyPlural || `${this.options_.idKey}s`);
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

            fetch(this.auth_.BuildPath(this.options_.itemsPath || this.key_), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded',
                },
                body: `${params}&${quantityParams}&incremental=${incremental ? 1 : 0}`,
            });
        }
        else{//Use database
            this.WriteToDatabase_();
        }
    }

    protected Export_(withEntryInfo = false){
        if (this.queuedRequests_){
            this.queuedRequests_.push(() => {
                this.Export_(withEntryInfo);
            });
            return;
        }
        
        if (withEntryInfo){
            return this.items_.map(item => ({...item}));
        }

        return this.items_.map((item) => {
            let info = {
                quantity: item.quantity,
                entry: <EntryType>{},
            };

            info.entry[this.options_.idKey] = item.entry[this.options_.idKey];
            return info;
        });
    }

    protected GetIdValue_(entry: EntryType){
        return ((this.options_.idKey in entry) ? entry[this.options_.idKey] : null);
    }

    protected FindItem_(idValue: any){
        return this.items_.findIndex((item) => ((this.options_.idKey in item.entry) && item.entry[this.options_.idKey] === idValue));
    }

    protected CreateItemProxy_(item: CollectionItem<EntryType>){
        let idValue = this.GetIdValue_(item.entry);
        return Region.CreateProxy((prop) => {
            if (prop === 'quantity'){
                GlobalHandler.region_.GetChanges().AddGetAccess(`${this.scopeId_}.items.${idValue}.${prop}`);
                return item.quantity;
            }
            
            if (prop === (this.options_.entryName || 'entry')){
                return item.entry;
            }
        }, ['quantity', (this.options_.entryName || 'entry')]);
    }

    protected Reload_(items?: Array<CollectionItem<EntryType>>){
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

        if (Array.isArray(items)){
            this.items_ = items.map((item) => {
                return <CollectionItem<EntryType>>{
                    quantity: item.quantity,
                    entry: item[this.options_.entryName || 'entry'],
                };
            });
            
            this.proxies_ = this.items_.map(item => this.CreateItemProxy_(item));
            this.OnLoad_();

            return;
        }
        
        this.queuedRequests_ = new Array<() => void>();
        if (this.auth_ && this.auth_.Check()){
            fetch(this.auth_.BuildPath(this.options_.itemsPath || this.key_), {
                method: 'GET',
                credentials: 'same-origin',
            }).then(response => response.json()).then((response) => {
                if (response && response['ok'] !== false && Array.isArray(response['data'])){
                    this.items_ = (response['data'] as Array<CollectionItem<EntryType>>).map((item) => {
                        return <CollectionItem<EntryType>>{
                            quantity: item.quantity,
                            entry: item[this.options_.entryName || 'entry'],
                        };
                    });
                    this.proxies_ = this.items_.map(item => this.CreateItemProxy_(item));
                }

                this.OnLoad_();
            }).catch(() => {
                this.OnLoad_();
            });
        }
        else{//Use database
            this.ReadFromDatabase_(() => this.OnLoad_());
        }
    }

    protected OnLoad_(){
        if (0 < this.items_.length){
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
        }

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

        if (this.options_.afterUpdate){
            this.options_.afterUpdate(this.items_);
        }

        this.Recache_();
    }

    protected WriteToDatabase_(){
        let items = this.items_.map((item) => {
            let entry = {};
            (this.entryKeys_ || this.defaultEntryKeys_).forEach((key) => (entry[key] = item.entry[key]));

            return ({
                quantity: item.quantity,
                entry: (entry as EntryType),
            } as CollectionStoredItem<EntryType>);
        });

        Region.GetDatabase().Write(this.GetDatabaseKey_(), items);
    }

    protected ReadFromDatabase_(callback: () => void){
        Region.GetDatabase().Read(this.GetDatabaseKey_(), (items: Array<CollectionStoredItem<EntryType>>) => {
            if (!items || items.length == 0){
                callback();
                return;
            }

            this.items_ = items.map((item) => {
                return {
                    quantity: item.quantity,
                    entry: item.entry,
                };
            });

            this.proxies_ = this.items_.map(item => this.CreateItemProxy_(item));
        }, callback);
    }

    protected BuildPath_(path: string){
        if (path.startsWith('/')){
            path = path.substr(1);
        }
        return (this.auth_ ? this.auth_.BuildPath(path) : `${this.origin_}/${path}`);
    }
    
    protected GetDatabaseKey_(){
        return `__InlineJS_Collection_${this.key_}__`;
    }

    protected Recache_(){
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
    }

    public GetCount(){
        return this.count_;
    }

    public GetItems(){
        return this.items_;
    }

    public UpdateItem(entry: EntryType, quantity: number, incremental = true){
        this.UpdateItem_(entry, quantity, incremental);
    }

    public RemoveItem(entry: EntryType){
        this.RemoveItem_(entry);
    }

    public Clear(){
        this.RemoveAll_();
    }

    public Import(items: Array<CollectionItem<EntryType>>, incremental = true){
        this.Import_(items, incremental);
    }

    public Export(withEntryInfo = false){
        return this.Export_(withEntryInfo);
    }

    public Reload(items?: Array<CollectionItem<EntryType>>){
        this.Reload_(items);
    }

    public GetOptions(){
        return this.options_;
    }
}
