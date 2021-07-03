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
const attr_1 = require("../directives/attr");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dom_1 = require("@testing-library/dom");
const user_event_1 = require("@testing-library/user-event");
region_1.Region.GetDirectiveManager().AddHandler(new data_1.DataDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new text_1.TextDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new on_1.OnDirectiveHandler());
region_1.Region.GetDirectiveManager().AddHandler(new attr_1.ClassDirectiveHandler());
mocha_1.describe('x-class directive', () => {
    mocha_1.it('should remove class when attribute value is falsy', () => {
        document.body.innerHTML = `
            <div x-data="{ foo: false }">
                <span class="foo" x-class:foo="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(false);
    });
    mocha_1.it('should add class when attribute value is truthy', () => {
        document.body.innerHTML = `
            <div x-data="{ foo: true }">
                <span x-class:foo="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
    });
    mocha_1.it('should be reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: true }">
                <span x-class:foo="foo"></span>
                <button x-on:click="foo = false"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(false); });
    }));
    mocha_1.it('should accept a key-value map', () => {
        document.body.innerHTML = `
            <div x-data="{ map: { foo: true, zoo: false } }">
                <span x-class="map"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
        chai_1.expect(document.querySelector('span').classList.contains('zoo')).equal(false);
    });
    mocha_1.it('should have reactive key-value map', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ map: { foo: true, zoo: false } }">
                <span x-class="map"></span>
                <button x-on:click="map.foo = !(map.zoo = true)"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
        chai_1.expect(document.querySelector('span').classList.contains('zoo')).equal(false);
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(false); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').classList.contains('zoo')).equal(true); });
    }));
    mocha_1.it('should accept the short form and be reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: true }">
                <span .foo="foo"></span>
                <button x-on:click="foo = false"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(false); });
    }));
    mocha_1.it('should be merged by string syntax', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ isOn: false }">
                <span class="foo" x-class="isOn ? 'bar': ''"></span>
                <button @click="isOn = ! isOn"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
        chai_1.expect(document.querySelector('span').classList.contains('bar')).equal(false);
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
            chai_1.expect(document.querySelector('span').classList.contains('bar')).equal(true);
        });
        document.querySelector('button').click();
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
            chai_1.expect(document.querySelector('span').classList.contains('bar')).equal(false);
        });
    }));
    mocha_1.it('should be merged by array syntax', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ isOn: false }">
                <span class="foo" x-class="isOn ? ['bar', 'baz'] : ['bar']"></span>
                <button @click="isOn = ! isOn"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
        chai_1.expect(document.querySelector('span').classList.contains('bar')).equal(true);
        chai_1.expect(document.querySelector('span').classList.contains('baz')).equal(false);
        document.querySelector('button').click();
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
            chai_1.expect(document.querySelector('span').classList.contains('bar')).equal(true);
            chai_1.expect(document.querySelector('span').classList.contains('baz')).equal(true);
        });
        document.querySelector('button').click();
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
            chai_1.expect(document.querySelector('span').classList.contains('bar')).equal(true);
            chai_1.expect(document.querySelector('span').classList.contains('baz')).equal(false);
        });
    }));
    mocha_1.it('should remove multiple classes by object syntax', () => {
        document.body.innerHTML = `
            <div x-data="{ isOn: false }">
                <span class="foo bar" x-class="{ 'foo bar': isOn }"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(false);
        chai_1.expect(document.querySelector('span').classList.contains('bar')).equal(false);
    });
    mocha_1.it('should add multiple classes by object syntax', () => {
        document.body.innerHTML = `
            <div x-data="{ isOn: true }">
                <span x-class="{ 'foo bar': isOn }"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
        chai_1.expect(document.querySelector('span').classList.contains('bar')).equal(true);
    });
    mocha_1.it('should be added by nested object syntax', () => {
        document.body.innerHTML = `
            <div x-data="{ nested: { isOn: true } }">
                <span x-class="{ 'foo': nested.isOn }"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
    });
    mocha_1.it('should be added by array syntax', () => {
        document.body.innerHTML = `
            <div x-data="{}">
                <span class="" x-class="['foo']"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
    });
    mocha_1.it('should be synced by string syntax', () => {
        document.body.innerHTML = `
            <div x-data="{foo: 'bar baz'}">
                <span class="" x-class="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('bar')).equal(true);
        chai_1.expect(document.querySelector('span').classList.contains('baz')).equal(true);
    });
    mocha_1.it('should ignore extra whitespace in object syntax', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data>
                <span x-class="{ '  foo  bar  ': true }"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
        chai_1.expect(document.querySelector('span').classList.contains('bar')).equal(true);
    }));
    mocha_1.it('should ignore extra whitespace in string syntax', () => {
        document.body.innerHTML = `
            <div x-data>
                <span x-class="'  foo  bar  '"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').classList.contains('foo')).equal(true);
        chai_1.expect(document.querySelector('span').classList.contains('bar')).equal(true);
    });
});
