import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler, ComponentDirectiveHandler } from '../directives/data'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'

import { UseGlobalHandler } from '../globals/meta'
import { ComponentKeyGlobalHandler, ComponentGlobalHandler } from '../globals/component'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

let randomString = require("randomstring");

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new ComponentDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());

Region.GetGlobalManager().AddHandler(new UseGlobalHandler());
Region.GetGlobalManager().AddHandler(new ComponentKeyGlobalHandler());
Region.GetGlobalManager().AddHandler(new ComponentGlobalHandler());

describe('component', () => {
    it('can be initialized with the \'x-component\' directive', () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data x-component="${key}">
                <span x-text="$componentKey"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal(key);
    });

    it('can be initialized with the \'$component\' key during data initialization', () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ $component: '${key}' }">
                <span x-text="$componentKey"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal(key);
    });

    it('can retrieve the current component via the $componentKey global magic property', () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ $component: '${key}' }">
                <span x-text="$componentKey"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal(key);
    });

    it('can retrieve another component via the $component global magic property', () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }" x-component="${key}"></div>
            <div x-data>
                <span x-text="$component('${key}').foo"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal('bar');
    });

    it('should ensure data retrieved from other components are reactive', async () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }" x-component="${key}">
                <span x-text="foo"></span>
                <button x-on:click="foo='changed in ${key}'"></button>
            </div>
            <div x-data="{ foo: 'baz' }">
                <span x-text="foo"></span>
                <span x-text="$component('${key}').foo"></span>
                <button x-on:click="foo='unnamed changed'"></button>
                <button x-on:click="$component('${key}').foo='changed in unnamed'"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        expect(document.querySelectorAll('span')[1].textContent).equal('baz');
        expect(document.querySelectorAll('span')[2].textContent).equal('bar');

        userEvent.click(document.querySelectorAll('button')[0]);

        await waitFor(() => {
            expect(document.querySelectorAll('span')[0].textContent).equal(`changed in ${key}`);
            expect(document.querySelectorAll('span')[1].textContent).equal('baz');
            expect(document.querySelectorAll('span')[2].textContent).equal(`changed in ${key}`);
        });

        userEvent.click(document.querySelectorAll('button')[1]);

        await waitFor(() => {
            expect(document.querySelectorAll('span')[0].textContent).equal(`changed in ${key}`);
            expect(document.querySelectorAll('span')[1].textContent).equal('unnamed changed');
            expect(document.querySelectorAll('span')[2].textContent).equal(`changed in ${key}`);
        });

        userEvent.click(document.querySelectorAll('button')[2]);

        await waitFor(() => {
            expect(document.querySelectorAll('span')[0].textContent).equal('changed in unnamed');
            expect(document.querySelectorAll('span')[1].textContent).equal('unnamed changed');
            expect(document.querySelectorAll('span')[2].textContent).equal('changed in unnamed');
        });
    });

    it('should obey per region optimized setting when accessing data from other components', async () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'} }" x-component="${key}">
                <span x-text="nested.foo"></span>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
            <div x-data="{ $enableOptimizedBinds: false }">
                <span x-text="$component('${key}').nested.foo"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        expect(document.querySelectorAll('span')[1].textContent).equal('bar');

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelectorAll('span')[0].textContent).equal('bar') });
        await waitFor(() => { expect(document.querySelectorAll('span')[1].textContent).equal('unoptimized') });
    });

    it('should obey \'$use\' global magic property when accessing data from other components', async () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'} }" x-component="${key}">
                <span x-text="nested.foo"></span>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
            <div x-data>
                <span x-text="$use($component('${key}').nested.foo)"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        expect(document.querySelectorAll('span')[1].textContent).equal('bar');

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelectorAll('span')[0].textContent).equal('bar') });
        await waitFor(() => { expect(document.querySelectorAll('span')[1].textContent).equal('unoptimized') });
    });

    it('should not be affected by optimized settings in other components', async () => {
        let key = randomString.generate(18);
        document.body.innerHTML = `
            <div x-data="{ $enableOptimizedBinds: false, nested: {foo: 'bar'} }" x-component="${key}">
                <span x-text="nested.foo"></span>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
            <div x-data>
                <span x-text="$component('${key}').nested.foo"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        expect(document.querySelectorAll('span')[1].textContent).equal('bar');

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelectorAll('span')[0].textContent).equal('unoptimized') });
        await waitFor(() => { expect(document.querySelectorAll('span')[1].textContent).equal('bar') });
    });
});
