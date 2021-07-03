import { IRegion } from '../../typedefs';
import { ExtendedDirectiveHandler } from './generic';
export interface XHROptions {
    region: IRegion;
    key: string;
    expression?: string;
    element?: HTMLElement;
    expressionElement?: HTMLElement;
    publicProps?: Array<string>;
    lazy?: boolean;
    ancestor?: number;
    onLoad?: (region?: IRegion, data?: any) => void;
    onError?: (err: any) => void;
    formatData?: (data: any) => any;
}
export declare class XHRHelper {
    static BindFetch(options: XHROptions): void;
}
export declare class XHRDirectiveHandler extends ExtendedDirectiveHandler {
    constructor();
}
export declare class JSONDirectiveHandler extends ExtendedDirectiveHandler {
    constructor();
}
