import { IAnimationEase } from "../../../typedefs";
import { ParsedCreator } from "../../creators/generic";
export declare class BezierAnimationEaseCreator extends ParsedCreator<IAnimationEase> {
    constructor();
    static ParseInt(options: Array<string>, index: number): number;
}
