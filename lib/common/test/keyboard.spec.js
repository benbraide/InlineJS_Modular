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
const data_2 = require("../directives/data");
const lifecycle_1 = require("../directives/lifecycle");
const lifecycle_2 = require("../directives/lifecycle");
const text_1 = require("../directives/text");
const on_1 = require("../directives/on");
const proxy_1 = require("../globals/proxy");
const keyboard_1 = require("../globals/keyboard");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new data_2.RefDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new lifecycle_1.InitDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new lifecycle_2.BindDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
region_1.Region.GetGlobalManager().AddHandler(new proxy_1.RefsGlobalHandler());
region_1.Region.GetGlobalManager().AddHandler(new keyboard_1.KeyboardGlobalHandler());
mocha_1.describe('$keyboard global magic property', () => {
    mocha_1.it('should report correct states for the \'down\' property', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ value: '' }">
                <input x-bind="value = $keyboard.down">
                <span x-text="value"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('');
        user_event_1.default.type(document.querySelector('input'), 'k');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('k'); });
        user_event_1.default.type(document.querySelector('input'), 'b');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('b'); });
    }));
    mocha_1.it('should expose bindable methods', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <input x-init="$keyboard.keydown((e) => { foo = e.key })">
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.type(document.querySelector('input'), 'kb');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('b'); });
    }));
    mocha_1.it('should handle assignments to bindable properties', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <input x-init="$keyboard.keydown = (e) => { foo = e.key }">
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.type(document.querySelector('input'), 'kb');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('b'); });
    }));
    mocha_1.it('should expose a \'$$keyboard\' global property', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <input x-ref="ipt">
                <span x-text="foo" x-init="$$keyboard($refs.ipt).keydown((e) => { foo = e.key })"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
        user_event_1.default.type(document.querySelector('span'), 'kb');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.type(document.querySelector('input'), 'kb');
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('b'); });
    }));
});
