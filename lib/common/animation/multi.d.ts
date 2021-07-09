import { IAnimationActor, IAnimationEase } from '../typedefs';
import { Animation } from './generic';
export declare class MultiAnimation extends Animation {
    protected multiActors_: Record<string, Array<IAnimationActor>>;
    protected multiEase_: Record<string, IAnimationEase>;
    protected multiDuration_: Record<string, number>;
    constructor(multiActors_: Record<string, Array<IAnimationActor>>, multiEase_: Record<string, IAnimationEase>, multiDuration_: Record<string, number>, isInfinite?: boolean, interval?: number);
    Add(key: string, actors: Array<IAnimationActor>, ease: IAnimationEase): void;
    AddActors(key: string, actors: Array<IAnimationActor>): void;
    AddEase(key: string, ease: IAnimationEase): void;
    Remove(key: string): void;
    RemoveActors(key: string): void;
    RemoveEase(key: string): void;
    SetActive(key: string): void;
    SetActiveActors(key: string): void;
    SetActiveEase(key: string): void;
    SetActiveDuration(key: string): void;
}
