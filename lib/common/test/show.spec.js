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
const show_1 = require("../directives/show");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new show_1.ShowDirectiveHandler());
mocha_1.describe('x-show directive', () => {
    mocha_1.it('should toggle display: none; with no other style attributes', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ show: true }">
                <span x-show="show"></span>
                <button x-on:click="show = false"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').getAttribute('style')).equal(null);
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').getAttribute('style')).equal('display: none;'); });
    }));
    mocha_1.it('should toggle display: none; with other style attributes', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ show: true }">
                <span x-show="show" style="color: blue;"></span>
                <button x-on:click="show = false"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').getAttribute('style')).equal('color: blue;');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').getAttribute('style')).equal('color: blue; display: none;'); });
    }));
});
