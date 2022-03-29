import { IDirective, DirectiveHandlerReturn, IRegion, IResource } from '../../typedefs'
import { Region } from '../../region'
import { ExtendedDirectiveHandler } from '../extended/generic'
import { GlobalHandler } from '../../globals/generic'

type CodeEvaluationMode = 'nothing' | 'data' | 'template';

export class CodeDirectiveHandler extends ExtendedDirectiveHandler{
    private static templates_: Record<string, (mode?: CodeEvaluationMode) => void | string> = {};
    
    public constructor(){
        super('code', (region: IRegion, element: HTMLElement, directive: IDirective) => {
            if (!(element instanceof HTMLTemplateElement)){
                region.GetState().ReportError(`'${this.key_}' requires a template element`);
                return DirectiveHandlerReturn.Handled;
            }

            let options = ExtendedDirectiveHandler.GetOptions({
                nexttick: false,
                trap: false,
                bind: false,
                data: false,
            }, directive.arg.options);

            let regionId = region.GetId(), compKey = region.GetComponentKey(), isQueued = false, performTask = (task: () => any, noNextTick = false) => {
                if (noNextTick || !options.nexttick){
                    return task();
                }
                
                if (!isQueued){
                    isQueued = true;
                    Region.Get(regionId)?.AddNextTickCallback(() => {
                        isQueued = false;
                        task();
                    });
                }
            };

            let value = element.content.textContent, evaluate = (getData: boolean, noNextTick = false) => {
                if (getData){
                    return performTask(() => ExtendedDirectiveHandler.Evaluate(Region.Get(regionId), element, value), noNextTick);
                }
                
                performTask(() => ExtendedDirectiveHandler.BlockEvaluate(Region.Get(regionId), element, value), noNextTick);
            };

            if (directive.arg.key === 'tmpl' || directive.arg.key === 'template'){
                if (!compKey){
                    region.GetState().ReportError(`Templated '${this.key_}' requires a named component scope`);
                    return DirectiveHandlerReturn.Handled;
                }
                
                let name = directive.value.trim(), key = `${compKey}.${name}`;
                if (!name){
                    region.GetState().ReportError(`Templated '${this.key_}' requires a valid name`);
                    return DirectiveHandlerReturn.Handled;
                }

                CodeDirectiveHandler.templates_[key] = (mode) => {
                    return ((mode === 'template') ? value : evaluate((mode === 'data' || options.data), true));
                };

                region.AddElement(element, true)?.uninitCallbacks.push(() => {
                    delete CodeDirectiveHandler.templates_[key];
                });
            }
            else if (options.trap || options.bind){
                performTask(() => {
                    region.GetState().TrapGetAccess(() => {
                        evaluate(false, true);
                        return true;
                    }, () => {
                        evaluate(false);
                        return true;
                    }, element);
                });
            }
            else{
                evaluate(false);
            }
            
            return DirectiveHandlerReturn.Handled;
        });
    }

    public static GetTemplate(name: string){
        return ((name in CodeDirectiveHandler.templates_) ? CodeDirectiveHandler.templates_[name] : null);
    }
}

export class CodeGlobalHandler extends GlobalHandler{
    public constructor(){
        super('code', null, null, () => {
            let callCallback = (name: string, component: string, mode: CodeEvaluationMode) => {
                if (!component){
                    component = Region.GetCurrent(null)?.GetComponentKey();
                }
                
                let callback = CodeDirectiveHandler.GetTemplate(`${component}.${name}`);
                if (callback){
                    return callback(mode);
                }
            };
            
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'run'){
                    return (name: string, component?: string) => callCallback(name, component, 'nothing');
                }

                if (prop === 'data'){
                    return (name: string, component?: string) => callCallback(name, component, 'data');
                }

                if (prop === 'template'){
                    return (name: string, component?: string) => callCallback(name, component, 'template');
                }
            }, ['run', 'data', 'template']);
            
            Region.GetDirectiveManager().AddHandler(new CodeDirectiveHandler());
        }, () => {
            Region.GetDirectiveManager().RemoveHandlerByKey(this.key_);
            this.proxy_ = null;
        });
    }
}
