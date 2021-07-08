import { IDatabase } from '../typedefs';
export declare class Database implements IDatabase {
    private name_;
    private handle_;
    private attempted_;
    private attempting_;
    private queued_;
    constructor(name_: string);
    Open(): void;
    Close(): void;
    Read(key: string, successHandler?: (data: any) => void, errorHandler?: () => void): Promise<any>;
    Write(key: string, data: any, successHandler?: () => void, errorHandler?: () => void): Promise<void>;
}
