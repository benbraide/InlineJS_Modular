import { AnimationEase } from './generic';
export declare class BounceEase extends AnimationEase {
    constructor();
}
export declare class BounceInEase extends AnimationEase {
    private bounceEase_;
    constructor();
    GetBounceEase(): BounceEase;
}
export declare class BounceOutEase extends BounceEase {
    constructor();
}
export declare class BounceInOutEase extends AnimationEase {
    private bounceInEase_;
    constructor();
}
