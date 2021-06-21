import { Config } from '../config'
import { Region } from '../region'

import { expect } from 'chai'
import { describe, it } from 'mocha'

describe('config', () => {
    it('should use \'x\' as the default directive prefix', () => {
        expect((new Config()).GetDirectivePrefix()).equal('x');
    });

    it('should match well-formed directives', () => {
        let config = new Config();
        expect(config.GetDirectiveRegex().test('x-text')).equal(true);
        expect(config.GetDirectiveRegex().test('data-x-text')).equal(true);
    });

    it('should not match malformed directives', () => {
        let config = new Config();
        expect(config.GetDirectiveRegex().test('data-z-text')).equal(false);
        expect(config.GetDirectiveRegex().test('z-text')).equal(false);
        expect(config.GetDirectiveRegex().test('text')).equal(false);
    });

    it('should return well-formed directives from specified names', () => {
        let config = new Config();
        expect(config.GetDirectiveName('text')).equal('x-text');
        expect(config.GetDirectiveName('text', true)).equal('data-x-text');
    });

    it('should be able to change the directive prefix', () => {
        let config = new Config();
        expect(config.GetDirectivePrefix()).equal('x');
        config.SetDirectivePrefix('z');
        expect(config.GetDirectivePrefix()).equal('z');
    });

    it('should match well-formed directives with a changed directive prefix', () => {
        let config = new Config();
        config.SetDirectivePrefix('z');
        expect(config.GetDirectiveRegex().test('z-text')).equal(true);
        expect(config.GetDirectiveRegex().test('data-z-text')).equal(true);
    });

    it('should not match malformed directives with a changed directive prefix', () => {
        let config = new Config();
        config.SetDirectivePrefix('z');
        expect(config.GetDirectiveRegex().test('data-x-text')).equal(false);
        expect(config.GetDirectiveRegex().test('x-text')).equal(false);
        expect(config.GetDirectiveRegex().test('text')).equal(false);
    });

    it('should return well-formed directives from specified names with a changed directive prefix', () => {
        let config = new Config();
        config.SetDirectivePrefix('z');
        expect(config.GetDirectiveName('text')).equal('z-text');
        expect(config.GetDirectiveName('text', true)).equal('data-z-text');
    });

    it('should be accessible from the static Region', () => {
        expect(Region.GetConfig().GetDirectivePrefix()).equal('x');
    });
});
