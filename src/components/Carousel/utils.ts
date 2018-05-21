// tslint:disable:no-debugger
import * as React from 'react';

// tslint:disable-next-line:no-empty
export const noop = () => {};

export const getVisibleChildren = (
  children: React.ReactNode,
  activeIndex: number,
  overscanCount: number,
  loop: boolean
) => {
  const childrenCount = React.Children.count(children);
  const childrenArray = React.Children.toArray(children);

  if (childrenCount <= overscanCount) {
    return childrenArray;
  }

  if (activeIndex === 0 && childrenCount > overscanCount) {
    return [
      loop ? childrenArray[childrenCount - 1] : null,
      ...childrenArray.slice(0, overscanCount - 1)
    ];
  }

  if (loop && activeIndex === childrenCount - 1) {
    return [
      ...childrenArray.slice(childrenCount - 2, childrenCount),
      loop ? childrenArray[0] : null
    ];
  }

  return childrenArray.slice(activeIndex - 1, activeIndex - 1 + overscanCount);
};

export enum Direction {
  Left,
  Right
}

export const getDirection = (
  prevIndex: number,
  nextIndex: number,
  count: number
): Direction => {
  /**
   * Detect if looping over last slide <- first slide
   */
  if (prevIndex === 0 && nextIndex === count - 1) {
    return Direction.Right;
  }

  if (nextIndex - prevIndex > 0) {
    return Direction.Left;
  }

  /**
   * Detect if looping over last slide -> first slide
   */
  if (prevIndex === count - 1 && nextIndex === 0) {
    return Direction.Left;
  }

  return Direction.Right;
};

export const calculateTransitionOffset = (
  prevIndex: number,
  nextIndex: number,
  startOffset: number,
  width: number,
  count: number
): number => {
  if (prevIndex === nextIndex) {
    return startOffset;
  }

  return getDirection(prevIndex, nextIndex, count) === Direction.Left
    ? startOffset + width
    : startOffset - width;
};
