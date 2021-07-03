import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler, ComponentDirectiveHandler } from '../directives/data'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'
import { StaticDirectiveHandler } from '../directives/lifecycle'

import { ComponentKeyGlobalHandler } from '../globals/component'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new ComponentDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new StaticDirectiveHandler());

Region.GetGlobalManager().AddHandler(new ComponentKeyGlobalHandler());

describe('x-static directive', () => {
    it('should disable reactivity', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <button x-on:click="foo = 'baz'"></button>
                <span x-text="foo"></span>
                <span x-static:text="foo"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelectorAll('span')[0].textContent).equal('bar');
        expect(document.querySelectorAll('span')[1].textContent).equal('bar');
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => {
            expect(document.querySelectorAll('span')[0].textContent).equal('baz');
            expect(document.querySelectorAll('span')[1].textContent).equal('bar');
        });
    });

    it('can be used on the \'x-data\'', async () => {
        document.body.innerHTML = `
            <div x-static:data="{ foo: 'bar' }">
                <span x-text="foo"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap(true);
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal('bar');
    });

    it('can be used on the x-component directive', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }" x-static:component="static">
                <span x-text="\`\${$componentKey}.\${foo}\`"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal('static.bar');
    });
});
