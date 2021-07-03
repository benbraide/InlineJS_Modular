"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const processor_1 = require("../processor");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
let config = new config_1.Config();
let processor = new processor_1.Processor(config, null);
mocha_1.describe('directives parser', () => {
    mocha_1.it('should parse a well-formed directive', () => {
        let parsed = processor.GetDirectiveWith('x-text', '\'Hello world\'');
        chai_1.expect(parsed.key).equal('text');
        chai_1.expect(parsed.value).equal('\'Hello world\'');
        parsed = processor.GetDirectiveWith('data-x-text', '\'Hello world\'');
        chai_1.expect(parsed.key).equal('text');
        chai_1.expect(parsed.value).equal('\'Hello world\'');
    });
    mocha_1.it('should not parse a malformed directive', () => {
        let parsed = processor.GetDirectiveWith('z-text', '\'Hello world\'');
        chai_1.expect(parsed).equal(null);
        parsed = processor.GetDirectiveWith('data-z-text', '\'Hello world\'');
        chai_1.expect(parsed).equal(null);
    });
    mocha_1.it('should parse a directive with a specified argument key', () => {
        let parsed = processor.GetDirectiveWith('x-text:key', '\'Hello world\'');
        chai_1.expect(parsed.key).equal('text');
        chai_1.expect(parsed.arg.key).equal('key');
    });
    mocha_1.it('should parse a directive with specified argument options', () => {
        let parsed = processor.GetDirectiveWith('x-text.first.second', '\'Hello world\'');
        chai_1.expect(parsed.key).equal('text');
        chai_1.expect(parsed.arg.options.toString()).equal('first,second');
    });
    mocha_1.it('should parse a directive with specified argument key and options', () => {
        let parsed = processor.GetDirectiveWith('x-text:key.first.second', '\'Hello world\'');
        chai_1.expect(parsed.key).equal('text');
        chai_1.expect(parsed.arg.key).equal('key');
        chai_1.expect(parsed.arg.options.toString()).equal('first,second');
    });
    mocha_1.it('should format argument key with the \'.camel\' modifier', () => {
        let parsed = processor.GetDirectiveWith('x-text:first-second.camel', '\'Hello world\'');
        chai_1.expect(parsed.key).equal('text');
        chai_1.expect(parsed.arg.key).equal('firstSecond');
    });
    mocha_1.it('should format argument key with the \'.capitalize\' modifier', () => {
        let parsed = processor.GetDirectiveWith('x-text:first-second.capitalize', '\'Hello world\'');
        chai_1.expect(parsed.key).equal('text');
        chai_1.expect(parsed.arg.key).equal('FirstSecond');
    });
    mocha_1.it('should format argument key with the \'.join\' modifier', () => {
        let parsed = processor.GetDirectiveWith('x-text:first-second.join', '\'Hello world\'');
        chai_1.expect(parsed.key).equal('text');
        chai_1.expect(parsed.arg.key).equal('first.second');
    });
    mocha_1.it('should expand shorthands', () => {
        let parsed = processor.GetDirectiveWith(':prop', '');
        chai_1.expect(parsed.key).equal('attr');
        chai_1.expect(parsed.arg.key).equal('prop');
        parsed = processor.GetDirectiveWith('.name', '');
        chai_1.expect(parsed.key).equal('class');
        chai_1.expect(parsed.arg.key).equal('name');
        parsed = processor.GetDirectiveWith('@event', '');
        chai_1.expect(parsed.key).equal('on');
        chai_1.expect(parsed.arg.key).equal('event');
    });
});
