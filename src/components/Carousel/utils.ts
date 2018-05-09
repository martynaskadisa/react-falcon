import * as React from 'react';

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

  return React.Children.toArray(children).slice(
    activeIndex - 1,
    activeIndex - 1 + overscanCount
  );
};

export const getTransitionOffset = (currentOffset: number, width: number) => {
  return width - currentOffset;
};
