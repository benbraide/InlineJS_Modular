"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const region_1 = require("../region");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
mocha_1.describe('config', () => {
    mocha_1.it('should use \'x\' as the default directive prefix', () => {
        chai_1.expect((new config_1.Config()).GetDirectivePrefix()).equal('x');
    });
    mocha_1.it('should match well-formed directives', () => {
        let config = new config_1.Config();
        chai_1.expect(config.GetDirectiveRegex().test('x-text')).equal(true);
        chai_1.expect(config.GetDirectiveRegex().test('data-x-text')).equal(true);
    });
    mocha_1.it('should not match malformed directives', () => {
        let config = new config_1.Config();
        chai_1.expect(config.GetDirectiveRegex().test('data-z-text')).equal(false);
        chai_1.expect(config.GetDirectiveRegex().test('z-text')).equal(false);
        chai_1.expect(config.GetDirectiveRegex().test('text')).equal(false);
    });
    mocha_1.it('should return well-formed directives from specified names', () => {
        let config = new config_1.Config();
        chai_1.expect(config.GetDirectiveName('text')).equal('x-text');
        chai_1.expect(config.GetDirectiveName('text', true)).equal('data-x-text');
    });
    mocha_1.it('should be able to change the directive prefix', () => {
        let config = new config_1.Config();
        chai_1.expect(config.GetDirectivePrefix()).equal('x');
        config.SetDirectivePrefix('z');
        chai_1.expect(config.GetDirectivePrefix()).equal('z');
    });
    mocha_1.it('should match well-formed directives with a changed directive prefix', () => {
        let config = new config_1.Config();
        config.SetDirectivePrefix('z');
        chai_1.expect(config.GetDirectiveRegex().test('z-text')).equal(true);
        chai_1.expect(config.GetDirectiveRegex().test('data-z-text')).equal(true);
    });
    mocha_1.it('should not match malformed directives with a changed directive prefix', () => {
        let config = new config_1.Config();
        config.SetDirectivePrefix('z');
        chai_1.expect(config.GetDirectiveRegex().test('data-x-text')).equal(false);
        chai_1.expect(config.GetDirectiveRegex().test('x-text')).equal(false);
        chai_1.expect(config.GetDirectiveRegex().test('text')).equal(false);
    });
    mocha_1.it('should return well-formed directives from specified names with a changed directive prefix', () => {
        let config = new config_1.Config();
        config.SetDirectivePrefix('z');
        chai_1.expect(config.GetDirectiveName('text')).equal('z-text');
        chai_1.expect(config.GetDirectiveName('text', true)).equal('data-z-text');
    });
    mocha_1.it('should be accessible from the static Region', () => {
        chai_1.expect(region_1.Region.GetConfig().GetDirectivePrefix()).equal('x');
    });
});
