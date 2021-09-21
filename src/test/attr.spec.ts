import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler } from '../directives/data'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'
import { AttrDirectiveHandler } from '../directives/attr'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new AttrDirectiveHandler());

describe('x-attr directive', () => {
    it('should set corresponding value on initialization', () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-attr:foo="foo"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').getAttribute('foo')).equal('bar');
    });

    it('should be reactive', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-attr:foo="foo"></span>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').getAttribute('foo')).equal('bar');
        
        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').getAttribute('foo')).equal('baz') });
    });

    it('should accept a key-value map', () => {
        document.body.innerHTML = `
            <div x-data="{ map: { foo: 'bar', zoo: 'tiger' } }">
                <span x-attr="map"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').getAttribute('foo')).equal('bar');
        expect(document.querySelector('span').getAttribute('zoo')).equal('tiger');
    });

    it('should have reactive key-value map', async () => {
        document.body.innerHTML = `
            <div x-data="{ map: { foo: 'bar', zoo: 'tiger' } }">
                <span x-attr="map"></span>
                <button x-on:click="map.zoo = 'leopard'"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').getAttribute('foo')).equal('bar');
        expect(document.querySelector('span').getAttribute('zoo')).equal('tiger');

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').getAttribute('foo')).equal('bar') });
        await waitFor(() => { expect(document.querySelector('span').getAttribute('zoo')).equal('leopard') });
    });

    it('should accept the short form and be reactive', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span :foo="foo"></span>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').getAttribute('foo')).equal('bar');
        
        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').getAttribute('foo')).equal('baz') });
    });

    it('should remove non-boolean attributes with null/undefined/false values', () => {
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
        
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('a')[0].getAttribute('href')).equal(null);
        expect(document.querySelectorAll('a')[1].getAttribute('href')).equal(null);
        expect(document.querySelectorAll('a')[2].getAttribute('href')).equal(null);
        expect(document.querySelectorAll('span')[0].getAttribute('visible')).equal(null);
        expect(document.querySelectorAll('span')[1].getAttribute('visible')).equal(null);
        expect(document.querySelectorAll('span')[2].getAttribute('visible')).equal(null);
    });

    it('should not remove non-boolean attributes with null/undefined/false values', () => {
        document.body.innerHTML = `
            <div x-data="{}">
                <a href="#hello" x-attr:href="''"></a>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('a')[0].getAttribute('href')).equal('');
    });

    it('should set boolean attributes with truthy values to their attribute name', () => {
        document.body.innerHTML = `
            <div x-data="{ isSet: true }">
                <input x-attr:disabled="isSet"></input>
                <input x-attr:checked="isSet"></input>
                <input x-attr:required="isSet"></input>
                <input x-attr:readonly="isSet"></input>
                <details x-attr:open="isSet"></details>
                <select x-attr:multiple="isSet">
                    <option x-attr:selected="isSet"></option>
                </select>
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
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('input')[0].disabled).equal(true);
        expect(document.querySelectorAll('input')[1].checked).equal(true);
        expect(document.querySelectorAll('input')[2].required).equal(true);
        expect(document.querySelectorAll('input')[3].readOnly).equal(true);
        expect(document.querySelectorAll('details')[0].open).equal(true);
        expect(document.querySelectorAll('option')[0].selected).equal(true);
        expect(document.querySelectorAll('select')[0].multiple).equal(true);
        expect(document.querySelectorAll('dl')[0].getAttribute('itemscope')).equal('itemscope');
        expect(document.querySelectorAll('form')[0].getAttribute('novalidate')).equal('novalidate');
        expect(document.querySelectorAll('iframe')[0].getAttribute('allowfullscreen')).equal('allowfullscreen');
        expect(document.querySelectorAll('iframe')[0].getAttribute('allowpaymentrequest')).equal('allowpaymentrequest');
        expect(document.querySelectorAll('button')[0].getAttribute('formnovalidate')).equal('formnovalidate');
        expect(document.querySelectorAll('audio')[0].getAttribute('autoplay')).equal('autoplay');
        expect(document.querySelectorAll('audio')[0].getAttribute('controls')).equal('controls');
        expect(document.querySelectorAll('audio')[0].getAttribute('loop')).equal('loop');
        expect(document.querySelectorAll('audio')[0].getAttribute('muted')).equal('muted');
        expect(document.querySelectorAll('video')[0].getAttribute('playsinline')).equal('playsinline');
        expect(document.querySelectorAll('track')[0].getAttribute('default')).equal('default');
        expect(document.querySelectorAll('img')[0].getAttribute('ismap')).equal('ismap');
        expect(document.querySelectorAll('ol')[0].getAttribute('reversed')).equal('reversed');
        expect(document.querySelectorAll('script')[0].getAttribute('async')).equal('async');
        expect(document.querySelectorAll('script')[0].getAttribute('defer')).equal('defer');
        expect(document.querySelectorAll('script')[0].getAttribute('nomodule')).equal('nomodule');
    });

    it('should remove boolean attributes with falsy values', () => {
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

        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('input')[0].getAttribute('disabled')).equal(null);
        expect(document.querySelectorAll('input')[1].getAttribute('checked')).equal(null);
        expect(document.querySelectorAll('input')[2].getAttribute('required')).equal(null);
        expect(document.querySelectorAll('input')[3].getAttribute('readOnly')).equal(null);
        expect(document.querySelectorAll('input')[4].getAttribute('hidden')).equal(null);
        expect(document.querySelectorAll('details')[0].getAttribute('open')).equal(null);
        expect(document.querySelectorAll('option')[0].getAttribute('selected')).equal(null);
        expect(document.querySelectorAll('select')[0].getAttribute('multiple')).equal(null);
        expect(document.querySelectorAll('textarea')[0].getAttribute('autofocus')).equal(null);
        expect(document.querySelectorAll('dl')[0].getAttribute('itemscope')).equal(null);
        expect(document.querySelectorAll('form')[0].getAttribute('novalidate')).equal(null);
        expect(document.querySelectorAll('iframe')[0].getAttribute('allowfullscreen')).equal(null);
        expect(document.querySelectorAll('iframe')[0].getAttribute('allowpaymentrequest')).equal(null);
        expect(document.querySelectorAll('button')[0].getAttribute('formnovalidate')).equal(null);
        expect(document.querySelectorAll('audio')[0].getAttribute('autoplay')).equal(null);
        expect(document.querySelectorAll('audio')[0].getAttribute('controls')).equal(null);
        expect(document.querySelectorAll('audio')[0].getAttribute('loop')).equal(null);
        expect(document.querySelectorAll('audio')[0].getAttribute('muted')).equal(null);
        expect(document.querySelectorAll('video')[0].getAttribute('playsinline')).equal(null);
        expect(document.querySelectorAll('track')[0].getAttribute('default')).equal(null);
        expect(document.querySelectorAll('img')[0].getAttribute('ismap')).equal(null);
        expect(document.querySelectorAll('ol')[0].getAttribute('reversed')).equal(null);
        expect(document.querySelectorAll('script')[0].getAttribute('async')).equal(null);
        expect(document.querySelectorAll('script')[0].getAttribute('defer')).equal(null);
        expect(document.querySelectorAll('script')[0].getAttribute('nomodule')).equal(null);
    });

    it('\'.camel\' modifier correctly sets name of attribute', () => {
        document.body.innerHTML = `
            <div x-data>
                <svg x-attr:view-box.camel="'0 0 42 42'"></svg>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('svg').getAttribute('viewBox')).equal('0 0 42 42');
    });
});
