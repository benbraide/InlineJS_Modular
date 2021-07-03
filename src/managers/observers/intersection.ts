import { IIntersectionObserverManager, IIntersectionObserver } from '../../typedefs'
import { IntersectionObserver } from '../../observers/intersection'

export class IntersectionObserverManager implements IIntersectionObserverManager{
    private list_ = new Array<IIntersectionObserver>();
    private lastKeyCount_ = 0;

    public constructor(private regionId_: string){}
    
    public Add(target: HTMLElement, options: IntersectionObserverInit): IIntersectionObserver{
        let observer = new IntersectionObserver(`${this.regionId_}.interobs.${this.lastKeyCount_++}`, target, options);
        this.list_.push(observer);
        return observer;
    }

    public Remove(observer: IIntersectionObserver): void{
        this.list_.splice(this.list_.findIndex(item => (item === observer)), 1);
    }

    public RemoveByKey(key: string, stop = true): void{
        let index = this.list_.findIndex(item => (item.GetKey() === key));
        if (index != -1){
            if (stop){//Stop before removing from list
                this.list_[index].Stop();
            }
            this.list_.splice(index, 1);
        }
    }

    public RemoveAll(target: HTMLElement, stop = true): void{
        this.list_ = this.list_.filter((item) => {
            if ((item.GetTarget() !== target)){
                return true;
            }

            if (stop){//Stop before removing from list
                item.Stop();
            }
            
            return false;
        });
    }
}
