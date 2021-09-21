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
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
mocha_1.describe('x-text directive', () => {
    mocha_1.it('should set text content on init', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
    }));
    mocha_1.it('should be reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <button x-on:click="foo = 'baz'"></button>
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('baz'); });
    }));
    mocha_1.it('should work on INPUT elements', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <input x-text="foo">
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('input').value).equal('bar'); });
    }));
    mocha_1.it('should treat checkbox INPUT elements as boolean entities', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: true }">
                <input type="checkbox" x-text="foo">
                <button x-on:click="foo = false"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('input').checked).equal(true); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('input').checked).equal(false); });
    }));
});
