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
const window_1 = require("../globals/window");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
let randomString = require("randomstring");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
region_1.Region.GetGlobalManager().AddHandler(new meta_1.UseGlobalHandler());
region_1.Region.GetGlobalManager().AddHandler(new window_1.WindowGlobalHandler());
mocha_1.describe('x-data directive', () => {
    mocha_1.it('should be set as the default mount point', () => {
        chai_1.expect(region_1.Region.GetDirectiveManager().GetMountDirectiveName()).equal('data');
    });
    mocha_1.it('should be reactive when manipulated on component object', () => __awaiter(void 0, void 0, void 0, function* () {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ $component: '${key}', foo: 'bar' }">
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        region_1.Region.Find(key, true)['foo'] = 'baz';
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should have an optional attribute value', () => {
        document.body.innerHTML = `
            <div x-data>
                <span x-text="'foo'"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('foo');
    });
    mocha_1.it('can use \'this\'', () => {
        document.body.innerHTML = `
            <div x-data="{ text: this.dataset.text }" data-text="test">
              <span x-text="text"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('test');
    });
    mocha_1.it('should contain reactive functions', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar', getFoo() {return this.foo}}">
                <span x-text="getFoo()"></span>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('can be nested as scopes', () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
              <span x-text="foo"></span>
              <span x-text="$scope.foo"></span>
              <div x-data="{ foo: 'baz', other: 'value' }">
                <span x-text="foo"></span>
                <span x-text="$scope.foo"></span>
                <span x-text="$scope.other"></span>
                <span x-text="$scope.$parent.foo"></span>
              </div>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[3].textContent).equal('baz');
        chai_1.expect(document.querySelectorAll('span')[4].textContent).equal('value');
        chai_1.expect(document.querySelectorAll('span')[5].textContent).equal('bar');
    });
    mocha_1.it('should contain reactive scopes', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
                <div x-data="{ foo: 'baz' }">
                    <span x-text="foo"></span>
                    <span x-text="$scope.foo"></span>
                    <button x-on:click="$scope.foo = 'changed'"></button>
                </div>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('baz');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('changed'); });
    }));
    mocha_1.it('should not nest and duplicate proxies when manipulating an array', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ list: [ {name: 'foo'}, {name: 'bar'} ] }">
                <span x-text="$use(list[0].name)"></span>
                <button x-on:click="list.sort((a, b) => (a.name > b.name) ? 1 : -1)"></button>
                <h1 x-on:click="list.sort((a, b) => (a.name < b.name) ? 1 : -1)"></h1>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('foo'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.click(document.querySelector('h1'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('foo'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.click(document.querySelector('h1'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('foo'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.click(document.querySelector('h1'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('foo'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.click(document.querySelector('h1'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('foo'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.click(document.querySelector('h1'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('foo'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.click(document.querySelector('h1'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('foo'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
    }));
    mocha_1.it('should refresh one time per update whatever the number of mutations in the update', () => __awaiter(void 0, void 0, void 0, function* () {
        window['refreshCount'] = 0;
        document.body.innerHTML = `
            <div x-data="{ items: ['foo', 'bar'], qux: 'quux', test() {this.items; this.qux; return ++this.$window.refreshCount} }">
                <span x-text="test()"></span>
                <button x-on:click="(() => { items.push('baz'); qux = 'corge'; })()"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(window['refreshCount']).equal(1);
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(window['refreshCount']).equal(2); });
    }));
});
