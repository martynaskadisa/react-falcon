import * as React from 'react';
import {
  calculateTransitionOffset,
  Direction,
  getChildsKey,
  getDirection,
  getNextIndex,
  getPrevIndex,
  getVisibleChildren
} from './utils';

describe('utils', () => {
  describe('#getDirection', () => {
    it('should allow going forward', () => {
      const direction = getDirection(0, 1, 3);

      expect(direction).toEqual(Direction.Left);
    });

    it('should allow going back', () => {
      const direction = getDirection(1, 0, 3);

      expect(direction).toEqual(Direction.Right);
    });

    it('should loop forward', () => {
      const direction = getDirection(2, 0, 3);

      expect(direction).toEqual(Direction.Left);
    });

    it('should loop backwards', () => {
      const direction = getDirection(0, 2, 3);

      expect(direction).toEqual(Direction.Right);
    });
  });

  describe('#calculateTransitionOffset', () => {
    it('should decrement offset when navigating forward', () => {
      const startOffset = 0;
      const offset = calculateTransitionOffset(0, 1, startOffset, 300, 3);

      expect(offset).toBeGreaterThan(startOffset);
    });

    it('should increment offset when navigating backwards', () => {
      const startOffset = 0;
      const offset = calculateTransitionOffset(1, 0, startOffset, 300, 3);

      expect(offset).toBeLessThan(0);
    });

    it('should return startOffset if prevIndex is equal to nextIndex', () => {
      const startOffset = 100;
      const offset = calculateTransitionOffset(1, 1, startOffset, 300, 3);

      expect(offset).toEqual(startOffset);
    });
  });

  describe('#getVisibleChildren', () => {
    it('should filter not visible children', () => {
      const fiveChildren: React.ReactNode = [
        <div key={0} />,
        <div key={1} />,
        <div key={2} />,
        <div key={3} />,
        <div key={4} />
      ];
      const activeIndex = 0;
      const overscanCount = 3;
      const visibleChildren = getVisibleChildren(
        fiveChildren,
        activeIndex,
        overscanCount,
        true
      );

      expect(visibleChildren).toHaveLength(overscanCount);
    });

    it('should not filter when children length is less than overscan count', () => {
      const oneChild: React.ReactNode = <div />;
      const activeIndex = 0;
      const overscanCount = 3;
      const visibleChildren = getVisibleChildren(
        oneChild,
        activeIndex,
        overscanCount,
        true
      );

      expect(visibleChildren).toHaveLength(1);
    });
  });

  describe('#getChildsKey', () => {
    it("should return childs key if it's a React element and it has a key", () => {
      const testKey = 'test';
      const child = <div key={testKey} />;
      const key = getChildsKey(child, 0);

      expect(key).toEqual(testKey);
    });

    it("should return `i` if it's a React element but has no key", () => {
      const child = <div />;
      const i = 0;
      const key = getChildsKey(child, i);

      expect(key).toEqual(i);
    });

    it("should return `i` if it's not a React element", () => {
      const child = 'hello world';
      const i = 0;
      const key = getChildsKey(child, i);

      expect(key).toEqual(i);
    });
  });

  describe('#getPrevIndex', () => {
    it('should decrement', () => {
      const index = getPrevIndex(1, 2);

      expect(index).toEqual(0);
    });

    it('should return the same index if not looping and current index is equal to 0', () => {
      const index = getPrevIndex(0, 2);

      expect(index).toEqual(0);
    });

    it('should return last index if looping and current index is equal to 0', () => {
      const index = getPrevIndex(0, 2, true);

      expect(index).toEqual(1);
    });
  });

  describe('#getNextIndex', () => {
    it('should increment', () => {
      const index = getNextIndex(0, 2);

      expect(index).toEqual(1);
    });

    it('should return the same index if not looping and current index is last', () => {
      const index = getNextIndex(1, 2);

      expect(index).toEqual(1);
    });

    it('should return first index if looping and current index is last', () => {
      const index = getNextIndex(1, 2, true);

      expect(index).toEqual(0);
    });
  });
});
