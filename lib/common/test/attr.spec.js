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
region_1.Region.GetDirectiveManager().AddHandler(new attr_1.AttrDirectiveHandler());
mocha_1.describe('x-attr directive', () => {
    mocha_1.it('should set corresponding value on initialization', () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-attr:foo="foo"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').getAttribute('foo')).equal('bar');
    });
    mocha_1.it('should be reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-attr:foo="foo"></span>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').getAttribute('foo')).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').getAttribute('foo')).equal('baz'); });
    }));
    mocha_1.it('should accept a key-value map', () => {
        document.body.innerHTML = `
            <div x-data="{ map: { foo: 'bar', zoo: 'tiger' } }">
                <span x-attr="map"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').getAttribute('foo')).equal('bar');
        chai_1.expect(document.querySelector('span').getAttribute('zoo')).equal('tiger');
    });
    mocha_1.it('should have reactive key-value map', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ map: { foo: 'bar', zoo: 'tiger' } }">
                <span x-attr="map"></span>
                <button x-on:click="map.zoo = 'leopard'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').getAttribute('foo')).equal('bar');
        chai_1.expect(document.querySelector('span').getAttribute('zoo')).equal('tiger');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').getAttribute('foo')).equal('bar'); });
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').getAttribute('zoo')).equal('leopard'); });
    }));
    mocha_1.it('should accept the short form and be reactive', () => __awaiter(void 0, void 0, void 0, function* () {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span :foo="foo"></span>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('span').getAttribute('foo')).equal('bar');
        user_event_1.default.click(document.querySelector('button'));
        yield dom_1.waitFor(() => { chai_1.expect(document.querySelector('span').getAttribute('foo')).equal('baz'); });
    }));
    mocha_1.it('should remove non-boolean attributes with null/undefined/false values', () => {
        document.body.innerHTML = `
            <div x-data="{}">
                <a href="#hello" x-attr:href="null"></a>
                <a href="#hello" x-attr:href="false"></a>
                <a href="#hello" x-attr:href="undefined"></a>
                <span visible="true" x-attr:visible="null"></span>
                <span visible="true" x-attr:visible="false"></span>
                <span visible="true" x-attr:visible="undefined"></span>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('a')[0].getAttribute('href')).equal(null);
        chai_1.expect(document.querySelectorAll('a')[1].getAttribute('href')).equal(null);
        chai_1.expect(document.querySelectorAll('a')[2].getAttribute('href')).equal(null);
        chai_1.expect(document.querySelectorAll('span')[0].getAttribute('visible')).equal(null);
        chai_1.expect(document.querySelectorAll('span')[1].getAttribute('visible')).equal(null);
        chai_1.expect(document.querySelectorAll('span')[2].getAttribute('visible')).equal(null);
    });
    mocha_1.it('should not remove non-boolean attributes with null/undefined/false values', () => {
        document.body.innerHTML = `
            <div x-data="{}">
                <a href="#hello" x-attr:href="''"></a>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('a')[0].getAttribute('href')).equal('');
    });
    mocha_1.it('should set boolean attributes with truthy values to their attribute name', () => {
        document.body.innerHTML = `
            <div x-data="{ isSet: true }">
                <input x-attr:disabled="isSet"></input>
                <input x-attr:checked="isSet"></input>
                <input x-attr:required="isSet"></input>
                <input x-attr:readonly="isSet"></input>
                <details x-attr:open="isSet"></details>
                <select x-attr:multiple="isSet"></select>
                <option x-attr:selected="isSet"></option>
                <textarea x-attr:autofocus="isSet"></textarea>
                <dl x-attr:itemscope="isSet"></dl>
                <form x-attr:novalidate="isSet"></form>
                <iframe
                    x-attr:allowfullscreen="isSet"
                    x-attr:allowpaymentrequest="isSet"
                ></iframe>
                <button x-attr:formnovalidate="isSet"></button>
                <audio
                    x-attr:autoplay="isSet"
                    x-attr:controls="isSet"
                    x-attr:loop="isSet"
                    x-attr:muted="isSet"
                ></audio>
                <video x-attr:playsinline="isSet"></video>
                <track x-attr:default="isSet" />
                <img x-attr:ismap="isSet" />
                <ol x-attr:reversed="isSet"></ol>
                <script
                    x-attr:async="isSet"
                    x-attr:defer="isSet"
                    x-attr:nomodule="isSet"
                ></script>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('input')[0].disabled).equal(true);
        chai_1.expect(document.querySelectorAll('input')[1].checked).equal(true);
        chai_1.expect(document.querySelectorAll('input')[2].required).equal(true);
        chai_1.expect(document.querySelectorAll('input')[3].readOnly).equal(true);
        chai_1.expect(document.querySelectorAll('details')[0].open).equal(true);
        chai_1.expect(document.querySelectorAll('option')[0].selected).equal(true);
        chai_1.expect(document.querySelectorAll('select')[0].multiple).equal(true);
        chai_1.expect(document.querySelectorAll('textarea')[0].autofocus).equal(true);
        chai_1.expect(document.querySelectorAll('dl')[0].getAttribute('itemscope')).equal('itemscope');
        chai_1.expect(document.querySelectorAll('form')[0].getAttribute('novalidate')).equal('novalidate');
        chai_1.expect(document.querySelectorAll('iframe')[0].getAttribute('allowfullscreen')).equal('allowfullscreen');
        chai_1.expect(document.querySelectorAll('iframe')[0].getAttribute('allowpaymentrequest')).equal('allowpaymentrequest');
        chai_1.expect(document.querySelectorAll('button')[0].getAttribute('formnovalidate')).equal('formnovalidate');
        chai_1.expect(document.querySelectorAll('audio')[0].getAttribute('autoplay')).equal('autoplay');
        chai_1.expect(document.querySelectorAll('audio')[0].getAttribute('controls')).equal('controls');
        chai_1.expect(document.querySelectorAll('audio')[0].getAttribute('loop')).equal('loop');
        chai_1.expect(document.querySelectorAll('audio')[0].getAttribute('muted')).equal('muted');
        chai_1.expect(document.querySelectorAll('video')[0].getAttribute('playsinline')).equal('playsinline');
        chai_1.expect(document.querySelectorAll('track')[0].getAttribute('default')).equal('default');
        chai_1.expect(document.querySelectorAll('img')[0].getAttribute('ismap')).equal('ismap');
        chai_1.expect(document.querySelectorAll('ol')[0].getAttribute('reversed')).equal('reversed');
        chai_1.expect(document.querySelectorAll('script')[0].getAttribute('async')).equal('async');
        chai_1.expect(document.querySelectorAll('script')[0].getAttribute('defer')).equal('defer');
        chai_1.expect(document.querySelectorAll('script')[0].getAttribute('nomodule')).equal('nomodule');
    });
    mocha_1.it('should remove boolean attributes with falsy values', () => {
        document.body.innerHTML = `
            <div x-data="{ isSet: false }">
                <input x-attr:disabled="isSet"></input>
                <input x-attr:checked="isSet"></input>
                <input x-attr:required="isSet"></input>
                <input x-attr:readonly="isSet"></input>
                <input x-attr:hidden="isSet"></input>
                <details x-attr:open="isSet"></details>
                <select x-attr:multiple="isSet"></select>
                <option x-attr:selected="isSet"></option>
                <textarea x-attr:autofocus="isSet"></textarea>
                <dl x-attr:itemscope="isSet"></dl>
                <form x-attr:novalidate="isSet"></form>
                <iframe
                    x-attr:allowfullscreen="isSet"
                    x-attr:allowpaymentrequest="isSet"
                ></iframe>
                <button x-attr:formnovalidate="isSet"></button>
                <audio
                    x-attr:autoplay="isSet"
                    x-attr:controls="isSet"
                    x-attr:loop="isSet"
                    x-attr:muted="isSet"
                ></audio>
                <video x-attr:playsinline="isSet"></video>
                <track x-attr:default="isSet" />
                <img x-attr:ismap="isSet" />
                <ol x-attr:reversed="isSet"></ol>
                <script
                    x-attr:async="isSet"
                    x-attr:defer="isSet"
                    x-attr:nomodule="isSet"
                ></script>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelectorAll('input')[0].getAttribute('disabled')).equal(null);
        chai_1.expect(document.querySelectorAll('input')[1].getAttribute('checked')).equal(null);
        chai_1.expect(document.querySelectorAll('input')[2].getAttribute('required')).equal(null);
        chai_1.expect(document.querySelectorAll('input')[3].getAttribute('readOnly')).equal(null);
        chai_1.expect(document.querySelectorAll('input')[4].getAttribute('hidden')).equal(null);
        chai_1.expect(document.querySelectorAll('details')[0].getAttribute('open')).equal(null);
        chai_1.expect(document.querySelectorAll('option')[0].getAttribute('selected')).equal(null);
        chai_1.expect(document.querySelectorAll('select')[0].getAttribute('multiple')).equal(null);
        chai_1.expect(document.querySelectorAll('textarea')[0].getAttribute('autofocus')).equal(null);
        chai_1.expect(document.querySelectorAll('dl')[0].getAttribute('itemscope')).equal(null);
        chai_1.expect(document.querySelectorAll('form')[0].getAttribute('novalidate')).equal(null);
        chai_1.expect(document.querySelectorAll('iframe')[0].getAttribute('allowfullscreen')).equal(null);
        chai_1.expect(document.querySelectorAll('iframe')[0].getAttribute('allowpaymentrequest')).equal(null);
        chai_1.expect(document.querySelectorAll('button')[0].getAttribute('formnovalidate')).equal(null);
        chai_1.expect(document.querySelectorAll('audio')[0].getAttribute('autoplay')).equal(null);
        chai_1.expect(document.querySelectorAll('audio')[0].getAttribute('controls')).equal(null);
        chai_1.expect(document.querySelectorAll('audio')[0].getAttribute('loop')).equal(null);
        chai_1.expect(document.querySelectorAll('audio')[0].getAttribute('muted')).equal(null);
        chai_1.expect(document.querySelectorAll('video')[0].getAttribute('playsinline')).equal(null);
        chai_1.expect(document.querySelectorAll('track')[0].getAttribute('default')).equal(null);
        chai_1.expect(document.querySelectorAll('img')[0].getAttribute('ismap')).equal(null);
        chai_1.expect(document.querySelectorAll('ol')[0].getAttribute('reversed')).equal(null);
        chai_1.expect(document.querySelectorAll('script')[0].getAttribute('async')).equal(null);
        chai_1.expect(document.querySelectorAll('script')[0].getAttribute('defer')).equal(null);
        chai_1.expect(document.querySelectorAll('script')[0].getAttribute('nomodule')).equal(null);
    });
    mocha_1.it('\'.camel\' modifier correctly sets name of attribute', () => {
        document.body.innerHTML = `
            <div x-data>
                <svg x-attr:view-box.camel="'0 0 42 42'"></svg>
            </div>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('svg').getAttribute('viewBox')).equal('0 0 42 42');
    });
    mocha_1.it('names can contain numbers', () => {
        document.body.innerHTML = `
            <svg x-data>
                <line x1="1" y1="2" :x2="3" x-attr:y2="4" />
            </svg>
        `;
        let bootstrap = new bootstrap_1.Bootstrap();
        bootstrap.Attach();
        chai_1.expect(document.querySelector('line').getAttribute('x2')).equal('3');
        chai_1.expect(document.querySelector('line').getAttribute('y2')).equal('4');
    });
});
