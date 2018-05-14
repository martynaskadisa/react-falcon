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

export const calculateTransitionOffset = (
  index: number,
  nextIndex: number,
  startOffset: number,
  width: number
): number => {
  if (index === nextIndex) {
    return startOffset;
  }

  if (startOffset > 0) {
    return startOffset - width;
  }

  return startOffset + width;
};
