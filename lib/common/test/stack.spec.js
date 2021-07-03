"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stack_1 = require("../stack");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
mocha_1.describe('stack', () => {
    mocha_1.it('should be initially empty', () => {
        chai_1.expect((new stack_1.Stack()).IsEmpty()).equal(true);
    });
    mocha_1.it('should not be empty after push', () => {
        let stack = new stack_1.Stack();
        chai_1.expect(stack.IsEmpty()).equal(true);
        stack.Push(9);
        chai_1.expect(stack.IsEmpty()).equal(false);
    });
    mocha_1.it('should pop and return pushed values', () => {
        let stack = new stack_1.Stack();
        stack.Push(9);
        stack.Push(18);
        chai_1.expect(stack.Pop()).equal(18);
        chai_1.expect(stack.Pop()).equal(9);
        chai_1.expect(stack.IsEmpty()).equal(true);
    });
    mocha_1.it('should peek and return pushed values without removing them', () => {
        let stack = new stack_1.Stack();
        stack.Push(9);
        chai_1.expect(stack.Peek()).equal(9);
        chai_1.expect(stack.IsEmpty()).equal(false);
    });
    mocha_1.it('should return null for pop and peek when empty', () => {
        let stack = new stack_1.Stack();
        chai_1.expect(stack.IsEmpty()).equal(true);
        chai_1.expect(stack.Pop()).equal(null);
        chai_1.expect(stack.Peek()).equal(null);
    });
});
