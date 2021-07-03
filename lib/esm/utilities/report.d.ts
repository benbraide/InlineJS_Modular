export interface ReporterInfo {
    simple: (info: any) => boolean;
    serverError: (err: any) => boolean;
    confirm: (info: string | Record<string, any>, confirmed: string | (() => void), canceled?: string | (() => void)) => void;
    prompt: (info: string | Record<string, any>, callback: (response: string | Array<string>) => void) => void;
}
export declare class Report {
    static Simple(regionId: string, info: any): boolean;
    static ServerError(regionId: string, err: any): boolean;
}
