// tslint:disable:no-console
// tslint:disable:no-debugger

import * as React from 'react';
import { noop } from './noop';
import { getVisibleChildren } from './utils';

export interface IProps {
  defaultIndex?: number;
  index?: number;
  overscanCount?: number;
  onChange?: (index: number) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  loop?: boolean;
  animate?: boolean;
}

interface IState {
  index: number;
  isInteracting: boolean;
  isTransitioning: boolean;
  startX?: number;
  offset: number;
  transitionStart: number;
  nextIndex: number;
}

const ANIMATION_DURATION = 250;

class Carousel extends React.PureComponent<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    animate: true,
    defaultIndex: 0,
    loop: false,
    onChange: noop,
    overscanCount: 3
  };

  constructor(props: Required<IProps>) {
    super(props);

    this.state = {
      index: props.defaultIndex,
      isInteracting: false,
      isTransitioning: false,
      nextIndex: -1,
      offset: 0,
      startX: undefined,
      transitionStart: 0
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.transition = this.transition.bind(this);
  }

  public render() {
    const { children, overscanCount, className, style, loop } = this
      .props as Required<IProps>;
    const { index, offset } = this.state;

    const visibleChildren = getVisibleChildren(
      children,
      index,
      overscanCount,
      loop
    );

    return (
      <div
        style={{
          display: 'block',
          // overflow: 'hidden',
          position: 'relative',
          ...style
        }}
        className={className}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseOut={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      >
        {visibleChildren.map((child, i) => (
          <div
            key={i}
            style={{
              height: '100%',
              left: `calc(${100 * (i - 1)}% + ${offset}px)`,
              position: 'absolute',
              width: '100%'
            }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  private handleMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
    this.setState({ isInteracting: true, startX: e.clientX, offset: 0 });
  }

  private getNextIndex() {
    if (this.state.offset >= 50) {
      if (this.state.index === 0) {
        return this.props.loop
          ? React.Children.count(this.props.children) - 1
          : this.state.index;
      }

      return this.state.index - 1;
    }

    if (this.state.offset <= -50) {
      if (this.state.index === React.Children.count(this.props.children) - 1) {
        return this.props.loop ? 0 : this.state.index;
      }

      return this.state.index + 1;
    }

    return this.state.index;
  }

  private slideTo(index: number) {
    if (!this.props.animate) {
      return this.setState({
        index,
        isInteracting: false,
        offset: 0,
        startX: undefined
      });
    }

    this.setState(
      {
        isInteracting: false,
        isTransitioning: true,
        nextIndex: index,
        transitionStart: window.performance.now()
      },
      () => {
        window.requestAnimationFrame(this.transition);
      }
    );
  }

  private transition() {
    if (!this.state.isTransitioning) {
      return;
    }

    const now = window.performance.now();

    if (now - this.state.transitionStart > ANIMATION_DURATION) {
      return this.setState({
        index: this.state.nextIndex,
        isTransitioning: false,
        nextIndex: -1,
        offset: 0
      });
    }

    const direction =
      this.state.index - this.state.nextIndex > 0 ? 'right' : 'left';

    console.log(direction);
    const amount = this.state.offset * (16.7 / ANIMATION_DURATION);

    this.setState(
      {
        offset:
          direction === 'left'
            ? this.state.offset + amount
            : this.state.offset - amount
      },
      () => window.requestAnimationFrame(this.transition)
    );
  }

  private handleMouseUp(e: React.MouseEvent<HTMLDivElement>): void {
    if (!this.state.isInteracting) {
      return;
    }

    this.slideTo(this.getNextIndex());
  }

  private handleMouseMove(e: React.MouseEvent<HTMLDivElement>): void {
    if (!this.state.isInteracting || !this.state.startX) {
      return;
    }

    const offset = e.clientX - this.state.startX;

    this.setState({ offset });
  }
}

export default Carousel;
