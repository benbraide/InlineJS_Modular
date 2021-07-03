import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler } from '../directives/data'
import { RefDirectiveHandler } from '../directives/data'
import { InitDirectiveHandler } from '../directives/lifecycle'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'

import { RefsGlobalHandler } from '../globals/proxy'
import { MouseGlobalHandler } from '../globals/mouse'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor, fireEvent } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new RefDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new InitDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());

Region.GetGlobalManager().AddHandler(new RefsGlobalHandler());
Region.GetGlobalManager().AddHandler(new MouseGlobalHandler());

describe('$mouse global magic property', () => {
    it('should report correct states for the \'inside\' property', async () => {
        document.body.innerHTML = `
            <div x-data="{ inside: 'bar', outside: 'baz' }">
                <span x-text="$mouse.inside ? inside : outside"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();

        expect(document.querySelector('span').textContent).equal('baz');

        fireEvent.mouseEnter(document.querySelector('span'), { target: {} });

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });

        fireEvent.mouseLeave(document.querySelector('span'), { target: {} });

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('baz') });
    });

    it('should expose bindable methods', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo" x-init="$mouse.click(() => { foo = 'baz' })"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();

        expect(document.querySelector('span').textContent).equal('bar');

        userEvent.click(document.querySelector('span'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('baz') });
    });

    it('should handle assignments to bindable properties', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <span x-text="foo" x-init="$mouse.click = () => { foo = 'baz' }"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();

        expect(document.querySelector('span').textContent).equal('bar');

        userEvent.click(document.querySelector('span'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('baz') });
    });

    it('should expose a \'$$mouse\' global property', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <button x-ref="btn"></button>
                <span x-text="foo" x-init="$$mouse($refs.btn).click(() => { foo = 'baz' })"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();

        expect(document.querySelector('span').textContent).equal('bar');

        userEvent.click(document.querySelector('span'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });

        userEvent.click(document.querySelector('button'));

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('baz') });
    });
});
