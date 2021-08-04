import { ExtendedDirectiveHandler } from "../directives/extended/generic";
import { GlobalHandler } from "./generic";
export declare class GeolocationDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(geolocation: GeolocationGlobalHandler);
}
export declare class GeolocationGlobalHandler extends GlobalHandler {
    private scopeId_;
    private watchId_;
    private state_;
    constructor();
    Request(): void;
    Track(activate?: boolean): void;
    private UpdateState_;
    private SetPosition_;
    private SetError_;
}
