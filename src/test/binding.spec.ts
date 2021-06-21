import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler } from '../directives/data'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'

import { UseGlobalHandler, StaticGlobalHandler } from '../globals/meta'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());

Region.GetGlobalManager().AddHandler(new UseGlobalHandler());
Region.GetGlobalManager().AddHandler(new StaticGlobalHandler());

describe('data binding', () => {
    it('should be reactive', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal('bar');

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('baz') });
    });

    it('should be optimized by default', async () => {
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'} }">
                <span x-text="nested.foo"></span>
                <span x-text="nested"></span>
                <button x-on:click="nested.foo = 'baz'"></button>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"bar"}');

        userEvent.click(document.querySelectorAll('button')[0]);

        await waitFor(() => { expect(document.querySelectorAll('span')[0].textContent).equal('baz') });
        await waitFor(() => { expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"baz"}') });

        userEvent.click(document.querySelectorAll('button')[1]);

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('baz') });
        await waitFor(() => { expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"unoptimized"}') });
    });

    it('should obey global optimized setting', async () => {
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'} }">
                <span x-text="nested.foo"></span>
                <span x-text="nested"></span>
                <button x-on:click="nested.foo = 'baz'"></button>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
        `;
    
        Region.GetConfig().SetOptimizedBindsState(false);

        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"bar"}');

        userEvent.click(document.querySelectorAll('button')[0]);

        await waitFor(() => { expect(document.querySelectorAll('span')[0].textContent).equal('baz') });
        await waitFor(() => { expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"baz"}') });

        userEvent.click(document.querySelectorAll('button')[1]);

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('unoptimized') });
        await waitFor(() => { expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"unoptimized"}') });

        Region.GetConfig().SetOptimizedBindsState(true);
    });

    it('should obey per region optimized setting', async () => {
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'}, $enableOptimizedBinds: false }">
                <span x-text="nested.foo"></span>
                <span x-text="nested"></span>
                <button x-on:click="nested.foo = 'baz'"></button>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"bar"}');

        userEvent.click(document.querySelectorAll('button')[0]);

        await waitFor(() => { expect(document.querySelectorAll('span')[0].textContent).equal('baz') });
        await waitFor(() => { expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"baz"}') });

        userEvent.click(document.querySelectorAll('button')[1]);

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('unoptimized') });
        await waitFor(() => { expect(document.querySelectorAll('span')[1].textContent).equal('{"foo":"unoptimized"}') });
    });

    it('should obey \'$use\' global magic property', async () => {
        document.body.innerHTML = `
            <div x-data="{ nested: {foo: 'bar'} }">
                <span x-text="nested.foo"></span>
                <span x-text="$use(nested.foo)"></span>
                <button x-on:click="nested = {foo: 'unoptimized'}"></button>
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

    it('should obey \'$static\' global magic property', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
                <span x-text="$static(foo)"></span>
                <button x-on:click="foo = 'baz'"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        expect(document.querySelectorAll('span')[1].textContent).equal('bar');

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelectorAll('span')[0].textContent).equal('baz') });
        await waitFor(() => { expect(document.querySelectorAll('span')[1].textContent).equal('bar') });
    });
});
