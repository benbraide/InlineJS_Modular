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
const each_1 = require("../directives/each");
const meta_1 = require("../globals/meta");
const proxy_1 = require("../globals/proxy");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new data_1.RefDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new each_1.EachDirectiveHandler());
region_1.Region.GetGlobalManager().AddHandler(new meta_1.NextTickGlobalHandler());
region_1.Region.GetGlobalManager().AddHandler(new proxy_1.RefsGlobalHandler());
mocha_1.describe('$nextTick global magic property', () => {
    mocha_1.it('should execute attached callback', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-ref="span" x-text="foo"></span>
                <button x-on:click="foo = 'baz'; $nextTick(() => { $refs.span.textContent = 'bob' })"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => chai_1.expect(document.querySelector('span').textContent).equal('bob'));
    }));
    mocha_1.it('should wait for x-each directive to finish rendering', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ $enableOptimizedBinds: false, list: ['one', 'two'], check: 2 }">
                <template x-each="list">
                    <span x-text="$each.value"></span>
                </template>
                <p x-text="check"></p>
                <button x-on:click="list = ['one', 'two', 'three']; $nextTick(() => { check = document.querySelectorAll('span').length })"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('p').textContent).equal('2');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('p').textContent).equal('3'); });
    }));
});
