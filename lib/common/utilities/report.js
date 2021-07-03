"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const region_1 = require("../region");
class Report {
    static Simple(regionId, info) {
        let reporter = region_1.Region.GetGlobalManager().Handle(regionId, null, '$reporter');
        return (reporter && reporter.simple && reporter.simple(info));
    }
    static ServerError(regionId, err) {
        let reporter = region_1.Region.GetGlobalManager().Handle(regionId, null, '$reporter');
        return (reporter && reporter.serverError && reporter.serverError(err));
    }
}
exports.Report = Report;
