"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fetch = exports.FetchMode = void 0;
const region_1 = require("../region");
const generic_1 = require("../directives/generic");
var FetchMode;
(function (FetchMode) {
    FetchMode[FetchMode["Replace"] = 0] = "Replace";
    FetchMode[FetchMode["Append"] = 1] = "Append";
    FetchMode[FetchMode["Prepend"] = 2] = "Prepend";
})(FetchMode = exports.FetchMode || (exports.FetchMode = {}));
class Fetch {
    constructor(url_ = '', mount_ = null, handlers_ = null, mode_ = FetchMode.Replace, noOverlap_ = true) {
        this.url_ = url_;
        this.mount_ = mount_;
        this.handlers_ = handlers_;
        this.mode_ = mode_;
        this.noOverlap_ = noOverlap_;
        this.props = null;
        this.overlapCheckpoint_ = 0;
        this.onPropSet_ = null;
        let handlersProxy = generic_1.DirectiveHandler.CreateProxy((prop) => {
            if (typeof prop !== 'string') {
                return null;
            }
            if (prop in this.handlers_) {
                this.AlertAccess_(`handlers.${prop}`, true);
                return this.handlers_[prop];
            }
        }, Object.keys(this.handlers_), (prop, value) => {
            if (typeof prop === 'string') {
                if (this.handlers_.onBeforePropSet && !this.handlers_.onBeforePropSet(`handlers.${prop}`, value)) {
                    return false;
                }
                if (prop in this.handlers_ && value !== this.handlers_[prop]) {
                    this.handlers_[prop] = value;
                    this.AlertAccess_(`handlers.${prop}`, false, value);
                }
            }
            return true;
        });
        let proxy = generic_1.DirectiveHandler.CreateProxy((prop) => {
            if (typeof prop !== 'string') {
                return null;
            }
            let response = (this.handlers_.onBeforePropGet ? (this.handlers_.onBeforePropGet(prop) ? true : false) : null);
            if (response === false) {
                return null;
            }
            if (prop === 'url') {
                this.AlertAccess_(prop, true);
                return this.url_;
            }
            else if (prop === 'mount') {
                this.AlertAccess_(prop, true);
                return this.mount_;
            }
            else if (prop === 'handlers') {
                this.AlertAccess_(prop, true);
                return handlersProxy;
            }
            else if (prop === 'mode') {
                this.AlertAccess_(prop, true);
                return this.mode_;
            }
            else if (response && this.handlers_.onPropGet) {
                try {
                    return this.handlers_.onPropGet(prop);
                }
                catch (_a) { }
            }
            return null;
        }, ['url', 'mount', 'handlers', 'mode'], (prop, value) => {
            if (typeof prop !== 'string') {
                return true;
            }
            return this.SetProp_(prop, value);
        });
        this.props = proxy;
    }
    Reload() {
        this.SetProp_('url', this.url_, true);
    }
    SetProp(prop, value, force = true) {
        this.SetProp_(prop, value, force);
    }
    Get(region) {
        let promise = null;
        if (!this.url_) { //No loading
            if (this.url_ === '') { //Remove children
                this.EmptyMount_();
            }
        }
        else if (this.mount_) {
            if (this.mount_ instanceof HTMLSelectElement) {
                this.GetList_((item) => {
                    if (region_1.Region.IsObject(item) && 'value' in item && 'text' in item) {
                        let entry = document.createElement('option');
                        entry.value = item['value'];
                        entry.textContent = item['text'];
                        this.mount_.appendChild(entry);
                    }
                }, null, region);
            }
            else if (this.mount_ instanceof HTMLUListElement || this.mount_ instanceof HTMLOListElement) {
                this.GetList_((item) => {
                    let entry = document.createElement('li');
                    entry.textContent = generic_1.DirectiveHandler.ToString(item);
                    this.mount_.appendChild(entry);
                }, null, region);
            }
            else if (this.mount_ instanceof HTMLImageElement || this.mount_ instanceof HTMLIFrameElement) {
                let onEvent = () => {
                    this.mount_.removeEventListener('load', onEvent);
                    if (this.handlers_.onLoad) {
                        this.handlers_.onLoad();
                    }
                };
                this.mount_.addEventListener('load', onEvent);
                this.mount_.src = this.url_;
            }
            else { //Other
                let regionId = region === null || region === void 0 ? void 0 : region.GetId();
                this.Get_(false, (response) => {
                    region_1.Region.InsertHtml(this.mount_, generic_1.DirectiveHandler.ToString(response), (this.mode_ == FetchMode.Replace), (this.mode_ == FetchMode.Append), region_1.Region.Get(regionId));
                });
            }
        }
        else if (this.handlers_.onLoad) {
            this.Get_(false);
        }
        else { //No load handler
            promise = new Promise((resolve, reject) => {
                this.Get_(false, resolve, reject);
            });
        }
        return promise;
    }
    Watch(region, get = true) {
        if (this.onPropSet_) { //Already watching
            return;
        }
        let regionId = region === null || region === void 0 ? void 0 : region.GetId();
        this.onPropSet_ = (prop) => {
            if (prop === 'url') {
                this.Get(region_1.Region.Get(regionId));
            }
        };
        if (get) {
            this.Get();
        }
    }
    ;
    EndWatch() {
        this.onPropSet_ = null;
    }
    EmptyMount_() {
        if (!this.mount_ || !this.mount_.firstElementChild) {
            return;
        }
        while (this.mount_.firstElementChild) {
            region_1.Region.RemoveElement(this.mount_.firstElementChild);
            this.mount_.removeChild(this.mount_.firstElementChild);
        }
        try {
            if (this.handlers_.onEmptyMount) {
                this.handlers_.onEmptyMount();
            }
        }
        catch (_a) { }
    }
    Get_(tryJson, onLoad, onError) {
        let request = new XMLHttpRequest(), checkpoint = (this.noOverlap_ ? ++this.overlapCheckpoint_ : null), onProgress = this.handlers_.onProgress;
        if (onProgress) { //Bind on progress
            request.addEventListener('progress', (e) => {
                try {
                    if ((checkpoint === null || checkpoint == this.overlapCheckpoint_) && e.lengthComputable) {
                        onProgress((e.loaded / e.total) * 100);
                    }
                }
                catch (_a) { }
            });
        }
        request.addEventListener('error', () => {
            if (checkpoint !== null && checkpoint != this.overlapCheckpoint_) {
                return;
            }
            let err = {
                status: request.status,
                statusText: request.statusText,
            };
            try {
                if (onError) {
                    onError(err);
                }
            }
            catch (_a) { }
            try {
                if (this.handlers_.onError) {
                    this.handlers_.onError(err);
                }
            }
            catch (_b) { }
        });
        request.addEventListener('load', () => {
            if (checkpoint !== null && checkpoint != this.overlapCheckpoint_) {
                return;
            }
            let parsedData;
            try {
                if (tryJson) {
                    parsedData = JSON.parse(request.responseText);
                    if (region_1.Region.Alert(parsedData)) {
                        return;
                    }
                }
                else {
                    parsedData = request.responseText;
                }
            }
            catch (_a) {
                parsedData = request.responseText;
            }
            try {
                if (onLoad) {
                    onLoad(parsedData);
                }
            }
            catch (_b) { }
            try {
                if (this.handlers_.onLoad) {
                    this.handlers_.onLoad(parsedData);
                }
            }
            catch (_c) { }
        });
        try {
            if (this.handlers_.onBeforeRequest) {
                this.handlers_.onBeforeRequest(this.url_, this.mode_);
            }
        }
        catch (_a) { }
        request.open('GET', this.url_);
        request.send();
        return request;
    }
    GetList_(onLoad, onError, region) {
        let regionId = region === null || region === void 0 ? void 0 : region.GetId();
        this.Get_(true, (response) => {
            if (Array.isArray(response)) {
                response.forEach((item) => {
                    onLoad(item, true);
                });
            }
            else if (this.mount_) {
                region_1.Region.InsertHtml(this.mount_, generic_1.DirectiveHandler.ToString(response), (this.mode_ == FetchMode.Replace), (this.mode_ == FetchMode.Append), region_1.Region.Get(regionId));
            }
            else if (onLoad) {
                onLoad(generic_1.DirectiveHandler.ToString(response), false);
            }
        }, onError);
    }
    SetProp_(prop, value, force = false) {
        let response = (this.handlers_.onBeforePropSet ? (this.handlers_.onBeforePropSet(prop, value) ? true : false) : null);
        if (response === false) {
            return false;
        }
        if (prop === 'url') {
            if (typeof value === 'string' && (value = value.trim()) !== this.url_ || force) {
                this.url_ = value;
                this.AlertAccess_(prop, false, value);
            }
            else if ((value === null || value === undefined) && (value !== this.url_ || force)) {
                this.url_ = value;
                this.AlertAccess_(prop, false, value);
            }
        }
        else if (prop === 'mount') {
            if (force || value !== this.mount_) {
                this.mount_ = value;
                this.AlertAccess_(prop, false, value);
            }
        }
        else if (prop === 'handlers') {
            if (force || value !== this.handlers_) {
                this.handlers_ = value;
                this.AlertAccess_(prop, false, value);
            }
        }
        else if (prop === 'mode') {
            let mode = null;
            if (typeof value === 'number') {
                if (value == 0) {
                    mode = FetchMode.Replace;
                }
                else if (value == 1) {
                    mode = FetchMode.Append;
                }
                else if (value == 2) {
                    mode = FetchMode.Prepend;
                }
            }
            else if (typeof value === 'string') {
                if (value === 'replace') {
                    mode = FetchMode.Replace;
                }
                else if (value == 'append') {
                    mode = FetchMode.Append;
                }
                else if (value == 'prepend') {
                    mode = FetchMode.Prepend;
                }
            }
            if (mode !== null && (force || mode !== this.mode_)) {
                this.mode_ = mode;
                this.AlertAccess_(prop, false, mode);
            }
        }
        else if (response && this.handlers_.onPropSet) {
            try {
                this.handlers_.onPropSet(prop, value);
            }
            catch (_a) { }
        }
        return true;
    }
    AlertAccess_(prop, isGet, value) {
        if (!isGet) {
            if (this.handlers_.onPropSet) {
                try {
                    this.handlers_.onPropSet(prop, value);
                }
                catch (_a) { }
            }
            if (this.onPropSet_) {
                this.onPropSet_(prop);
            }
        }
        else if (this.handlers_.onPropGet) {
            try {
                this.handlers_.onPropGet(prop);
            }
            catch (_b) { }
        }
    }
    static HandleJsonResponse(response) {
        if (response.ok) {
            return response.json();
        }
        let alertHandler = region_1.Region.GetAlertHandler();
        if (alertHandler) {
            alertHandler.ServerError({
                status: response.status,
                statusText: response.statusText,
            });
        }
    }
    static HandleTextResponse(response) {
        if (response.ok) {
            return response.text();
        }
        let alertHandler = region_1.Region.GetAlertHandler();
        if (alertHandler) {
            alertHandler.ServerError({
                status: response.status,
                statusText: response.statusText,
            });
        }
    }
}
exports.Fetch = Fetch;
