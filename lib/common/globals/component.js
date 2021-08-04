"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetScopeGlobalHandler = exports.LocalsGlobalHandler = exports.ComponentKeyGlobalHandler = exports.ComponentGlobalHandler = void 0;
const generic_1 = require("./generic");
const region_1 = require("../region");
class ComponentGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('component', () => (id) => region_1.Region.Find(id, true));
    }
}
exports.ComponentGlobalHandler = ComponentGlobalHandler;
class ComponentKeyGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('componentKey', (regionId) => region_1.Region.Get(regionId).GetComponentKey());
    }
}
exports.ComponentKeyGlobalHandler = ComponentKeyGlobalHandler;
class LocalsGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('locals', (regionId) => (element) => region_1.Region.Get(regionId).GetElementScope(element || true).locals);
    }
}
exports.LocalsGlobalHandler = LocalsGlobalHandler;
class GetScopeGlobalHandler extends generic_1.SimpleGlobalHandler {
    constructor() {
        super('getScope', (regionId) => (key) => region_1.Region.Get(regionId).GetScope(key));
    }
}
exports.GetScopeGlobalHandler = GetScopeGlobalHandler;
