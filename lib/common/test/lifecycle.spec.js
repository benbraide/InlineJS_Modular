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
const lifecycle_1 = require("../directives/lifecycle");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new lifecycle_1.InitDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new lifecycle_1.UninitDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new lifecycle_1.PostDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new lifecycle_1.BindDirectiveHandler());
mocha_1.describe('data lifecycle', () => {
    mocha_1.it('should execute \'x-init\' on element initialization', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo" x-init="foo = 'bar'"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
    }));
    mocha_1.it('should prevent \'x-init\' from being reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: '', other: 'bar' }">
                <span x-text="foo" x-init="foo = other"></span>
                <button x-on:click="other = 'baz'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
    }));
    mocha_1.it('should execute \'x-uninit\' on element removal', () => __awaiter(void 0, void 0, void 0, function* () {
        const runObservers = [];
        global.MutationObserver = class {
            constructor(callback) {
                runObservers.push(callback);
            }
            observe() { }
        };
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
                <span x-uninit="foo = 'baz'"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        let span = document.querySelectorAll('span')[1];
        span.parentElement.removeChild(span);
        runObservers.forEach(cb => cb([
            {
                target: document.body.firstElementChild,
                type: 'childList',
                addedNodes: [],
                removedNodes: [span],
            }
        ]));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('baz'); });
    }));
    mocha_1.it('should execute \'x-post\' after all other directives and offspring directives are evaluated', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }" x-post="foo = 'post'">
                <span x-text="foo" x-init="foo = 'bar'"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('post'); });
    }));
    mocha_1.it('should execute \'x-post\' after offspring x-post directives are evaluated', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }" x-post="foo = 'post'">
                <span x-text="foo" x-post="foo = 'bar'"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('post'); });
    }));
    mocha_1.it('should execute \'x-bind\' on element initialization', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo" x-bind="foo = 'bar'"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
    }));
    mocha_1.it('should ensure \'x-bind\' is reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: '', other: 'bar' }">
                <span x-text="foo" x-bind="foo = other"></span>
                <button x-on:click="other = 'baz'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should bind elements added to the DOM after initial attachment', () => __awaiter(void 0, void 0, void 0, function* () {
        const runObservers = [];
        global.MutationObserver = class {
            constructor(callback) {
                runObservers.push(callback);
            }
            observe() { }
        };
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        let tmpl = document.createElement('template');
        tmpl.innerHTML = `
            <span x-init="foo = 'baz'"></span>
            <button @click="foo = 'clicked'"></button>
        `;
        let newEls = Array.from(tmpl.content.children).map(child => child.cloneNode(true));
        newEls.forEach(el => document.body.firstElementChild.appendChild(el));
        runObservers.forEach(cb => cb([
            {
                target: document.body.firstElementChild,
                type: 'childList',
                addedNodes: newEls,
                removedNodes: [],
            }
        ]));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('baz'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('clicked'); });
    }));
});
