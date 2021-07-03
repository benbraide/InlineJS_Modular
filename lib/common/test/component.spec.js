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
const component_1 = require("../globals/component");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
let randomString = require("randomstring");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new data_1.ComponentDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
region_1.Region.GetGlobalManager().AddHandler(new meta_1.UseGlobalHandler());
region_1.Region.GetGlobalManager().AddHandler(new component_1.ComponentKeyGlobalHandler());
region_1.Region.GetGlobalManager().AddHandler(new component_1.ComponentGlobalHandler());
mocha_1.describe('component', () => {
    mocha_1.it('can be initialized with the \'x-component\' directive', () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data x-component="${key}">
                <span x-text="$componentKey"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal(key);
    });
    mocha_1.it('can be initialized with the \'$component\' key during data initialization', () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ $component: '${key}' }">
                <span x-text="$componentKey"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal(key);
    });
    mocha_1.it('can retrieve the current component via the $componentKey global magic property', () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ $component: '${key}' }">
                <span x-text="$componentKey"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal(key);
    });
    mocha_1.it('can retrieve another component via the $component global magic property', () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }" x-component="${key}"></div>
            <div x-data>
                <span x-text="$component('${key}').foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
    });
    mocha_1.it('should ensure data retrieved from other components are reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }" x-component="${key}">
                <span x-text="foo"></span>
                <button x-on:click="foo='changed in ${key}'"></button>
            </div>
            <div x-data="{ foo: 'baz' }">
                <span x-text="foo"></span>
                <span x-text="$component('${key}').foo"></span>
                <button x-on:click="foo='unnamed changed'"></button>
                <button x-on:click="$component('${key}').foo='changed in unnamed'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('baz');
        chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('bar');
        user_event_1.default.click(document.querySelectorAll('button')[0]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('span')[0].textContent).equal(`changed in ${key}`);
            chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('baz');
            chai_1.expect(document.querySelectorAll('span')[2].textContent).equal(`changed in ${key}`);
        });
        user_event_1.default.click(document.querySelectorAll('button')[1]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('span')[0].textContent).equal(`changed in ${key}`);
            chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('unnamed changed');
            chai_1.expect(document.querySelectorAll('span')[2].textContent).equal(`changed in ${key}`);
        });
        user_event_1.default.click(document.querySelectorAll('button')[2]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('changed in unnamed');
            chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('unnamed changed');
            chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('changed in unnamed');
        });
    }));
    mocha_1.it('should obey per region optimized setting when accessing data from other components', () => __awaiter(void 0, void 0, void 0, function* () {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'} }" x-component="${key}">
                <span x-text="nested.foo"></span>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
            <div x-data="{ $enableOptimizedBinds: false }">
                <span x-text="$component('${key}').nested.foo"></span>
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
    mocha_1.it('should obey \'$use\' global magic property when accessing data from other components', () => __awaiter(void 0, void 0, void 0, function* () {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'} }" x-component="${key}">
                <span x-text="nested.foo"></span>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
            <div x-data>
                <span x-text="$use($component('${key}').nested.foo)"></span>
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
    mocha_1.it('should not be affected by optimized settings in other components', () => __awaiter(void 0, void 0, void 0, function* () {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ $enableOptimizedBinds: false, nested: {foo: 'bar'} }" x-component="${key}">
                <span x-text="nested.foo"></span>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
            <div x-data>
                <span x-text="$component('${key}').nested.foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('unoptimized'); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('bar'); });
    }));
});
