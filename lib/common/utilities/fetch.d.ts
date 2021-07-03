import { IFetch, IRegion } from '../typedefs';
export declare enum FetchMode {
    Replace = 0,
    Append = 1,
    Prepend = 2
}
export interface FetchHandlers {
    onLoad?: (data?: any) => void;
    onError?: (err: any) => void;
    onProgress?: (e: ProgressEvent<XMLHttpRequestEventTarget>) => void;
    onEmptyMount?: () => void;
    onPropGet?: (prop: string) => void | any;
    onPropSet?: (prop: string, value?: any) => void;
    onBeforePropGet?: (prop: string) => boolean;
    onBeforePropSet?: (prop: string, value?: any) => boolean;
    onBeforeRequest?: (url?: string, mode?: FetchMode) => void;
}
export interface FetchProps {
    mode: FetchMode;
    mount: HTMLElement;
    url: string;
    handlers: FetchHandlers;
}
export declare class Fetch implements IFetch {
    private url_;
    private mount_;
    private handlers_;
    private mode_;
    private noOverlap_;
    props: FetchProps;
    private overlapCheckpoint_;
    private onPropSet_;
    constructor(url_?: string, mount_?: HTMLElement, handlers_?: FetchHandlers, mode_?: FetchMode, noOverlap_?: boolean);
    Reload(): void;
    SetProp(prop: string, value: any, force?: boolean): void;
    Get(region?: IRegion): Promise<any>;
    Watch(region?: IRegion, get?: boolean): void;
    EndWatch(): void;
    private EmptyMount_;
    private Get_;
    private GetList_;
    private SetProp_;
    private AlertAccess_;
    static HandleJsonResponse(response: Response): Promise<any>;
    static HandleTextResponse(response: Response): Promise<string>;
}
