import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler } from '../directives/data'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'

import { UseGlobalHandler } from '../globals/meta'
import { WindowGlobalHandler } from '../globals/window'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

let randomString = require("randomstring");

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());

Region.GetGlobalManager().AddHandler(new UseGlobalHandler());
Region.GetGlobalManager().AddHandler(new WindowGlobalHandler());

describe('x-data directive', () => {
    it('should be set as the default mount point', () => {
        expect(Region.GetDirectiveManager().GetMountDirectiveName()).equal('data');
    });
    
    it('should be reactive when manipulated on component object', async () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ $component: '${key}', foo: 'bar' }">
                <span x-text="foo"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();

        expect(document.querySelector('span').textContent).equal('bar');

        Region.Find(key, true)['foo'] = 'baz';

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('baz') });
    });

    it('should have an optional attribute value', () => {
        document.body.innerHTML = `
            <div x-data>
                <span x-text="'foo'"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();
        
        expect(document.querySelector('span').textContent).equal('foo');
    });

    it('can use \'this\'', () => {
        document.body.innerHTML = `
            <div x-data="{ text: this.dataset.text }" data-text="test">
              <span x-text="text"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();
        
        expect(document.querySelector('span').textContent).equal('test');
    });

    it('should contain reactive functions', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar', getFoo() {return this.foo}}">
                <span x-text="getFoo()"></span>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();

        expect(document.querySelector('span').textContent).equal('bar');

        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('baz') });
    });

    it('can be nested as scopes', () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
              <span x-text="foo"></span>
              <span x-text="$scope.foo"></span>
              <div x-data="{ foo: 'baz', other: 'value' }">
                <span x-text="foo"></span>
                <span x-text="$scope.foo"></span>
                <span x-text="$scope.other"></span>
                <span x-text="$scope.$parent.foo"></span>
              </div>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        expect(document.querySelectorAll('span')[1].textContent).equal('bar');
        expect(document.querySelectorAll('span')[2].textContent).equal('bar');
        expect(document.querySelectorAll('span')[3].textContent).equal('baz');
        expect(document.querySelectorAll('span')[4].textContent).equal('value');
        expect(document.querySelectorAll('span')[5].textContent).equal('bar');
    });

    it('should contain reactive scopes', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
                <div x-data="{ foo: 'baz' }">
                    <span x-text="foo"></span>
                    <span x-text="$scope.foo"></span>
                    <button x-on:click="$scope.foo = 'changed'"></button>
                </div>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();

        expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        expect(document.querySelectorAll('span')[1].textContent).equal('bar');
        expect(document.querySelectorAll('span')[2].textContent).equal('baz');

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelectorAll('span')[2].textContent).equal('changed') });
    });

    it('should not nest and duplicate proxies when manipulating an array', async () => {
        document.body.innerHTML = `
            <div x-data="{ list: [ {name: 'foo'}, {name: 'bar'} ] }">
                <span x-text="$use(list[0].name)"></span>
                <button x-on:click="list.sort((a, b) => (a.name > b.name) ? 1 : -1)"></button>
                <h1 x-on:click="list.sort((a, b) => (a.name < b.name) ? 1 : -1)"></h1>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('foo') });

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });

        userEvent.click(document.querySelector('h1'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('foo') });

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });

        userEvent.click(document.querySelector('h1'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('foo') });

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });

        userEvent.click(document.querySelector('h1'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('foo') });

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });

        userEvent.click(document.querySelector('h1'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('foo') });

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });

        userEvent.click(document.querySelector('h1'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('foo') });

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });

        userEvent.click(document.querySelector('h1'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('foo') });

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });
    });

    it('should refresh one time per update whatever the number of mutations in the update', async () => {
        window['refreshCount'] = 0;
    
        document.body.innerHTML = `
            <div x-data="{ items: ['foo', 'bar'], qux: 'quux', test() {this.items; this.qux; return ++this.$window.refreshCount} }">
                <span x-text="test()"></span>
                <button x-on:click="(() => { items.push('baz'); qux = 'corge'; })()"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(window['refreshCount']).equal(1);
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(window['refreshCount']).equal(2) });
    });
});
