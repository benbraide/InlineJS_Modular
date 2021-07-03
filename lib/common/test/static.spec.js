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
const component_1 = require("../globals/component");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new data_1.ComponentDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new lifecycle_1.StaticDirectiveHandler());
region_1.Region.GetGlobalManager().AddHandler(new component_1.ComponentKeyGlobalHandler());
mocha_1.describe('x-static directive', () => {
    mocha_1.it('should disable reactivity', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <button x-on:click="foo = 'baz'"></button>
                <span x-text="foo"></span>
                <span x-static:text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('baz');
            chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('bar');
        });
    }));
    mocha_1.it('can be used on the \'x-data\'', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-static:data="{ foo: 'bar' }">
                <span x-text="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap(true);
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('bar');
    }));
    mocha_1.it('can be used on the x-component directive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }" x-static:component="static">
                <span x-text="\`\${$componentKey}.\${foo}\`"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').textContent).equal('static.bar');
    }));
});
