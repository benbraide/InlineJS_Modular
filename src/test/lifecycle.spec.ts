import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler } from '../directives/data'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'
import { InitDirectiveHandler, UninitDirectiveHandler, PostDirectiveHandler, BindDirectiveHandler } from '../directives/lifecycle'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new InitDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new UninitDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new PostDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new BindDirectiveHandler());

describe('data lifecycle', () => {
    it('should execute \'x-init\' on element initialization', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo" x-init="foo = 'bar'"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal('bar');
    });

    it('should prevent \'x-init\' from being reactive', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: '', other: 'bar' }">
                <span x-text="foo" x-init="foo = other"></span>
                <button x-on:click="other = 'baz'"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });

        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });
    });

    it('should execute \'x-uninit\' on element removal', async () => {
        const runObservers = [];

        (global.MutationObserver as unknown) = class {
            constructor(callback: (changes: Array<any>) => void) {
                runObservers.push(callback);
            }

            observe() {}
        };
        
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
                <span x-uninit="foo = 'baz'"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');

        let span = document.querySelectorAll('span')[1];
        span.parentElement.removeChild(span);
        
        runObservers.forEach(cb => cb([
            {
                target: document.body.firstElementChild,
                type: 'childList',
                addedNodes: [],
                removedNodes: [ span ],
            }
        ]));
        
        await waitFor(() => { expect(document.querySelectorAll('span')[0].textContent).equal('baz') });
    });

    it('should execute \'x-post\' after all other directives and offspring directives are evaluated', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }" x-post="foo = 'post'">
                <span x-text="foo" x-init="foo = 'bar'"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('post') });
    });

    it('should execute \'x-post\' after offspring x-post directives are evaluated', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }" x-post="foo = 'post'">
                <span x-text="foo" x-post="foo = 'bar'"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('post') });
    });

    it('should execute \'x-bind\' on element initialization', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo" x-bind="foo = 'bar'"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal('bar');
    });

    it('should ensure \'x-bind\' is reactive', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: '', other: 'bar' }">
                <span x-text="foo" x-bind="foo = other"></span>
                <button x-on:click="other = 'baz'"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });

        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('baz') });
    });

    it('should bind elements added to the DOM after initial attachment', async () => {
        const runObservers = [];

        (global.MutationObserver as unknown) = class {
            constructor(callback: (changes: Array<any>) => void) {
                runObservers.push(callback);
            }

            observe() {}
        };
        
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');

        let tmpl = document.createElement('template');
        tmpl.innerHTML = `
            <span x-init="foo = 'baz'"></span>
            <button @click="foo = 'clicked'"></button>
        `;

        let newEls = Array.from(tmpl.content.children).map(child => child.cloneNode(true));
        newEls.forEach(el => document.body.firstElementChild.appendChild(el));
        
        runObservers.forEach(cb => cb([
            {
                target: document.body.firstElementChild,
                type: 'childList',
                addedNodes: newEls,
                removedNodes: [],
            }
        ]));
        
        await waitFor(() => { expect(document.querySelectorAll('span')[0].textContent).equal('baz') });

        userEvent.click(document.querySelector('button'));
        
        await waitFor(() => { expect(document.querySelectorAll('span')[0].textContent).equal('clicked') });
    });
});