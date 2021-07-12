import { IAnimationEase } from "../../../typedefs";
import { ParsedCreator } from "../../creators/generic";
import { BezierEase } from "../bezier";

export class BezierAnimationEaseCreator extends ParsedCreator<IAnimationEase>{
    public constructor(){
        super('bezier', (options, index) => {
            let values = {
                first: 0,
                second: 0,
                third: 0,
                fourth: 0,
            };

            for (let key in values){
                if ((values[key] = BezierAnimationEaseCreator.ParseInt(options, index++)) === null){
                    return null;
                }
            }

            return {
                object: new BezierEase(values.first, values.second, values.third, values.fourth),
                count: Object.keys(values).length,
            };
        });
    }

    public static ParseInt(options: Array<string>, index: number){
        let value = ((index < options.length) ? parseInt(options[index]) : null);
        return ((value || value === 0) ? value : null);
    }
}