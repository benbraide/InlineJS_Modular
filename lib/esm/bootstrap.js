import { Region } from './region';
export class Bootstrap {
    constructor(isTest_ = false) {
        this.isTest_ = isTest_;
    }
    Attach(mount) {
        Region.PushPostProcessCallback();
        let config = Region.GetConfig(), mountKey = Region.GetDirectiveManager().GetMountDirectiveName(), mountAttributes;
        if (this.isTest_) {
            mountAttributes = [
                config.GetDirectiveName(mountKey, true),
                config.GetDirectiveName(mountKey, false),
                `${config.GetDirectiveName('static', true)}:${mountKey}`,
                `${config.GetDirectiveName('static', false)}:${mountKey}`,
            ];
        }
        else {
            mountAttributes = [
                config.GetDirectiveName(mountKey, true),
                config.GetDirectiveName(mountKey, false),
                `${config.GetDirectiveName('static', true)}\\:${mountKey}`,
                `${config.GetDirectiveName('static', false)}\\:${mountKey}`,
            ];
        }
        mountAttributes.forEach((attrName) => {
            (mount || document).querySelectorAll(`[${attrName}]`).forEach((element) => {
                if (!element.hasAttribute(attrName) || !document.contains(element)) { //Probably contained inside another region
                    return;
                }
                let region = new Region(element);
                Region.GetProcessor().All(region, element, {
                    checkTemplate: true,
                    checkDocument: false,
                });
                region.SetDoneInit();
                let observer = region.GetObserver();
                if (observer) {
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
