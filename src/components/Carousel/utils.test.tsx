import * as React from 'react';
import {
  calculateTransitionOffset,
  Direction,
  getDirection,
  getVisibleChildren
} from './utils';

const oneChild: React.ReactNode = <div />;
const fiveChildren: React.ReactNode = [
  <div key={0} />,
  <div key={1} />,
  <div key={2} />,
  <div key={3} />,
  <div key={4} />
];

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
});
