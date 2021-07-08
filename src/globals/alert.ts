import { GlobalHandler } from "./generic";
import { Region } from '../region'

export class AlertGlobalHandler extends GlobalHandler{
    private proxy_ = null;
    
    public constructor(){
        super('alert', () => this.proxy_, null, null, () => {
            this.proxy_ = Region.CreateProxy((prop) => {
                if (prop === 'alert'){
                    return (data: any) => Region.GetAlertHandler().Alert(data);
                }

                if (prop === 'confirm'){
                    return (data: any, confirmed: () => void, canceled?: () => void) => Region.GetAlertHandler().Confirm(data, confirmed, canceled);
                }

                if (prop === 'prompt'){
                    return (data: any, callback: (response: any) => void) => Region.GetAlertHandler().Prompt(data, callback);
                }
            }, ['alert', 'confirm', 'prompt']);
        }, () => {
            this.proxy_ = null;
        });
    }
}
