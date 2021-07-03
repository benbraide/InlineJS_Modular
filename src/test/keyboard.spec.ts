import { Region } from '../region'
import { Bootstrap } from '../bootstrap'

import { DataDirectiveHandler } from '../directives/data'
import { RefDirectiveHandler } from '../directives/data'
import { InitDirectiveHandler } from '../directives/lifecycle'
import { BindDirectiveHandler } from '../directives/lifecycle'
import { TextDirectiveHandler } from '../directives/text'
import { OnDirectiveHandler } from '../directives/on'

import { RefsGlobalHandler } from '../globals/proxy'
import { KeyboardGlobalHandler } from '../globals/keyboard'

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { waitFor, fireEvent } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new RefDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new InitDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new BindDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());

Region.GetGlobalManager().AddHandler(new RefsGlobalHandler());
Region.GetGlobalManager().AddHandler(new KeyboardGlobalHandler());

describe('$keyboard global magic property', () => {
    it('should report correct states for the \'down\' property', async () => {
        document.body.innerHTML = `
            <div x-data="{ value: '' }">
                <input x-bind="value = $keyboard.down">
                <span x-text="value"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();

        expect(document.querySelector('span').textContent).equal('');

        userEvent.type(document.querySelector('input'), 'k');

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('k') });

        userEvent.type(document.querySelector('input'), 'b');

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('b') });
    });

    it('should expose bindable methods', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <input x-init="$keyboard.keydown((e) => { foo = e.key })">
                <span x-text="foo"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();

        expect(document.querySelector('span').textContent).equal('bar');

        userEvent.type(document.querySelector('input'), 'kb');

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('b') });
    });

    it('should handle assignments to bindable properties', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <input x-init="$keyboard.keydown = (e) => { foo = e.key }">
                <span x-text="foo"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();

        expect(document.querySelector('span').textContent).equal('bar');

        userEvent.type(document.querySelector('input'), 'kb');

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('b') });
    });

    it('should expose a \'$$keyboard\' global property', async () => {
        document.body.innerHTML = `
            <div x-data="{ foo: 'bar' }">
                <input x-ref="ipt">
                <span x-text="foo" x-init="$$keyboard($refs.ipt).keydown((e) => { foo = e.key })"></span>
            </div>
        `;

        let bootstrap = new Bootstrap();
        bootstrap.Attach();

        expect(document.querySelector('span').textContent).equal('bar');

        userEvent.type(document.querySelector('span'), 'kb');

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('bar') });

        userEvent.type(document.querySelector('input'), 'kb');

        await waitFor(() => { expect(document.querySelector('span').textContent).equal('b') });
    });
});
