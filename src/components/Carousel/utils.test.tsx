import * as React from 'react';
import { getVisibleChildren } from './utils';

const oneChild: React.ReactNode = <div />;
const fiveChildren: React.ReactNode = [
  <div key={0} />,
  <div key={1} />,
  <div key={2} />,
  <div key={3} />,
  <div key={4} />
];

describe('utils', () => {
  describe('getVisibleChildren', () => {
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
