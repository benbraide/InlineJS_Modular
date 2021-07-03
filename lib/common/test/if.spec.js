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
const if_1 = require("../directives/if");
const each_1 = require("../directives/each");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new if_1.IfDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new each_1.EachDirectiveHandler());
mocha_1.describe('x-if directive', () => {
    mocha_1.it('should be reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ show: false }">
                <button x-on:click="show = ! show"></button>
                <template x-if="show">
                    <p></p>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(!document.querySelector('p')).equal(true);
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(!document.querySelector('p')).equal(false); });
    }));
    mocha_1.it('should contain reactive elements', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ show: false, foo: 'bar' }">
                <h1 x-on:click="show = ! show"></h1>
                <template x-if="show">
                    <h2 x-on:click="foo = 'baz'"></h2>
                </template>
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(!document.querySelector('h2')).equal(true);
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.click(document.querySelector('h1'));
        yield dom_1.waitFor(() => { chai_1.expect(!document.querySelector('h2')).equal(false); });
        user_event_1.default.click(document.querySelector('h2'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should work inside a loop', () => {
        document.body.innerHTML = `
            <div x-data="{ foos: [{bar: 'baz'}, {bar: 'bop'}]}">
                <template x-each="foos">
                    <template x-if="$each.value.bar === 'baz'">
                        <span x-text="$each.value.bar"></span>
                    </template>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span').length).equal(1);
        chai_1.expect(document.querySelector('span').textContent).equal('baz');
    });
    mocha_1.it('should attach event listeners once', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ count: 0 }">
                <span x-text="count"></span>
                <template x-if="true">
                    <button x-on:click="count += 1">Click me</button>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('0');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('1'); });
    }));
});
