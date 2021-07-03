import {
    IChanges,
    IRegion,
    ChangeCallbackType,
    IChange,
    IBubbledChange,
    ISubscriberInfo,
    IGetAccessStorage,
    IGetAccessInfo,
    GetAccessHookType
} from './typedefs'

import { Stack } from './stack'

export interface ChangeBatchInfo{
    callback: ChangeCallbackType;
    changes: Array<IChange | IBubbledChange>;
}

export interface GetAccessStorageInfo{
    storage: IGetAccessStorage;
    lastAccessPath: string;
}

export class Changes implements IChanges{
    private isScheduled_ = false;
    private list_ = new Array<IChange | IBubbledChange>();
    
    private subscriberId_: number = null;
    private subscribers_: Record<string, ISubscriberInfo> = {};
    private subscriptionCallbacks_: Record<string, Record<string, ChangeCallbackType>> = {};

    private getAccessStorages_ = new Stack<GetAccessStorageInfo>();
    private getAccessHooks_ = new Stack<GetAccessHookType>();
    private origins_ = new Stack<ChangeCallbackType>();
    
    public constructor (private regionId_: string, private regionFinder_: (id: string) => IRegion, private currentRegionGetter_: (id: string) => IRegion){}

    public GetRegionId(){
        return this.regionId_;
    }

    public Schedule(){
        if (this.isScheduled_){
            return;
        }
        
        this.isScheduled_ = true;
        setTimeout(() => {//Schedule changes
            this.isScheduled_ = false;
            if (0 < this.list_.length){
                let list = this.list_, batches = new Array<ChangeBatchInfo>();
                this.list_ = new Array<IChange | IBubbledChange>();
        
                list.forEach((item) => {
                    if (item.path in this.subscriptionCallbacks_){
                        let subscriptionCallbacks = this.subscriptionCallbacks_[item.path];
                        Object.keys(subscriptionCallbacks).forEach((key) => {
                            if (subscriptionCallbacks[key] !== Changes.GetOrigin(item)){//Ignore originating callback
                                Changes.AddBatch(batches, item, subscriptionCallbacks[key]);
                            }
                        });
                    }
                });
                
                batches.forEach(batch => batch.callback(batch.changes));
            }

            let region = this.regionFinder_(this.regionId_);
            if (region){
                region.ExecuteNextTick();
            }
        }, 0);
    }

    public Add(item: IChange | IBubbledChange): void{
        this.list_.push(item);
        this.Schedule();
    }

    public AddComposed(prop: string, prefix?: string, targetPath?: string, regionId?: string): void{
        let change: IChange = {
            regionId: (regionId || this.regionId_),
            type: 'set',
            path: (prefix ? `${prefix}.${prop}` : prop),
            prop: prop,
            origin: this.GetOrigin(),
        };

        if (targetPath){
            this.Add({
                original: change,
                path: targetPath,
            });
        }
        else{
            this.Add(change);
        }
    }

    public Subscribe(path: string, callback: ChangeCallbackType): string{
        let id: string;
        if (this.subscriberId_ === null){
            id = `sub_${(this.subscriberId_ = 0)}`;
        }
        else{
            id = `sub_${++this.subscriberId_}`;
        }

        let region = this.currentRegionGetter_(this.regionId_);
        if (region){//Check for a context element
            let contextElement = region.GetState().GetElementContext();
            if (contextElement){//Add reference
                let scope = region.AddElement(contextElement, true);
                if (scope){
                    scope.changeRefs.push({
                        regionId: region.GetId(),
                        subscriptionId: id
                    });
                }
            }
        }

        (this.subscriptionCallbacks_[path] = (this.subscriptionCallbacks_[path] || {}))[id] = callback;
        this.subscribers_[id] = {
            path: path,
            callback: callback,
        };

        return id;
    }

    public Unsubscribe(id: string){
        if (id in this.subscribers_){
            delete this.subscriptionCallbacks_[this.subscribers_[id].path][id];
            delete this.subscribers_[id];
        }
    }

    public AddGetAccess(path: string){
        let region = this.currentRegionGetter_(this.regionId_);
        if (!region){
            return;
        }
        
        let hook = (region.GetChanges() as Changes).getAccessHooks_.Peek();
        if (hook && !hook(region.GetId(), path)){//Rejected
            return;
        }
        
        let storageInfo = (region.GetChanges() as Changes).getAccessStorages_.Peek();
        if (!storageInfo || !storageInfo.storage){
            return;
        }

        if (storageInfo.storage.raw){
            storageInfo.storage.raw.push({
                regionId: this.regionId_,
                path: path
            });
        }

        if (!storageInfo.storage.optimized){
            return;
        }
        
        let optimized = storageInfo.storage.optimized;
        if (storageInfo.lastAccessPath && 0 < optimized.length && storageInfo.lastAccessPath.length < path.length &&
            1 < (path.match(/\./g) || []).length && path.substr(0, storageInfo.lastAccessPath.length) === storageInfo.lastAccessPath){//Deeper access
            optimized[(optimized.length - 1)].path = path;
        }
        else{//New entry
            optimized.push({
                regionId: this.regionId_,
                path: path
            });
        }

        storageInfo.lastAccessPath = path;
    }

