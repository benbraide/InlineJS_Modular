import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler } from '../directives/data'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());

describe('x-text directive', () => {
    it('should set text content on init', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });
    });

    it('should be reactive', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <button x-on:click="foo = 'baz'"></button>
                <span x-text="foo"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('baz') });
    });

    it('should work on SVG elements', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <svg>
                    <text x-text="foo"></text>
                </svg>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('text').textContent).equal('bar') });
    });

    it('should work on INPUT elements', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <input x-text="foo">
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('input').value).equal('bar') });
    });

    it('should treat checkbox INPUT elements as boolean entities', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: true }">
                <input type="checkbox" x-text="foo">
                <button x-on:click="foo = false"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('input').checked).equal(true) });

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('input').checked).equal(false) });
    });
});
