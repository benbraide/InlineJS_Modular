import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler } from '../directives/data'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'
import { IfDirectiveHandler } from '../directives/if'
import { EachDirectiveHandler } from '../directives/each'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new IfDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new EachDirectiveHandler());

describe('x-if directive', () => {
    it('should be reactive', async () => {
        document.body.innerHTML = `
            <div x-data="{ show: false }">
                <button x-on:click="show = ! show"></button>
                <template x-if="show">
                    <p></p>
                </template>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(!document.querySelector('p')).equal(true);
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(!document.querySelector('p')).equal(false) });
    });

    it('should contain reactive elements', async () => {
        document.body.innerHTML = `
            <div x-data="{ show: false, foo: 'bar' }">
                <h1 x-on:click="show = ! show"></h1>
                <template x-if="show">
                    <h2 x-on:click="foo = 'baz'"></h2>
                </template>
                <span x-text="foo"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(!document.querySelector('h2')).equal(true);
        expect(document.querySelector('span').textContent).equal('bar');
    
        userEvent.click(document.querySelector('h1'));
    
        await waitFor(() => { expect(!document.querySelector('h2')).equal(false) });
    
        userEvent.click(document.querySelector('h2'));
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('baz') });
    });

    it('should work inside a loop', () => {
        document.body.innerHTML = `
            <div x-data="{ foos: [{bar: 'baz'}, {bar: 'bop'}]}">
                <template x-each="foos">
                    <template x-if="$each.value.bar === 'baz'">
                        <span x-text="$each.value.bar"></span>
                    </template>
                </template>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span').length).equal(1);
        expect(document.querySelector('span').textContent).equal('baz');
    });

    it('should attach event listeners once', async () => {
        document.body.innerHTML = `
            <div x-data="{ count: 0 }">
                <span x-text="count"></span>
                <template x-if="true">
                    <button x-on:click="count += 1">Click me</button>
                </template>
            </div>
        `;
        
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal('0');
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(document.querySelector('span').textContent).equal('1') });
    });
});