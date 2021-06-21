import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler } from '../directives/data'
import { HtmlDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new HtmlDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());

describe('x-html directive', () => {
    it('should set html content on init', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-html="foo"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('span').innerHTML).equal('bar') });
    });

    it('should be reactive', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <button x-on:click="foo = 'baz'"></button>
                <span x-html="foo"></span>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        await waitFor(() => { expect(document.querySelector('span').innerHTML).equal('bar') });
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(document.querySelector('span').innerHTML).equal('baz') });
    });
});
