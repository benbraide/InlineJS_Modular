import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler } from '../directives/data'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'
import { ShowDirectiveHandler } from '../directives/show'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new ShowDirectiveHandler());

describe('x-show directive', () => {
    it('should toggle display: none; with no other style attributes', async () => {
        document.body.innerHTML = `
            <div x-data="{ show: true }">
                <span x-show="show"></span>
                <button x-on:click="show = false"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').getAttribute('style')).equal(null);
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(document.querySelector('span').getAttribute('style')).equal('display: none;') });
    });
    
    it('should toggle display: none; with other style attributes', async () => {
        document.body.innerHTML = `
            <div x-data="{ show: true }">
                <span x-show="show" style="color: blue;"></span>
                <button x-on:click="show = false"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').getAttribute('style')).equal('color: blue;');
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(document.querySelector('span').getAttribute('style')).equal('color: blue; display: none;') });
    });
});
