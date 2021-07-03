"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootGlobalHandler = exports.SelfGlobalHandler = exports.RefsGlobalHandler = exports.ProxyGlobalHandler = void 0;
const generic_1 = require("./generic");
const region_1 = require("../region");
class ProxyGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('proxy', (regionId) => region_1.Region.Get(regionId).GetRootProxy().GetNativeProxy());
    }
}
exports.ProxyGlobalHandler = ProxyGlobalHandler;
class RefsGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('refs', (regionId) => region_1.Region.Get(regionId).GetRefs());
    }
}
exports.RefsGlobalHandler = RefsGlobalHandler;
class SelfGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('self', (regionId) => region_1.Region.Get(regionId).GetState().GetElementContext());
    }
}
exports.SelfGlobalHandler = SelfGlobalHandler;
class RootGlobalHandler extends generic_1.GlobalHandler {
    constructor() {
        super('root', (regionId) => region_1.Region.Get(regionId).GetRootElement());
    }
}
exports.RootGlobalHandler = RootGlobalHandler;
