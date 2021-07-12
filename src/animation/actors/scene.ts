import { IAnimationEase } from "../../typedefs";
import { AnimationActor } from "./generic";

export interface SceneFrameRange{
    from: number;
    to: number;
}

export type SceneFrameHandlerType = (fraction: number, element: HTMLElement) => void;

export interface SceneFrameHandlerInfo{
    ranges: SceneFrameRange | Array<SceneFrameRange>;
    handler: SceneFrameHandlerType;
}

export class SceneAnimationActor extends AnimationActor{
    protected actionText_: string;
    protected actionRegex_: RegExp;
    protected unit_ = '';
    
    public constructor(key: string, protected frameHandlers_: Array<SceneFrameHandlerInfo>, protected wildcardFrameHandler_?: SceneFrameHandlerType,
        preferredEase?: ((show?: boolean) => IAnimationEase) | IAnimationEase, preferredDuration?: ((show?: boolean) => number) | number, prepare?: (element: HTMLElement) => void){
        super(key, (fraction, element) => {
            let handler = this.GetHandler_(fraction);
            if (handler){//Call handler
                handler(fraction, element);
            }
        }, prepare, preferredEase, preferredDuration);
    }

    protected GetHandler_(fraction: number){
        let frame = (fraction * 100);
        let found = this.frameHandlers_.find((handler) => {
            if (Array.isArray(handler.ranges)){
                return !!handler.ranges.find(range => (range.from <= frame && frame < range.to));
            }
            return (handler.ranges.from <= frame && frame < handler.ranges.to);
        });

        return (found ? found.handler : this.wildcardFrameHandler_);
    }

    protected ComputeAndApply_(element: HTMLElement, fraction: number, from: number, to: number, makeNegative = false, count = 1){
        this.OnlyApply_(element, SceneAnimationActor.Advance(from, to, fraction), makeNegative, count);
    }

    protected OnlyApply_(element: HTMLElement, value: number, makeNegative = false, count = 1){
        let formattedValue = `${(makeNegative ? -value : value)}${this.unit_}`;
        if (count > 1){
            let baseValue = formattedValue;
            while (0 < --count){
                formattedValue = `${formattedValue}, ${baseValue}`;
            }
        }
        SceneAnimationActor.Apply(element, this.actionText_, formattedValue, this.actionRegex_);
    }

    public static Apply(element: HTMLElement, action: string, value: number | string, actionRegex?: RegExp){
        if (actionRegex){
            element.style.transform = element.style.transform.replace(actionRegex, '');
        }
        else{//Generate regex
            element.style.transform = element.style.transform.replace(new RegExp(`[ ]?${action}\\(.+?\\)`, 'g'), '');
        }
        
        element.style.transform += ` ${action}(${value})`;
    }
    
    public static Advance(from: number, to: number, fraction: number){
        return (((to - from) * fraction) + from);
    }
}
