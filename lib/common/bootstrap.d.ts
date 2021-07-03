import { IBootstrap } from './typedefs';
export declare class Bootstrap implements IBootstrap {
    private isTest_;
    constructor(isTest_?: boolean);
    Attach(mount?: HTMLElement): void;
}
