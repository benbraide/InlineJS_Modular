"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const region_1 = require("../region");
const bootstrap_1 = require("../bootstrap");
const data_1 = require("../directives/data");
const text_1 = require("../directives/text");
const on_1 = require("../directives/on");
const meta_1 = require("../globals/meta");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
region_1.Region.GetGlobalManager().AddHandler(new meta_1.UseGlobalHandler());
region_1.Region.GetGlobalManager().AddHandler(new meta_1.StaticGlobalHandler());
mocha_1.describe('data binding', () => {
    mocha_1.it('should be reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should be optimized by default', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'} }">
                <span x-text="nested.foo"></span>
                <span x-text="nested"></span>
                <button x-on:click="nested.foo = 'baz'"></button>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"bar"}');
        user_event_1.default.click(document.querySelectorAll('button')[0]);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('baz'); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"baz"}'); });
        user_event_1.default.click(document.querySelectorAll('button')[1]);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"unoptimized"}'); });
    }));
    mocha_1.it('should obey global optimized setting', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'} }">
                <span x-text="nested.foo"></span>
                <span x-text="nested"></span>
                <button x-on:click="nested.foo = 'baz'"></button>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
        `;
        region_1.Region.GetConfig().SetOptimizedBindsState(false);
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"bar"}');
        user_event_1.default.click(document.querySelectorAll('button')[0]);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('baz'); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"baz"}'); });
        user_event_1.default.click(document.querySelectorAll('button')[1]);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('unoptimized'); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"unoptimized"}'); });
        region_1.Region.GetConfig().SetOptimizedBindsState(true);
    }));
    mocha_1.it('should obey per region optimized setting', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'}, $enableOptimizedBinds: false }">
                <span x-text="nested.foo"></span>
                <span x-text="nested"></span>
                <button x-on:click="nested.foo = 'baz'"></button>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"bar"}');
        user_event_1.default.click(document.querySelectorAll('button')[0]);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('baz'); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"baz"}'); });
        user_event_1.default.click(document.querySelectorAll('button')[1]);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('unoptimized'); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"unoptimized"}'); });
    }));
    mocha_1.it('should obey \'$use\' global magic property', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'} }">
                <span x-text="nested.foo"></span>
                <span x-text="$use(nested.foo)"></span>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar'); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('unoptimized'); });
    }));
    mocha_1.it('should obey \'$static\' global magic property', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
                <span x-text="$static(foo)"></span>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('baz'); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('bar'); });
    }));
});
