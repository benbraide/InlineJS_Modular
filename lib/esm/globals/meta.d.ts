import { GlobalHandler, SimpleGlobalHandler } from './generic';
export declare class NextTickGlobalHandler extends SimpleGlobalHandler {
    constructor();
}
export declare class PostGlobalHandler extends SimpleGlobalHandler {
    constructor();
}
export declare class UseGlobalHandler extends SimpleGlobalHandler {
    constructor();
}
export declare class StaticGlobalHandler extends SimpleGlobalHandler {
    constructor();
}
export declare class RawGlobalHandler extends SimpleGlobalHandler {
    constructor();
}
export declare class OrGlobalHandler extends SimpleGlobalHandler {
    constructor();
    static Compute(...values: any[]): any;
}
export declare class AndGlobalHandler extends SimpleGlobalHandler {
    constructor();
    static Compute(...values: any[]): any;
}
export declare class ArithmeticGlobalHandler extends GlobalHandler {
    constructor();
}
export declare class RelationalGlobalHandler extends GlobalHandler {
    constructor();
}
export declare class LogicalGlobalHandler extends GlobalHandler {
    constructor();
}
export declare class ConditionalGlobalHandler extends SimpleGlobalHandler {
    constructor();
}
export declare class EvaluateGlobalHandler extends SimpleGlobalHandler {
    constructor();
}
export declare class CallTempGlobalHandler extends SimpleGlobalHandler {
    constructor();
}
