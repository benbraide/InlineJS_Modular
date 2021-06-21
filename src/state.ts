import { IState, IRegion, ChangeCallbackType, ITrapInfo, IChange, IBubbledChange } from './typedefs'
import { Stack } from './stack'

export class State implements IState{
    private elementContext_ = new Stack<HTMLElement>();
    private eventContext_ = new Stack<Event>();

    public constructor (private regionId_: string, private regionFinder_: (id: string) => IRegion){}

    public PushElementContext(element: HTMLElement): void{
        this.elementContext_.Push(element);
    }

    public PopElementContext(): HTMLElement{
        return this.elementContext_.Pop();
    }

    public GetElementContext(): HTMLElement{
        return this.elementContext_.Peek();
    }

    public PushEventContext(Value: Event): void{
        this.eventContext_.Push(Value);
    }

    public PopEventContext(): Event{
        return this.eventContext_.Pop();
    }

    public GetEventContext(): Event{
        return this.eventContext_.Peek();
    }

    public TrapGetAccess(callback: ChangeCallbackType, changeCallback: ChangeCallbackType | true, elementContext: HTMLElement | string, staticCallback?: () => void): Record<string, Array<string>>{
        let region = this.regionFinder_(this.regionId_);
        if (!region){
            return {};
        }

        let info: ITrapInfo = {
            stopped: false,
            callback: null
        };

        try{
            region.GetChanges().PushGetAccessStorage(null);
            info.stopped = (callback(null) === false);
        }
        catch (err){
           this.ReportError(err, `InlineJs.Region<${this.regionId_}>.State.TrapAccess`);
        }

        let storage = region.GetChanges().PopGetAccessStorage(true);
        if (info.stopped || !changeCallback || storage.length == 0){//Not reactive
            if (staticCallback){
                staticCallback();
            }
            return {};
        }

        if (elementContext){
            let scope = region.GetElementScope(elementContext);
            if (!scope && typeof elementContext !== 'string'){
                scope = region.AddElement(elementContext, false);
            }

            if (scope){//Add info
                scope.trapInfoList.push(info);
            }
        }

        let ids: Record<string, Array<string>> = {};
        let onChange = (changes: Array<IChange | IBubbledChange>) => {
            if (Object.keys(ids).length == 0){
                return;
            }
            
            let myRegion = this.regionFinder_(this.regionId_);
            if (myRegion){//Mark changes
                myRegion.GetChanges().PushOrigin(onChange);
            }
            
            try{
                if (!info.stopped && changeCallback === true){
                    info.stopped = (callback(changes) === false);
                }
                else if (!info.stopped && changeCallback !== true){
                    info.stopped = (changeCallback(changes) === false);
                }
            }
            catch (err){
               this.ReportError(err, `InlineJs.Region<${this.regionId_}>.State.TrapAccess`);
            }

            if (myRegion){
                myRegion.GetChanges().PopOrigin();
            }
            
            if (info.stopped){//Unsubscribe all subscribed
                for (let regionId in ids){
                    let myRegion = this.regionFinder_(regionId);
                    if (myRegion){
                        ids[regionId].forEach(id =>  myRegion.GetChanges().Unsubscribe(id));
                    }
                }
            }
        };

        let uniqueEntries: Record<string, string> = {};
        storage.forEach(info => uniqueEntries[info.path] = info.regionId);

        info.callback = onChange;
        for (let path in uniqueEntries){
            let targetRegion = this.regionFinder_(uniqueEntries[path]);
            if (targetRegion){
                ((ids[targetRegion.GetId()] = (ids[targetRegion.GetId()] || new Array<string>())) as Array<string>).push(targetRegion.GetChanges().Subscribe(path, onChange));
            }
        }

        return ids;
    }

    public ReportError(value: any, ref?: any): void{
        console.error(value, ref);
    }

    public Warn(value: any, ref?: any): void{
        console.warn(value, ref);
    }

    public Log(value: any, ref?: any): void{
        console.log(value, ref);
    }
}
