import { ExtendedDirectiveHandler } from "../directives/extended/generic";
import { Region } from "../region";
import { DirectiveHandlerReturn, IDirective, IRegion } from "../typedefs";
import { GlobalHandler } from "./generic";

export class TimeagoDirectiveHandler extends ExtendedDirectiveHandler{
    public constructor(timeago: TimeagoGlobalHandler){
        super(timeago.GetKey(), (region: IRegion, element: HTMLElement, directive: IDirective) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'update');
            if (response != DirectiveHandlerReturn.Nil){
                return response;
            }

            let value = ExtendedDirectiveHandler.Evaluate(region, element, directive.value), date: Date = null;
            if (typeof value === 'string' || typeof value === 'number' || value instanceof Date){
                date = new Date(value);
            }
            else if (value instanceof HTMLTimeElement){
                date = new Date(value.dateTime);
            }

            if (!date){
                region.GetState().Warn(`'${this.key_}' directive requires a valid date value or a 'datetime' element`);
                return DirectiveHandlerReturn.Handled;    
            }

            let options = {
                capitalized: false,
                caps: false,
                unoptimized: false,
            };

            directive.arg.options.forEach((option) => {
                if (option in options){
                    options[option] = true;
                }
            });

            let label = '', renderInfo = timeago.Render(date, (value) => {
                label = value;
                Region.Get(regionId).GetChanges().AddComposed('label', scopeId);

                element.dispatchEvent(new CustomEvent(`${this.key_}.update`, {
                    detail: {
                        label: label,
                    },
                }));
            }, (options.capitalized || options.caps), !options.unoptimized);

            let regionId = region.GetId(), scopeId = region.GenerateDirectiveScopeId(null, `_${this.key_}`), elementScope = region.AddElement(element, true);
            elementScope.locals[`\$${this.key_}`] = ExtendedDirectiveHandler.CreateProxy((prop) =>{
                if (prop === 'label'){
                    Region.Get(regionId).GetChanges().AddGetAccess(`${scopeId}.${prop}`);
                    return label;
                }

                if (prop === 'stop'){
                    renderInfo.stop();
                }

                if (prop === 'resume'){
                    renderInfo.resume();
                }
            }, ['label', 'stop', 'resume']);

            elementScope.uninitCallbacks.push(() => {
                renderInfo.stop();
                renderInfo = null;
            });
            
            return DirectiveHandlerReturn.Handled;
        });
    }
}

export interface TimeagoRenderInfo{
    stop(): void;
    resume(): void;
}

export type TimeagoRenderHandler = (label: string) => void;

interface TimeagoCheckpoint{
    value: number;
    label: string | Array<string>;
    next?: number;
    plural?: string;
    append?: boolean;
}

export class TimeagoGlobalHandler extends GlobalHandler{
    private checkpoints_: Array<TimeagoCheckpoint> = [
        {//Year
            value: (365 * 24 * 60 * 60),
            label: 'year',
        },
        {//Month
            value: (30 * 24 * 60 * 60),
            label: 'month',
        },
        {//Week
            value: (7 * 24 * 60 * 60),
            label: 'week',
        },
        {//Day
            value: (24 * 60 * 60),
            label: 'day',
            next: (7 * 24 * 60 * 60),
        },
        {//Hour
            value: (60 * 60),
            label: 'hour',
            next: (24 * 60 * 60),
        },
        {//Minute
            value: 60,
            label: 'minute',
            next: (60 * 60),
        },
        {
            value: 45,
            label: ['45', 'seconds'],
            next: 60,
        },
        {
            value: 30,
            label: ['30', 'seconds'],
            next: 45,
        },
        {
            value: 15,
            label: ['15', 'seconds'],
            next: 30,
        },
        {
            value: 10,
            label: ['10', 'seconds'],
            next: 15,
        },
        {
            value: 5,
            label: ['5', 'seconds'],
            next: 10,
        },
        {
            value: 2,
            label: ['few', 'seconds'],
            next: 5,
        },
        {
            value: 1,
            label: ['1', 'second'],
            next: 2,
        },
        {
            value: 0,
            label: 'just now',
            next: 1,
            append: false,
        },
    ];
    
