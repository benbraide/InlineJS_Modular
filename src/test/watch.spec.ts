import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler } from '../directives/data'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'

import { WatchGlobalHandler } from '../globals/watch'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());

Region.GetGlobalManager().AddHandler(new WatchGlobalHandler());

describe('$watch global magic property', () => {
    it('should be reactive', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar', bob: 'lob' }" x-init="$watch('foo', value => { bob = value })">
                <h1 x-text="foo"></h1>
                <h2 x-text="bob"></h2>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('h1').textContent).equal('bar');
        expect(document.querySelector('h2').textContent).equal('lob');

        userEvent.click(document.querySelector('button'));

        await waitFor(() => {
            expect(document.querySelector('h1').textContent).equal('baz');
            expect(document.querySelector('h2').textContent).equal('baz');
        });
    });

    it('should support nested properties', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: { bar: 'baz', bob: 'lob' } }" x-init="$watch('foo.bar', value => { foo.bob = value })">
                <h1 x-text="foo.bar"></h1>
                <h2 x-text="foo.bob"></h2>
                <button x-on:click="foo.bar = 'law'"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('h1').textContent).equal('baz');
        expect(document.querySelector('h2').textContent).equal('lob');
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => {
            expect(document.querySelector('h1').textContent).equal('law');
            expect(document.querySelector('h2').textContent).equal('law');
        });
    });

    it('should be reactive with arrays', async () => {
        document.body.innerHTML = `
            <div x-data="{ $enableOptimizedBinds: false, foo: ['one'], bob: 'lob' }" x-init="$watch('foo', value => { bob = value.map(item => item) })">
                <h1 x-text="foo"></h1>
                <h2 x-text="bob"></h2>
                <button id="push" x-on:click="foo.push('two')"></button>
                <button id="pop" x-on:click="foo.pop()"></button>
                <button id="unshift" x-on:click="foo.unshift('zero')"></button>
                <button id="shift" x-on:click="foo.shift()"></button>
                <button id="assign" x-on:click="foo = [2,1,3]"></button>
                <button id="sort" x-on:click="foo.sort()"></button>
                <button id="reverse" x-on:click="foo.reverse()"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('h1').textContent).equal('["one"]');
        expect(document.querySelector('h2').textContent).equal('lob');
        
        userEvent.click(document.querySelector('#push'));
    
        await waitFor(() => {
            expect(document.querySelector('h1').textContent).equal('["one","two"]')
            expect(document.querySelector('h2').textContent).equal('["one","two"]');
        });

        userEvent.click(document.querySelector('#pop'));
    
        await waitFor(() => {
            expect(document.querySelector('h1').textContent).equal('["one"]')
            expect(document.querySelector('h2').textContent).equal('["one"]');
        });
    
        userEvent.click(document.querySelector('#unshift'));
    
        await waitFor(() => {
            expect(document.querySelector('h1').textContent).equal('["zero","one"]')
            expect(document.querySelector('h2').textContent).equal('["zero","one"]');
        });
    
        userEvent.click(document.querySelector('#shift'));
    
        await waitFor(() => {
            expect(document.querySelector('h1').textContent).equal('["one"]')
            expect(document.querySelector('h2').textContent).equal('["one"]');
        });
    
        userEvent.click(document.querySelector('#assign'));
    
        await waitFor(() => {
            expect(document.querySelector('h1').textContent).equal('[2,1,3]');
            expect(document.querySelector('h2').textContent).equal('[2,1,3]');
        });
    
        userEvent.click(document.querySelector('#sort'));
    
        await waitFor(() => {
            expect(document.querySelector('h1').textContent).equal('[1,2,3]');
            expect(document.querySelector('h2').textContent).equal('[1,2,3]');
        });
    
        userEvent.click(document.querySelector('#reverse'));
    
        await waitFor(() => {
            expect(document.querySelector('h1').textContent).equal('[3,2,1]');
            expect(document.querySelector('h2').textContent).equal('[3,2,1]');
        });
    });

    it('should support nested arrays', async () => {
        document.body.innerHTML = `
            <div x-data="{ $enableOptimizedBinds: false, foo: {baz: ['one']}, bob: 'lob' }" x-init="$watch('foo.baz', value => { bob = value })">
                <h1 x-text="foo.baz"></h1>
                <h2 x-text="bob"></h2>
                <button id="push" x-on:click="foo.baz.push('two')"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('h1').textContent).equal('["one"]');
        expect(document.querySelector('h2').textContent).equal('lob');
    
        userEvent.click(document.querySelector('#push'));
    
        await waitFor(() => {
            expect(document.querySelector('h1').textContent).equal('["one","two"]');
            expect(document.querySelector('h2').textContent).equal('["one","two"]');
        });
    });

    it('should support magic properties', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar', bob: 'car' }" x-component="magic_prop" x-init="$watch('$component(\\'magic_prop\\').foo', value => bob = value)">
                <span x-text="bob"></span>
                <button x-on:click="$component('magic_prop').foo = 'far'"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal('car');
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('far') });
    });
});
