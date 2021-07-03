import { Region } from '../region';
export class Report {
    static Simple(regionId, info) {
        let reporter = Region.GetGlobalManager().Handle(regionId, null, '$reporter');
        return (reporter && reporter.simple && reporter.simple(info));
    }
    static ServerError(regionId, err) {
        let reporter = Region.GetGlobalManager().Handle(regionId, null, '$reporter');
        return (reporter && reporter.serverError && reporter.serverError(err));
    }
}