    public constructor(){
        super('timeago', null, null, () => {
            Region.GetDirectiveManager().AddHandler(new TimeagoDirectiveHandler(this));
            
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'format'){
                    return (date: Date, withNextUpdate = true, capitalize = false) => {
                        if (withNextUpdate){
                            return this.Format(date, true, capitalize);
                        }
                        return this.Format(date, false, capitalize);
                    }
                }

                if (prop === 'render'){
                    return (date: Date, handler: TimeagoRenderHandler, capitalize = false, optimized = true) => this.Render(date, handler, capitalize, optimized);
                }
            }, ['format', 'render']);
        }, () => {
            this.proxy_ = null;
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
        });
    }

    public Format(date: Date, withNextUpdate: true, capitalize?: boolean): [string, number];
    public Format(date: Date, withNextUpdate: false, capitalize?: boolean): string;
    public Format(date: Date, withNextUpdate = true, capitalize = false): [string, number] | string{
        let now = Date.now(), then = date.getTime();
        if (then <= now){
            return this.FormatAgo_(Math.floor((now - then) / 1000), withNextUpdate, capitalize);
        }
        
        return (withNextUpdate ? ['', null] : '');
    }

    public Render(date: Date, handler: TimeagoRenderHandler, capitalize = false, optimized = true): TimeagoRenderInfo{
        let previousLabel: string = null, [label, next] = this.Format(date, true, capitalize), running = true, stopped = false, callHandler = () => {
            previousLabel = label;
            label = null;
            
            try{
                handler(previousLabel);
            }
            catch{}
        };

        let pass = () => {
            if (label && !stopped){
                callHandler();
            }
        };
        
        let scheduleHandlerCall = () => {
            if (optimized){//Tie updates to animation cycles
                requestAnimationFrame(pass);
            }
            else{//Immediate call
                callHandler();
            }
        };

        let onTimeout = () => {
            if (stopped){
                running = false;
                return;
            }
            
            let wasNull = !label;//Ensure 'pass' has been called
            [label, next] = this.Format(date, true, capitalize);

            setTimeout(onTimeout, (next * 1000));
            if (wasNull && label !== previousLabel){
                scheduleHandlerCall();
            }
        }

        setTimeout(onTimeout,  (next * 1000));
        scheduleHandlerCall();

        return {
            stop: () => {
                stopped = true;
            },
            resume: () => {
                if (stopped){
                    stopped = false;
                    if (!running){
                        running = true;
                        [label, next] = this.Format(date, true, capitalize);

                        setTimeout(onTimeout,  (next * 1000));
                        scheduleHandlerCall();
                    }
                }
            },
        };
    }

    private FormatAgo_(seconds: number, withNextUpdate: boolean, capitalize: boolean): [string, number] | string{
        let count = 0, matched = this.checkpoints_.find((checkpoint) => {
            if (checkpoint.value < 60){
                return (checkpoint.value == 0 || checkpoint.value <= seconds);
            }
            return ((count = Math.floor(seconds / checkpoint.value)) >= 1);
        });

        let label = this.BuildLabel_(matched, capitalize, count, '', ' ago');
        if (!withNextUpdate){//Label only
            return label;
        }

        if (!matched.next){//No next
            return [label, null];
        }

        if (matched.value < 60){//No repeat
            return [label, (matched.next - seconds)];
        }

        return [label, (matched.value - (seconds % matched.value))];//Delay to next repeat
    }

    private BuildLabel_(checkpoint: TimeagoCheckpoint, capitalize: boolean, count: number, prefix = '', suffix = ''){
        let label: string;
        if (typeof checkpoint.label === 'string'){
            label = ((count > 1) ? (checkpoint.plural || `${checkpoint.label}s`) : checkpoint.label);
            if (capitalize){
                label = (label.substr(0, 1).toUpperCase() + label.substr(1));
            }

            if (count > 0){
                label = `${count} ${label}`;
            }
        }
        else{//String value
            label = (capitalize ? checkpoint.label.map(item => (item.substr(0, 1).toUpperCase() + item.substr(1))).join(' ') : checkpoint.label.join(' '));
        }
        
        return ((checkpoint.append !== false && (prefix || suffix)) ? `${prefix}${label}${suffix}` : label);
    }
}
