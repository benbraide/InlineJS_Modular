import { GlobalHandler } from './generic';
import { IAuthGlobalHandler } from '../typedefs';
import { ExtendedDirectiveHandler } from '../directives/extended/generic';
export interface CollectionItem<EntryType> {
    quantity: number;
    entry: EntryType;
}
export interface CollectionStoredItem<EntryType> {
    quantity: number;
    entry: EntryType;
}
export interface CollectionOptions<EntryType> {
    idKey: string;
    idKeyPlural?: string;
    entryName?: string;
    entryNamePlural?: string;
    caches?: Record<string, (items?: Array<CollectionItem<EntryType>>) => any>;
    props?: Record<string, any>;
    itemsPath?: string;
    afterUpdate?: (items?: Array<CollectionItem<EntryType>>) => void;
}
export declare class CollectionDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(global: GlobalHandler);
}
export declare class CollectionGlobalHandler<EntryType> extends GlobalHandler {
    protected auth_: IAuthGlobalHandler;
    protected listProxy_: any;
    protected keyedProxy_: any;
    private origin_;
    protected scopeId_: string;
    protected options_: CollectionOptions<EntryType>;
    protected items_: CollectionItem<EntryType>[];
    protected proxies_: any[];
    protected entryKeys_: Array<string>;
    protected defaultEntryKeys_: Array<string>;
    protected count_: number;
    protected cached_: Record<string, any>;
    protected queuedRequests_: Array<() => void>;
    constructor(key: string, auth_: IAuthGlobalHandler, options: CollectionOptions<EntryType>);
    protected PutItem_(entry: EntryType, quantity?: number, incremental?: boolean): void;
    protected RemoveItem_(entry: EntryType): void;
    protected UpdateItem_(entry: EntryType, quantity: number, incremental?: boolean, changes?: Array<() => void>, updates?: Array<any>, save?: boolean): void;
    protected RemoveAll_(): void;
    protected Import_(items: Array<CollectionItem<EntryType>>, incremental?: boolean): void;
    protected Export_(withEntryInfo?: boolean): {
        quantity: number;
        entry: EntryType;
    }[];
    protected GetIdValue_(entry: EntryType): any;
    protected FindItem_(idValue: any): number;
    protected CreateItemProxy_(item: CollectionItem<EntryType>): any;
    protected Reload_(): void;
    protected WriteToDatabase_(): void;
    protected ReadFromDatabase_(callback: () => void): void;
    protected BuildPath_(path: string): string;
    protected GetDatabaseKey_(): string;
    protected Recache_(): void;
    GetCount(): number;
    GetItems(): CollectionItem<EntryType>[];
    UpdateItem(entry: EntryType, quantity: number, incremental?: boolean): void;
    RemoveItem(entry: EntryType): void;
    Clear(): void;
    Import(items: Array<CollectionItem<EntryType>>, incremental?: boolean): void;
    Export(withEntryInfo?: boolean): {
        quantity: number;
        entry: EntryType;
    }[];
    Reload(): void;
    GetOptions(): CollectionOptions<EntryType>;
}
