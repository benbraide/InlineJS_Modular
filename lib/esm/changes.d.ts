import { IChanges, IRegion, ChangeCallbackType, IChange, IBubbledChange, IGetAccessStorage, IGetAccessInfo, GetAccessHookType } from './typedefs';
export interface ChangeBatchInfo {
    callback: ChangeCallbackType;
    changes: Array<IChange | IBubbledChange>;
}
export interface GetAccessStorageInfo {
    storage: IGetAccessStorage;
    lastAccessPath: string;
}
export declare class Changes implements IChanges {
    private regionId_;
    private regionFinder_;
    private currentRegionGetter_;
    private isScheduled_;
    private list_;
    private subscriberId_;
    private subscribers_;
    private subscriptionCallbacks_;
    private getAccessStorages_;
    private getAccessHooks_;
    private origins_;
    constructor(regionId_: string, regionFinder_: (id: string) => IRegion, currentRegionGetter_: (id: string) => IRegion);
    GetRegionId(): string;
    Schedule(): void;
    Add(item: IChange | IBubbledChange): void;
    AddComposed(prop: string, prefix?: string, targetPath?: string, regionId?: string): void;
    Subscribe(path: string, callback: ChangeCallbackType): string;
    Unsubscribe(id: string): void;
    AddGetAccess(path: string): void;
    ReplaceOptimizedGetAccesses(): void;
    FlushRawGetAccesses(): void;
    AddGetAccessesCheckpoint(): void;
    DiscardGetAccessesCheckpoint(): void;
    PushGetAccessStorage(storage: IGetAccessStorage): void;
    RetrieveGetAccessStorage(optimized: false): IGetAccessStorage;
    RetrieveGetAccessStorage(optimized: true): Array<IGetAccessInfo>;
    PopGetAccessStorage(optimized: false): IGetAccessStorage;
    PopGetAccessStorage(optimized: true): Array<IGetAccessInfo>;
    PushGetAccessHook(hook: GetAccessHookType): void;
    RetrieveGetAccessHook(): GetAccessHookType;
    PopGetAccessHook(): GetAccessHookType;
    PushOrigin(origin: ChangeCallbackType): void;
    GetOrigin(): ChangeCallbackType;
    PopOrigin(): ChangeCallbackType;
    static SetOrigin(change: IChange | IBubbledChange, origin: ChangeCallbackType): void;
    static GetOrigin(change: IChange | IBubbledChange): any;
    static AddBatch(batches: Array<ChangeBatchInfo>, change: IChange | IBubbledChange, callback: ChangeCallbackType): void;
}
