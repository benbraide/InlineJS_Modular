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
const attr_1 = require("../directives/attr");
const on_1 = require("../directives/on");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new attr_1.ClassDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
mocha_1.describe('x-on directive', () => {
    mocha_1.it('should reflect modified data in event listener to attribute bindings', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <button x-on:click="foo = 'baz'"></button>
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should reflect modified nested data in event listener to attribute bindings', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ nested: { foo: 'bar' }}">
                <button x-on:click="nested.foo = 'baz'"></button>
                <span x-text="nested.foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should stop propagation with the \'.stop\' modifier', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }" x-on:click="foo = 'bubbled'">
                <button x-on:click="foo = 'baz'"></button>
                <button x-on:click.stop="foo = 'baz'"></button>
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.click(document.querySelectorAll('button')[0]);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bubbled'); });
        user_event_1.default.click(document.querySelectorAll('button')[1]);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should prevent default with the \'.prevent\' modifier', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{}">
                <input type="checkbox" x-on:click>
                <input type="checkbox" x-on:click.prevent>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('input')[0].checked).equal(false);
        chai_1.expect(document.querySelectorAll('input')[1].checked).equal(false);
        user_event_1.default.click(document.querySelectorAll('input')[0]);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('input')[0].checked).equal(true); });
        user_event_1.default.click(document.querySelectorAll('input')[1]);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('input')[1].checked).equal(false); });
    }));
    mocha_1.it('should only trigger when event target is element with the \'.self\' modifier', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <div x-on:click.self="foo = 'baz'" id="selfTarget">
                    <button></button>
                </div>
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.click(document.querySelector('#selfTarget'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should bind event on the window object with the \'.window\' modifier', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <div x-on:click.window="foo = 'baz'"></div>
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.click(document.body);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should bind event on the document object with the \'.document\' modifier', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <div x-on:click.document="foo = 'baz'"></div>
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.click(document.body);
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should only trigger when target is not element or contained inside element with the \'.outside\' modifier', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ isOpen: true }">
                <ul x-class:hidden="! isOpen" x-on:click.outside="isOpen = false">
                    <li x-on:click="isOpen = true">...</li>
                </ul>
                <button></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('ul').classList.contains('hidden')).equal(false);
        user_event_1.default.click(document.querySelector('li'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('ul').classList.contains('hidden')).equal(false); });
        user_event_1.default.click(document.querySelector('ul'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('ul').classList.contains('hidden')).equal(false); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('ul').classList.contains('hidden')).equal(true); });
        user_event_1.default.click(document.querySelector('li'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('ul').classList.contains('hidden')).equal(false); });
    }));
    mocha_1.it('should trigger only once with the \'.once\' modifier', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ count: 0 }">
                <button x-on:click.once="++count"></button>
                <span x-text="count"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('0');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('1'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('1'); });
    }));
    mocha_1.it('should handle keydown events with modifiers', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ count: 0 }">
                <input type="text" x-on:keydown="count++" x-on:keydown.enter="count++" x-on:keydown.space="count++">
                <span x-text="count"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('0');
        user_event_1.default.type(document.querySelector('input'), '{enter}');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('2'); });
        user_event_1.default.type(document.querySelector('input'), ' ');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('4'); });
        user_event_1.default.type(document.querySelector('input'), '{space}');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('6'); });
        user_event_1.default.type(document.querySelector('input'), '{esc}');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('7'); });
    }));
    mocha_1.it('should handle keydown events with exclusive modifiers', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ count: 0 }">
                <input type="text" x-on:keydown="count++" x-on:keydown.enter.space="count++">
                <span x-text="count"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('0');
        user_event_1.default.type(document.querySelector('input'), '{enter}');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('2'); });
        user_event_1.default.type(document.querySelector('input'), ' ');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('4'); });
        user_event_1.default.type(document.querySelector('input'), '{space}');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('6'); });
        user_event_1.default.type(document.querySelector('input'), '{esc}');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('7'); });
    }));
    mocha_1.it('should handle keydown events with combo modifiers', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ count: 0 }">
                <input type="text" x-on:keydown.ctrl.enter="count++">
                <span x-text="count"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('0');
        user_event_1.default.type(document.querySelector('input'), '{enter}');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('0'); });
        user_event_1.default.type(document.querySelector('input'), '{ctrl}{enter}');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('1'); });
    }));
    mocha_1.it('should only stop propagation for keydown with specified key and the \'.stop\' modifier', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ count: 0 }">
                <article x-on:keydown="count++">
                    <input type="text" x-on:keydown.enter.stop>
                </article>
                <span x-text="count"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('0');
        user_event_1.default.type(document.querySelector('input'), '{esc}');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('1'); });
        user_event_1.default.type(document.querySelector('input'), '{enter}');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('1'); });
    }));
    mocha_1.it('should support short syntax', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <button @click="foo = 'baz'"></button>
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should support event with colon', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <div x-on:my:event.document="foo = 'baz'"></div>
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        document.dispatchEvent(new CustomEvent('my:event'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should bind to the proper event with the \'.join\' modifier', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <div x-on:my-event.join.document="foo = 'baz'"></div>
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        document.dispatchEvent(new CustomEvent('my.event'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should bind to the proper event with the \'.camel\' modifier', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <div x-on:my-event.camel.document="foo = 'baz'"></div>
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        document.dispatchEvent(new CustomEvent('myEvent'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
});
