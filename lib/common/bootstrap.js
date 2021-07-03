"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bootstrap = void 0;
const region_1 = require("./region");
class Bootstrap {
    constructor(isTest_ = false) {
        this.isTest_ = isTest_;
    }
    Attach(mount) {
        region_1.Region.PushPostProcessCallback();
        let config = region_1.Region.GetConfig(), mountKey = region_1.Region.GetDirectiveManager().GetMountDirectiveName(), mountAttributes;
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
                let region = new region_1.Region(element);
                region_1.Region.GetProcessor().All(region, element, {
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
        region_1.Region.ExecutePostProcessCallbacks();
    }
}
exports.Bootstrap = Bootstrap;
