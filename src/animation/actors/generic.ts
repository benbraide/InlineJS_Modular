import { IAnimationActor, IAnimationEase } from "../../typedefs";

export class AnimationActor implements IAnimationActor{
    public constructor(protected key_: string, private step_?: (fraction: number, element: HTMLElement) => void, private prepare_?: (element: HTMLElement) => void,
        private preferredEase_?: ((show?: boolean) => IAnimationEase) | IAnimationEase, private preferredDuration_?: ((show?: boolean) => number) | number){}
    
    public GetKey(): string{
        return this.key_;
    }
    
    public Prepare(element: HTMLElement): void{
        if (this.prepare_){
            this.prepare_(element);
        }
    }

    public Step(fraction: number, element: HTMLElement): void{
        if (this.step_){
            this.step_(fraction, element);
        }
    }

    public GetPreferredEase(show?: boolean): IAnimationEase{
        return ((typeof this.preferredEase_ === 'function') ? this.preferredEase_(show) : this.preferredEase_);
    }

    public GetPreferredDuration(show?: boolean): number{
        return ((typeof this.preferredDuration_ === 'function') ? this.preferredDuration_(show) : this.preferredDuration_);
    }
}
