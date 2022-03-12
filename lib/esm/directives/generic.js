import { DirectiveHandlerReturn } from '../typedefs';
import { Region } from '../region';
import { Value } from '../proxy';
export class DirectiveHandler {
    constructor(key_, handler_, isMount_ = false) {
        this.key_ = key_;
        this.handler_ = handler_;
        this.isMount_ = isMount_;
        this.dataStorage_ = {};
        this.dataStorageCounter_ = 0;
    }
    GetKey() {
        return this.key_;
    }
    IsMount() {
        return this.isMount_;
    }
    Handle(region, element, directive) {
        return this.handler_(region, element, directive);
    }
    Expunge(element) {
        Object.keys(this.dataStorage_).forEach((key) => {
            if (this.dataStorage_[key].element === element) {
                delete this.dataStorage_[key];
            }
        });
    }
    AddStorage_(data, element) {
        let key = `${this.key_}.store.${this.dataStorageCounter_++}`;
        this.dataStorage_[key] = {
            data: data,
            element: element,
        };
        return key;
    }
    RemoveStorage_(key) {
        delete this.dataStorage_[key];
    }
    static CreateProxy(getter, contains, setter, target) {
        return Region.CreateProxy(getter, contains, setter, target);
    }
    static Evaluate(region, element, expression, ctxName, ctx, useWindow = false) {
        return DirectiveHandler.DoEvaluation(region, element, expression, true, false, ctxName, ctx, useWindow);
    }
    static EvaluateAlways(region, element, expression, ctxName, ctx, useWindow = false) {
        return DirectiveHandler.DoEvaluation(region, element, expression, false, false, ctxName, ctx, useWindow);
    }
    static BlockEvaluate(region, element, expression, ctxName, ctx, useWindow = false) {
        return DirectiveHandler.DoEvaluation(region, element, expression, true, true, ctxName, ctx, useWindow);
    }
    static BlockEvaluateAlways(region, element, expression, ctxName, ctx, useWindow = false) {
        return DirectiveHandler.DoEvaluation(region, element, expression, false, true, ctxName, ctx, useWindow);
    }
    static DoEvaluation(region, element, expression, ignoreRemoved, useBlock, ctxName, ctx, useWindow = false) {
        if (!region) {
            return null;
        }
        let result;
        let evaluator = region.GetEvaluator(), state = region.GetState();
        evaluator.GetScopeRegionIds().Push(region.GetId());
        state.PushContext(state.ElementContextKey(), element);
        if (ctxName) { //Push provided context
            state.PushContext(ctxName, ctx);
        }
        try {
            result = evaluator.Evaluate(region.GetId(), element, expression, useWindow, ignoreRemoved, useBlock);
            result = ((result instanceof Value) ? result.Get() : result);
        }
        catch (err) {
            state.ReportError(err, `InlineJs.Region<${region.GetId()}>.CoreDirectiveHandlers.Evaluate(${expression})`);
        }
        finally {
            if (ctxName) { //Pop provided context
                state.PopContext(ctxName);
            }
            state.PopContext(state.ElementContextKey());
            evaluator.GetScopeRegionIds().Pop();
        }
        return result;
    }
    static Call(region, callback, ...args) {
        try {
            return region.Call(callback, ...args);
        }
        catch (err) {
            region.GetState().ReportError(err, 'CoreDirectiveHandlers.Call');
        }
    }
    static ExtractDuration(value, defaultValue) {
        const regex = /[0-9]+(s|ms)?/;
        if (!value || !value.match(regex)) {
            return defaultValue;
        }
        if (value.indexOf('m') == -1 && value.indexOf('s') != -1) { //Seconds
            return (parseInt(value) * 1000);
        }
        return parseInt(value);
    }
    static ToString(value) {
        return Region.ToString(value);
    }
    static GetChildElementIndex(element) {
        if (!element.parentElement) {
            return -1;
        }
        for (let i = 0; i < element.parentElement.children.length; ++i) {
            if (element.parentElement.children[i] === element) {
                return i;
            }
        }
        return -1;
    }
    static GetChildElementAt(region, parent, index, after) {
        let offset = 0;
        if (after) { //Move past 'after' child
            for (let i = 0; i < parent.children.length; ++i) {
                ++offset;
                if (parent.children[i] === after) {
                    break;
                }
            }
        }
        let skipChildren = (children, startIndex, count) => {
            for (; (startIndex < children.length && 0 < count); ++startIndex, --count) {
                let scope = region.GetElementScope(parent.children.item(startIndex));
                if (scope && scope.controlCount) { //Skip
                    let currentSkip = skipChildren(parent.children, (startIndex + 1), scope.controlCount);
                    startIndex += currentSkip;
                }
            }
            return startIndex;
        };
        for (; (offset < parent.children.length && 0 < index); ++offset, --index) {
            let scope = region.GetElementScope(parent.children.item(offset));
            if (scope && scope.controlCount) { //Skip
                offset += skipChildren(parent.children, (offset + 1), scope.controlCount);
            }
        }
        return ((offset < parent.children.length) ? parent.children.item(offset) : null);
    }
    static InsertOrAppendChildElement(region, parent, element, index, after) {
        let sibling = DirectiveHandler.GetChildElementAt(region, parent, index, after);
        if (sibling) {
            parent.insertBefore(element, sibling);
        }
        else { //Append
            parent.appendChild(element);
        }
    }
    static IsEventRequest(key) {
        const requestList = ['bind', 'event', 'on'];
        return requestList.includes(key);
    }
    static CheckEvents(key, region, element, directive, defaultEvent, events) {
        var _a;
        const optionsWhitelist = ['outside', 'window', 'document'];
        if (defaultEvent && (directive.arg.key === defaultEvent || DirectiveHandler.IsEventRequest((_a = directive.arg) === null || _a === void 0 ? void 0 : _a.key))) {
            return region.ForwardEventBinding(element, directive.value, directive.arg.options.filter(option => !optionsWhitelist.includes(option)), `${key}.${defaultEvent}`);
        }
        if (events && events.includes(directive.arg.key)) {
            return region.ForwardEventBinding(element, directive.value, directive.arg.options.filter(option => !optionsWhitelist.includes(option)), `${key}.${directive.arg.key}`);
        }
        return DirectiveHandlerReturn.Nil;
    }
}
