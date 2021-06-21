import { IBootstrap } from './typedefs'
import { Region } from './region'

export class Bootstrap implements IBootstrap{
    public Attach(mount?: HTMLElement): void{
        Region.PushPostProcessCallback();

        let config = Region.GetConfig(), mountKey = Region.GetDirectiveManager().GetMountDirectiveName();
        let mountAttributes = [
            config.GetDirectiveName(mountKey, true),
            config.GetDirectiveName(mountKey, false),
            `${config.GetDirectiveName('static', true)}:${mountKey}`,
            `${config.GetDirectiveName('static', false)}:${mountKey}`,
        ];
        
        mountAttributes.forEach((attrName) => {
            (mount || document).querySelectorAll(`[${attrName}]`).forEach((element) => {
                if (!element.hasAttribute(attrName) || !document.contains(element)){//Probably contained inside another region
                    return;
                }

                let region = new Region(element as HTMLElement);
                Region.GetProcessor().All(region, (element as HTMLElement), {
                    checkTemplate: true,
                    checkDocument: false,
                });
                
                region.SetDoneInit();
                let observer = region.GetObserver();
                if (observer){
                    observer.observe(element, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        characterData: false,
                    });
                }
            });
        });
        
        Region.ExecutePostProcessCallbacks();
    }
}
