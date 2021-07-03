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
const watch_1 = require("../globals/watch");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
region_1.Region.GetGlobalManager().AddHandler(new watch_1.WatchGlobalHandler());
mocha_1.describe('$watch global magic property', () => {
    mocha_1.it('should be reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar', bob: 'lob' }" x-init="$watch('foo', value => { bob = value })">
                <h1 x-text="foo"></h1>
                <h2 x-text="bob"></h2>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('h1').textContent).equal('bar');
        chai_1.expect(document.querySelector('h2').textContent).equal('lob');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('h1').textContent).equal('baz');
            chai_1.expect(document.querySelector('h2').textContent).equal('baz');
        });
    }));
    mocha_1.it('should support nested properties', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: { bar: 'baz', bob: 'lob' } }" x-init="$watch('foo.bar', value => { foo.bob = value })">
                <h1 x-text="foo.bar"></h1>
                <h2 x-text="foo.bob"></h2>
                <button x-on:click="foo.bar = 'law'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('h1').textContent).equal('baz');
        chai_1.expect(document.querySelector('h2').textContent).equal('lob');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('h1').textContent).equal('law');
            chai_1.expect(document.querySelector('h2').textContent).equal('law');
        });
    }));
    mocha_1.it('should be reactive with arrays', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ $enableOptimizedBinds: false, foo: ['one'], bob: 'lob' }" x-init="$watch('foo', value => { bob = value.map(item => item) })">
                <h1 x-text="foo"></h1>
                <h2 x-text="bob"></h2>
                <button id="push" x-on:click="foo.push('two')"></button>
                <button id="pop" x-on:click="foo.pop()"></button>
                <button id="unshift" x-on:click="foo.unshift('zero')"></button>
                <button id="shift" x-on:click="foo.shift()"></button>
                <button id="assign" x-on:click="foo = [2,1,3]"></button>
                <button id="sort" x-on:click="foo.sort()"></button>
                <button id="reverse" x-on:click="foo.reverse()"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('h1').textContent).equal('["one"]');
        chai_1.expect(document.querySelector('h2').textContent).equal('lob');
        user_event_1.default.click(document.querySelector('#push'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('h1').textContent).equal('["one","two"]');
            chai_1.expect(document.querySelector('h2').textContent).equal('["one","two"]');
        });
        user_event_1.default.click(document.querySelector('#pop'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('h1').textContent).equal('["one"]');
            chai_1.expect(document.querySelector('h2').textContent).equal('["one"]');
        });
        user_event_1.default.click(document.querySelector('#unshift'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('h1').textContent).equal('["zero","one"]');
            chai_1.expect(document.querySelector('h2').textContent).equal('["zero","one"]');
        });
        user_event_1.default.click(document.querySelector('#shift'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('h1').textContent).equal('["one"]');
            chai_1.expect(document.querySelector('h2').textContent).equal('["one"]');
        });
        user_event_1.default.click(document.querySelector('#assign'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('h1').textContent).equal('[2,1,3]');
            chai_1.expect(document.querySelector('h2').textContent).equal('[2,1,3]');
        });
        user_event_1.default.click(document.querySelector('#sort'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('h1').textContent).equal('[1,2,3]');
            chai_1.expect(document.querySelector('h2').textContent).equal('[1,2,3]');
        });
        user_event_1.default.click(document.querySelector('#reverse'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('h1').textContent).equal('[3,2,1]');
            chai_1.expect(document.querySelector('h2').textContent).equal('[3,2,1]');
        });
    }));
    mocha_1.it('should support nested arrays', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ $enableOptimizedBinds: false, foo: {baz: ['one']}, bob: 'lob' }" x-init="$watch('foo.baz', value => { bob = value })">
                <h1 x-text="foo.baz"></h1>
                <h2 x-text="bob"></h2>
                <button id="push" x-on:click="foo.baz.push('two')"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('h1').textContent).equal('["one"]');
        chai_1.expect(document.querySelector('h2').textContent).equal('lob');
        user_event_1.default.click(document.querySelector('#push'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('h1').textContent).equal('["one","two"]');
            chai_1.expect(document.querySelector('h2').textContent).equal('["one","two"]');
        });
    }));
    mocha_1.it('should support magic properties', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar', bob: 'car' }" x-component="magic_prop" x-init="$watch('$component(\\'magic_prop\\').foo', value => bob = value)">
                <span x-text="bob"></span>
                <button x-on:click="$component('magic_prop').foo = 'far'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('car');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('far'); });
    }));
});