    public ReplaceOptimizedGetAccesses(){
        if (!this.regionFinder_(this.regionId_).GetConfig().IsOptimizedBinds()){
            return;
        }
        
        let info = this.getAccessStorages_.Peek();
        if (info && info.storage && info.storage.raw){
            info.storage.optimized = new Array<IGetAccessInfo>();
            info.storage.raw.forEach(item => info.storage.optimized.push(item));
        }
    }

    public FlushRawGetAccesses(){
        if (!this.regionFinder_(this.regionId_).GetConfig().IsOptimizedBinds()){
            return;
        }

        let info = this.getAccessStorages_.Peek();
        if (info && info.storage && info.storage.raw){
            info.storage.raw = [];
        }
    }

    public AddGetAccessesCheckpoint(){
        let info = this.getAccessStorages_.Peek();
        if (!info || !info.storage){
            return;
        }
        
        if (info.storage.optimized){
            info.storage.checkpoint.optimized = info.storage.optimized.length;
        }

        if (info.storage.raw){
            info.storage.checkpoint.raw = info.storage.raw.length;
        }
    }

    public DiscardGetAccessesCheckpoint(){
        let info = this.getAccessStorages_.Peek();
        if (!info || !info.storage){
            return;
        }
        
        if (info.storage.optimized && info.storage.checkpoint.optimized != -1 && info.storage.checkpoint.optimized < info.storage.optimized.length){
            info.storage.optimized.splice(info.storage.checkpoint.optimized);
        }

        if (info.storage.raw && info.storage.checkpoint.raw != -1 && info.storage.checkpoint.raw < info.storage.raw.length){
            info.storage.raw.splice(info.storage.checkpoint.raw);
        }

        info.storage.checkpoint.optimized = -1;
        info.storage.checkpoint.raw = -1;
    }

    public PushGetAccessStorage(storage: IGetAccessStorage): void{
        this.getAccessStorages_.Push({
            storage: (storage || {
                optimized: (this.regionFinder_(this.regionId_).IsOptimizedBinds() ? new Array<IGetAccessInfo>() : null),
                raw: new Array<IGetAccessInfo>(),
                checkpoint: {
                    optimized: -1,
                    raw: -1,
                }
            }),
            lastAccessPath: '',
        });
    }

    public RetrieveGetAccessStorage(optimized: false): IGetAccessStorage;
    public RetrieveGetAccessStorage(optimized: true): Array<IGetAccessInfo>;
    public RetrieveGetAccessStorage(optimized = true){
        let info = this.getAccessStorages_.Peek();
        return ((info && info.storage) ? (optimized ? (info.storage.optimized || info.storage.raw) : info.storage) : null);
    }

    public PopGetAccessStorage(optimized: false): IGetAccessStorage;
    public PopGetAccessStorage(optimized: true): Array<IGetAccessInfo>;
    public PopGetAccessStorage(optimized: boolean){
        let info = this.getAccessStorages_.Pop();
        return ((info && info.storage) ? (optimized ? (info.storage.optimized || info.storage.raw) : info.storage) : null);
    }

    public PushGetAccessHook(hook: GetAccessHookType): void{
        this.getAccessHooks_.Push(hook);
    }

    public RetrieveGetAccessHook(): GetAccessHookType{
        return this.getAccessHooks_.Peek();
    }

    public PopGetAccessHook(): GetAccessHookType{
        return this.getAccessHooks_.Pop();
    }

    public PushOrigin(origin: ChangeCallbackType): void{
        this.origins_.Push(origin);
    }

    public GetOrigin(){
        return this.origins_.Peek();
    }

    public PopOrigin(){
        return this.origins_.Pop();
    }

    public static SetOrigin(change: IChange | IBubbledChange, origin: ChangeCallbackType){
        if ('original' in change){
            change.original.origin = origin;
        }
        else{
            change.origin = origin;
        }
    }

    public static GetOrigin(change: IChange | IBubbledChange){
        return (('original' in change) ? change.original.origin : change.origin);
    }

    public static AddBatch(batches: Array<ChangeBatchInfo>, change: IChange | IBubbledChange, callback: ChangeCallbackType){
        let batch = batches.find(info => (info.callback === callback));
        if (batch){
            batch.changes.push(change);
        }
        else{//Add new
            batches.push({
                callback: callback,
                changes: new Array(change)
            });
        }
    }
}
