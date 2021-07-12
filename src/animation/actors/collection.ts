import { IAnimationActor } from "../../typedefs";
import { AnimationActor } from "./generic";

export class CollectionAnimationActor extends AnimationActor{
    public constructor(private collection_: Array<IAnimationActor>){
        super('#collection#', (fraction, element) => {
            this.collection_.forEach(item => item.Step(fraction, element));
        }, (element) => {
            this.collection_.forEach(item => item.Prepare(element));
        }, (show) => {
            for (let item of this.collection_){
                let preferred = item.GetPreferredEase(show);
                if (preferred){
                    return preferred;
                }
            }

            return null;
        }, (show) => {
            for (let item of this.collection_){
                let preferred = item.GetPreferredDuration(show);
                if (preferred){
                    return preferred;
                }
            }

            return 0;
        });
    }
}
