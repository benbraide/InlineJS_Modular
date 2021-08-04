import { IRegion } from '../../typedefs';
import { FetchMode } from '../../utilities/fetch';
import { ExtendedDirectiveHandler } from './generic';
export interface XHRState {
    active: boolean;
    loaded: boolean;
    loads: number;
    progress: number;
    data: any;
}
export interface XHROptions {
    region: IRegion;
    key: string;
    expression?: string;
    element?: HTMLElement;
    expressionElement?: HTMLElement;
    publicProps?: Array<string>;
    lazy?: boolean;
    ancestor?: number;
    fetchMode?: FetchMode;
    onLoad?: (region?: IRegion, data?: any) => void;
    onError?: (err: any) => void;
    formatData?: (data: any, mode: FetchMode) => any;
    setData?: (state: XHRState, value: any, mode: FetchMode, regionId?: string, scopeId?: string) => boolean | void;
}
export declare class XHRHelper {
    static BindFetch(options: XHROptions): void;
    static ExtractFetchMode(options: Array<string>): FetchMode;
}
export declare class XHRDirectiveHandler extends ExtendedDirectiveHandler {
    constructor();
}
export declare class JSONDirectiveHandler extends ExtendedDirectiveHandler {
    constructor();
}
