import { Config } from '../config'
import { Processor } from '../processor'

import { expect } from 'chai'
import { describe, it } from 'mocha'

let config = new Config();
let processor = new Processor(config, null);

describe('directives parser', () => {
    it('should parse a well-formed directive', () => {
        let parsed = processor.GetDirectiveWith('x-text', '\'Hello world\'');
        expect(parsed.key).equal('text');
        expect(parsed.value).equal('\'Hello world\'');

        parsed = processor.GetDirectiveWith('data-x-text', '\'Hello world\'');
        expect(parsed.key).equal('text');
        expect(parsed.value).equal('\'Hello world\'');
    });

    it('should not parse a malformed directive', () => {
        let parsed = processor.GetDirectiveWith('z-text', '\'Hello world\'');
        expect(parsed).equal(null);

        parsed = processor.GetDirectiveWith('data-z-text', '\'Hello world\'');
        expect(parsed).equal(null);
    });

    it('should parse a directive with a specified argument key', () => {
        let parsed = processor.GetDirectiveWith('x-text:key', '\'Hello world\'');
        expect(parsed.key).equal('text');
        expect(parsed.arg.key).equal('key');
    });

    it('should parse a directive with specified argument options', () => {
        let parsed = processor.GetDirectiveWith('x-text.first.second', '\'Hello world\'');
        expect(parsed.key).equal('text');
        expect(parsed.arg.options.toString()).equal('first,second');
    });

    it('should parse a directive with specified argument key and options', () => {
        let parsed = processor.GetDirectiveWith('x-text:key.first.second', '\'Hello world\'');
        expect(parsed.key).equal('text');
        expect(parsed.arg.key).equal('key');
        expect(parsed.arg.options.toString()).equal('first,second');
    });

    it('should format argument key with the \'.camel\' modifier', () => {
        let parsed = processor.GetDirectiveWith('x-text:first-second.camel', '\'Hello world\'');
        expect(parsed.key).equal('text');
        expect(parsed.arg.key).equal('firstSecond');
    });

    it('should format argument key with the \'.capitalize\' modifier', () => {
        let parsed = processor.GetDirectiveWith('x-text:first-second.capitalize', '\'Hello world\'');
        expect(parsed.key).equal('text');
        expect(parsed.arg.key).equal('FirstSecond');
    });

    it('should format argument key with the \'.join\' modifier', () => {
        let parsed = processor.GetDirectiveWith('x-text:first-second.join', '\'Hello world\'');
        expect(parsed.key).equal('text');
        expect(parsed.arg.key).equal('first.second');
    });

    it('should expand shorthands', () => {
        let parsed = processor.GetDirectiveWith(':prop', '');
        expect(parsed.key).equal('attr');
        expect(parsed.arg.key).equal('prop');

        parsed = processor.GetDirectiveWith('.name', '');
        expect(parsed.key).equal('class');
        expect(parsed.arg.key).equal('name');

        parsed = processor.GetDirectiveWith('@event', '');
        expect(parsed.key).equal('on');
        expect(parsed.arg.key).equal('event');
    });
});
