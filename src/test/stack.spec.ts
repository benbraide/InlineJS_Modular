import { Stack } from '../stack'

import { expect } from 'chai'
import { describe, it } from 'mocha'

describe('stack', () => {
    it('should be initially empty', () => {
        expect((new Stack<number>()).IsEmpty()).equal(true);
    });

    it('should not be empty after push', () => {
        let stack = new Stack<number>();
        expect(stack.IsEmpty()).equal(true);
        stack.Push(9);
        expect(stack.IsEmpty()).equal(false);
    });

    it('should pop and return pushed values', () => {
        let stack = new Stack<number>();
        stack.Push(9);
        stack.Push(18);
        expect(stack.Pop()).equal(18);
        expect(stack.Pop()).equal(9);
        expect(stack.IsEmpty()).equal(true);
    });

    it('should peek and return pushed values without removing them', () => {
        let stack = new Stack<number>();
        stack.Push(9);
        expect(stack.Peek()).equal(9);
        expect(stack.IsEmpty()).equal(false);
    });

    it('should return null for pop and peek when empty', () => {
        let stack = new Stack<number>();
        expect(stack.IsEmpty()).equal(true);
        expect(stack.Pop()).equal(null);
        expect(stack.Peek()).equal(null);
    });
});
