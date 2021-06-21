import { Region } from '../region'

export interface ReporterInfo{
    simple: (info: any) => boolean;
    serverError: (err: any) => boolean;
    confirm: (info: string | Record<string, any>, confirmed: string | (() => void), canceled?: string | (() => void)) => void;
    prompt: (info: string | Record<string, any>, callback: (response: string | Array<string>) => void) => void;
}

export class Report{
    public static Simple(regionId: string, info: any){
        let reporter = (Region.GetGlobalManager().Handle(regionId, null, '$reporter') as ReporterInfo);
        return (reporter && reporter.simple && reporter.simple(info));
    }
    
    public static ServerError(regionId: string, err: any){
        let reporter = (Region.GetGlobalManager().Handle(regionId, null, '$reporter') as ReporterInfo);
        return (reporter && reporter.serverError && reporter.serverError(err));
    }
}
