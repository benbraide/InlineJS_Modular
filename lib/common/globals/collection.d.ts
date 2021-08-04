import { GlobalHandler } from './generic';
import { IAuthGlobalHandler } from '../typedefs';
import { ExtendedDirectiveHandler } from '../directives/extended/generic';
export interface CollectionItem<EntryType> {
    quantity: number;
    entry: EntryType;
}
export interface CollectionStoredItem {
    quantity: number;
    idValue: any;
}
export interface CollectionOptions<EntryType> {
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
export declare class CollectionDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(global: GlobalHandler);
}
export declare class CollectionGlobalHandler<EntryType> extends GlobalHandler {
    protected auth_: IAuthGlobalHandler;
    protected listProxy_: any;
    private origin_;
    protected scopeId_: string;
    protected options_: CollectionOptions<EntryType>;
    protected items_: CollectionItem<EntryType>[];
    protected proxies_: any[];
    protected count_: number;
    protected cached_: Record<string, any>;
    protected queuedRequests_: Array<() => void>;
    constructor(key: string, auth_: IAuthGlobalHandler, options: CollectionOptions<EntryType>);
    protected RemoveItem_(idValue: any): void;
    protected UpdateItem_(quantity: number, idValue: any, incremental?: boolean, changes?: Array<() => void>, updates?: Array<any>): void;
    protected RemoveAll_(): void;
    protected Import_(items: Array<CollectionItem<EntryType>>, incremental?: boolean): void;
    protected Export_(withEntryInfo?: boolean): {
        quantity: number;
    }[];
    protected UpdateEntries_(idValues: Array<any> | any): void;
    protected GetIdValue_(entry: EntryType): any;
    protected BuildEntry(idValue: any): EntryType;
    protected FindItem_(idValue: any): number;
    protected CreateItemProxy_(item: CollectionItem<EntryType>): any;
    protected Reload_(): void;
    protected WriteToDatabase_(): void;
    protected ReadFromDatabase_(callback: () => void): void;
    protected BuildPath_(path: string): string;
    protected GetDatabaseKey_(): string;
}
