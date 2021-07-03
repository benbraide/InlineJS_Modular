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
mocha_1.describe('x-each directive', () => {
    mocha_1.it('should work on arrays', () => {
        document.body.innerHTML = `
            <div x-data>
                <template x-each="['foo', 'bar']">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${$each.count}\`"></p>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(2);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.foo.2');
        chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.bar.2');
    });
    mocha_1.it('should support the \'as <name>\' syntax on arrays', () => {
        document.body.innerHTML = `
            <div x-data>
                <template x-each="['foo', 'bar'] as item">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${item}.\${$each.count}\`"></p>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(2);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.foo.foo.2');
        chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.bar.bar.2');
    });
    mocha_1.it('should work on key-value pairs', () => {
        document.body.innerHTML = `
            <div x-data>
                <template x-each="{ name: 'John Doe', age: 36, gender: 'MALE' }">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${$each.count}\`"></p>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(3);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('name.John Doe.3');
        chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('age.36.3');
        chai_1.expect(document.querySelectorAll('p')[2].textContent).equal('gender.MALE.3');
    });
    mocha_1.it('should support the \'as <name>\' syntax on key-value pairs', () => {
        document.body.innerHTML = `
            <div x-data>
                <template x-each="{ name: 'John Doe', age: 36, gender: 'MALE' } as item">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${item}.\${$each.count}\`"></p>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(3);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('name.John Doe.John Doe.3');
        chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('age.36.36.3');
        chai_1.expect(document.querySelectorAll('p')[2].textContent).equal('gender.MALE.MALE.3');
    });
    mocha_1.it('should work on positive integer ranges', () => {
        document.body.innerHTML = `
            <div x-data>
                <template x-each="3">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${$each.count}\`"></p>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(3);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.0.3');
        chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.1.3');
        chai_1.expect(document.querySelectorAll('p')[2].textContent).equal('2.2.3');
    });
    mocha_1.it('should work on positive integer ranges with \'.count\' modifier', () => {
        document.body.innerHTML = `
            <div x-data>
                <template x-each.count="3">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${$each.count}\`"></p>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(3);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.1.3');
        chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.2.3');
        chai_1.expect(document.querySelectorAll('p')[2].textContent).equal('2.3.3');
    });
    mocha_1.it('should work on positive integer ranges with \'.reverse\' modifier', () => {
        document.body.innerHTML = `
            <div x-data>
                <template x-each.reverse="3">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${$each.count}\`"></p>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(3);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.2.3');
        chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.1.3');
        chai_1.expect(document.querySelectorAll('p')[2].textContent).equal('2.0.3');
    });
    mocha_1.it('should work on negative integer ranges', () => {
        document.body.innerHTML = `
            <div x-data>
                <template x-each="-3">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${$each.count}\`"></p>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(3);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.0.3');
        chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.-1.3');
        chai_1.expect(document.querySelectorAll('p')[2].textContent).equal('2.-2.3');
    });
    mocha_1.it('should support the \'as <name>\' syntax on integer ranges', () => {
        document.body.innerHTML = `
            <div x-data>
                <template x-each.count="3 as num">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${num}.\${$each.count}\`"></p>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(3);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.1.1.3');
        chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.2.2.3');
        chai_1.expect(document.querySelectorAll('p')[2].textContent).equal('2.3.3.3');
    });
    mocha_1.it('should be reactive when array is replaced', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ $enableOptimizedBinds: false, list: ['foo'] }">
                <template x-each="list">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${$each.count}\`"></p>
                </template>
                <button x-on:click="list = ['foo', 'bar']"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(1);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.foo.1');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('p').length).equal(2);
            chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.foo.2');
            chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.bar.2');
        });
    }));
    mocha_1.it('should be reactive when array is manipulated', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ list: ['foo'] }">
                <template x-each="list">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${$each.count}\`"></p>
                </template>
                <button x-on:click="list.push('bar')"></button>
                <button x-on:click="list.unshift('first')"></button>
                <button x-on:click="list.splice(1, 1)"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(1);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.foo.1');
        user_event_1.default.click(document.querySelectorAll('button')[0]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('p').length).equal(2);
            chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.foo.2');
            chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.bar.2');
        });
        user_event_1.default.click(document.querySelectorAll('button')[1]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('p').length).equal(3);
            chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.first.3');
            chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.foo.3');
            chai_1.expect(document.querySelectorAll('p')[2].textContent).equal('2.bar.3');
        });
        user_event_1.default.click(document.querySelectorAll('button')[2]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('p').length).equal(2);
            chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.first.2');
            chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.bar.2');
        });
    }));
    mocha_1.it('should support the \'as <name>\' syntax and be reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ $enableOptimizedBinds: false, list: ['foo'] }">
                <template x-each="list as item">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${item}.\${$each.count}\`"></p>
                </template>
                <button x-on:click="list = ['foo', 'bar']"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(1);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.foo.foo.1');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('p').length).equal(2);
            chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.foo.foo.2');
            chai_1.expect(document.querySelectorAll('p')[1].textContent).equal('1.bar.bar.2');
        });
    }));
    mocha_1.it('should remove all elements when array is empty', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ list: ['foo'] }">
                <template x-each="list">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${$each.count}\`"></p>
                </template>
                <button x-on:click="list = []"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(1);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('0.foo.1');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('p').length).equal(0); });
    }));
    mocha_1.it('should remove all elements when object is empty', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ list: {key: 'value'} }">
                <template x-each="list">
                    <p x-text="\`\${$each.index}.\${$each.value}.\${$each.count}\`"></p>
                </template>
                <button x-on:click="list = {}"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('p').length).equal(1);
        chai_1.expect(document.querySelectorAll('p')[0].textContent).equal('key.value.1');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('p').length).equal(0); });
    }));
    mocha_1.it('should contain reactive elements', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ items: ['first'], foo: 'bar' }">
                <button x-on:click="foo = 'baz'"></button>
                <template x-each="items">
                    <span>
                        <h1 x-text="\`\${$each.index}.\${$each.value}.\${$each.count}\`"></h1>
                        <h2 x-text="foo"></h2>
                    </span>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span').length).equal(1);
        chai_1.expect(document.querySelector('h1').textContent).equal('0.first.1');
        chai_1.expect(document.querySelector('h2').textContent).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelector('h1').textContent).equal('0.first.1');
            chai_1.expect(document.querySelector('h2').textContent).equal('baz');
        });
    }));
    mocha_1.it('can be used in conjunction with x-if directive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ items: ['foo', 'bar'], show: false }">
                <button @click="show = ! show"></button>
                <template x-if="show" x-each="items">
                    <span x-text="$each.value"></span>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span').length).equal(0);
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(2); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(0); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(2); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(0); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(2); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(0); });
    }));
    mocha_1.it('can be used in conjunction with x-if directive reversed', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ items: ['foo', 'bar'], show: false }">
                <button @click="show = ! show"></button>
                <template x-each="items" x-if="show">
                    <span x-text="$each.value"></span>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span').length).equal(0);
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(2); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(0); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(2); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(0); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(2); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(0); });
    }));
    mocha_1.it('should give listeners fresh iteration data even though they are only registered initially', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ items: ['foo'], output: '' }">
                <button x-on:click="items = ['bar']"></button>
                <template x-each="items">
                    <span x-text="$each.value" x-on:click="output = $each.value"></span>
                </template>
                <h1 x-text="output"></h1>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('span').length).equal(1);
        user_event_1.default.click(document.querySelector('span'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('h1').textContent).equal('foo'); });
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').textContent).equal('bar'); });
        user_event_1.default.click(document.querySelector('span'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('h1').textContent).equal('bar'); });
    }));
    mocha_1.it('can be nested', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ $enableOptimizedBinds: false, foos: [ { bars: ['bob', 'lob'] } ] }">
                <button x-on:click="foos = [ {bars: ['bob', 'lob']}, {bars: ['law']} ]"></button>
                <template x-each="foos">
                    <h1>
                        <template x-each="$each.value.bars">
                            <span x-text="$each.value"></span>
                        </template>
                    </h1>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('h1').length).equal(1); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(2); });
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bob');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('lob');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(3); });
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('bob');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('lob');
        chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('law');
    }));
    mocha_1.it('should be able to access parent data when nested', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foos: [ {name: 'foo', bars: ['bob', 'lob']}, {name: 'baz', bars: ['bab', 'lab']} ] }">
                <template x-each="foos">
                    <h1>
                        <template x-each="$each.value.bars">
                            <span x-text="$each.parent.value.name+': '+$each.value"></span>
                        </template>
                    </h1>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('h1').length).equal(2); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(4); });
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('foo: bob');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('foo: lob');
        chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('baz: bab');
        chai_1.expect(document.querySelectorAll('span')[3].textContent).equal('baz: lab');
    }));
    mocha_1.it('should support the \'as <name>\' syntax and be able to access parent data when nested', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foos: [ {name: 'foo', bars: ['bob', 'lob']}, {name: 'baz', bars: ['bab', 'lab']} ] }">
                <template x-each="foos as foo">
                    <h1>
                        <template x-each="foo.bars as bar">
                            <span x-text="foo.name+': '+bar"></span>
                        </template>
                    </h1>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('h1').length).equal(2); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(4); });
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('foo: bob');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('foo: lob');
        chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('baz: bab');
        chai_1.expect(document.querySelectorAll('span')[3].textContent).equal('baz: lab');
    }));
    mocha_1.it('should be able to handle nested event listeners', () => __awaiter(void 0, void 0, void 0, function* () {
        document['_alerts'] = [];
        document.body.innerHTML = `
            <div x-data="{ foos: [
                {name: 'foo', bars: [{name: 'bob', count: 0}, {name: 'lob', count: 0}]},
                {name: 'baz', bars: [{name: 'bab', count: 0}, {name: 'lab', count: 0}]}
            ], fnText: function(foo, bar) { return foo.name+': '+bar.name+' = '+bar.count; }, onClick: function(foo, bar){ bar.count += 1; document._alerts.push(this.fnText(foo, bar)) } }">
                <template x-each="foos">
                    <h1>
                        <template x-each="$each.value.bars">
                            <span x-text="fnText($each.parent.value, $each.value)" x-on:click="onClick($each.parent.value, $each.value)" ></span>
                        </template>
                    </h1>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('h1').length).equal(2); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(4); });
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('foo: bob = 0');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('foo: lob = 0');
        chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('baz: bab = 0');
        chai_1.expect(document.querySelectorAll('span')[3].textContent).equal('baz: lab = 0');
        chai_1.expect(document['_alerts'].length).equal(0);
        user_event_1.default.click(document.querySelectorAll('span')[0]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('foo: bob = 1');
            chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('foo: lob = 0');
            chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('baz: bab = 0');
            chai_1.expect(document.querySelectorAll('span')[3].textContent).equal('baz: lab = 0');
            chai_1.expect(document['_alerts'].length).equal(1);
            chai_1.expect(document['_alerts'][0]).equal('foo: bob = 1');
        });
        user_event_1.default.click(document.querySelectorAll('span')[2]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('foo: bob = 1');
            chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('foo: lob = 0');
            chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('baz: bab = 1');
            chai_1.expect(document.querySelectorAll('span')[3].textContent).equal('baz: lab = 0');
            chai_1.expect(document['_alerts'].length).equal(2);
            chai_1.expect(document['_alerts'][0]).equal('foo: bob = 1');
            chai_1.expect(document['_alerts'][1]).equal('baz: bab = 1');
        });
        user_event_1.default.click(document.querySelectorAll('span')[0]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('foo: bob = 2');
            chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('foo: lob = 0');
            chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('baz: bab = 1');
            chai_1.expect(document.querySelectorAll('span')[3].textContent).equal('baz: lab = 0');
            chai_1.expect(document['_alerts'].length).equal(3);
            chai_1.expect(document['_alerts'][0]).equal('foo: bob = 1');
            chai_1.expect(document['_alerts'][1]).equal('baz: bab = 1');
            chai_1.expect(document['_alerts'][2]).equal('foo: bob = 2');
        });
    }));
    mocha_1.it('should support the \'as <name>\' syntax and be able to handle nested event listeners', () => __awaiter(void 0, void 0, void 0, function* () {
        document['_alerts'] = [];
        document.body.innerHTML = `
            <div x-data="{ foos: [
                {name: 'foo', bars: [{name: 'bob', count: 0}, {name: 'lob', count: 0}]},
                {name: 'baz', bars: [{name: 'bab', count: 0}, {name: 'lab', count: 0}]}
            ], fnText: function(foo, bar) { return foo.name+': '+bar.name+' = '+bar.count; }, onClick: function(foo, bar){ bar.count += 1; document._alerts.push(this.fnText(foo, bar)) } }">
                <template x-each="foos as foo">
                    <h1>
                        <template x-each="foo.bars as bar">
                            <span x-text="fnText(foo, bar)" x-on:click="onClick(foo, bar)" ></span>
                        </template>
                    </h1>
                </template>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('h1').length).equal(2); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelectorAll('span').length).equal(4); });
        chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('foo: bob = 0');
        chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('foo: lob = 0');
        chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('baz: bab = 0');
        chai_1.expect(document.querySelectorAll('span')[3].textContent).equal('baz: lab = 0');
        chai_1.expect(document['_alerts'].length).equal(0);
        user_event_1.default.click(document.querySelectorAll('span')[0]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('foo: bob = 1');
            chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('foo: lob = 0');
            chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('baz: bab = 0');
            chai_1.expect(document.querySelectorAll('span')[3].textContent).equal('baz: lab = 0');
            chai_1.expect(document['_alerts'].length).equal(1);
            chai_1.expect(document['_alerts'][0]).equal('foo: bob = 1');
        });
        user_event_1.default.click(document.querySelectorAll('span')[2]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('foo: bob = 1');
            chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('foo: lob = 0');
            chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('baz: bab = 1');
            chai_1.expect(document.querySelectorAll('span')[3].textContent).equal('baz: lab = 0');
            chai_1.expect(document['_alerts'].length).equal(2);
            chai_1.expect(document['_alerts'][0]).equal('foo: bob = 1');
            chai_1.expect(document['_alerts'][1]).equal('baz: bab = 1');
        });
        user_event_1.default.click(document.querySelectorAll('span')[0]);
        yield dom_1.waitFor(() => {
            chai_1.expect(document.querySelectorAll('span')[0].textContent).equal('foo: bob = 2');
            chai_1.expect(document.querySelectorAll('span')[1].textContent).equal('foo: lob = 0');
            chai_1.expect(document.querySelectorAll('span')[2].textContent).equal('baz: bab = 1');
            chai_1.expect(document.querySelectorAll('span')[3].textContent).equal('baz: lab = 0');
            chai_1.expect(document['_alerts'].length).equal(3);
            chai_1.expect(document['_alerts'][0]).equal('foo: bob = 1');
            chai_1.expect(document['_alerts'][1]).equal('baz: bab = 1');
            chai_1.expect(document['_alerts'][2]).equal('foo: bob = 2');
        });
    }));
});
