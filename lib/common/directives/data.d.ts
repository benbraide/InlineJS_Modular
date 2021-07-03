import { IRegion } from '../typedefs';
import { DirectiveHandler } from './generic';
export interface DataOptions {
    $enableOptimizedBinds?: boolean;
    $locals?: Record<string, any>;
    $component?: string;
    $init?: (region?: IRegion) => void;
}
export declare class DataDirectiveHandler extends DirectiveHandler {
    constructor();
}
export declare class LocalsDirectiveHandler extends DirectiveHandler {
    constructor();
}
export declare class ComponentDirectiveHandler extends DirectiveHandler {
    constructor();
}
export declare class RefDirectiveHandler extends DirectiveHandler {
    constructor();
}
