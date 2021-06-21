import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler, RefDirectiveHandler } from '../directives/data'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'
import { EachDirectiveHandler } from '../directives/each'

import { NextTickGlobalHandler } from '../globals/meta'
import { RefsGlobalHandler } from '../globals/proxy'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new RefDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new EachDirectiveHandler());

Region.GetGlobalManager().AddHandler(new NextTickGlobalHandler());
Region.GetGlobalManager().AddHandler(new RefsGlobalHandler());

describe('$nextTick global magic property', () => {
    it('should execute attached callback', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-ref="span" x-text="foo"></span>
                <button x-on:click="foo = 'baz'; $nextTick(() => { $refs.span.textContent = 'bob' })"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('span').textContent).equal('bar');
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => expect(document.querySelector('span').textContent).equal('bob'));
    });

    it('should wait for x-each directive to finish rendering', async () => {
        document.body.innerHTML = `
            <div x-data="{ $enableOptimizedBinds: false, list: ['one', 'two'], check: 2 }">
                <template x-each="list">
                    <span x-text="$each.value"></span>
                </template>
                <p x-text="check"></p>
                <button x-on:click="list = ['one', 'two', 'three']; $nextTick(() => { check = document.querySelectorAll('span').length })"></button>
            </div>
        `;
    
        let bootstrap = new Bootstrap();
        bootstrap.Attach();
    
        expect(document.querySelector('p').textContent).equal('2');
    
        userEvent.click(document.querySelector('button'));
    
        await waitFor(() => { expect(document.querySelector('p').textContent).equal('3') });
    });
});
