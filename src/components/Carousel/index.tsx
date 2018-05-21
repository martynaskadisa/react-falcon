import * as React from 'react';
import {
  calculateTransitionOffset,
  getTransitionIndex,
  getVisibleChildren,
  noop
} from './utils';

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
  slideThreshold?: number;
  /**
   * Allows providing custom easing function
   *
   * defaults to linear easing `(f) => f`
   */
  easing?: (progress: number) => number;
  animationDuration?: number;
}

interface IState {
  index: number;
  isInteracting: boolean;
  isTransitioning: boolean;
  startX?: number;
  prevStartX?: number;
  prevOffset?: number;
  offset: number;
  transitionStart: number;
  transitionStartOffset: number;
  nextIndex: number;
  slideWidth: number;
}

const linearEasing = (t: number) => t;

class Carousel extends React.PureComponent<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    animate: true,
    animationDuration: 250,
    defaultIndex: 0,
    easing: linearEasing,
    loop: false,
    onChange: noop,
    overscanCount: 3,
    slideThreshold: 75
  };

  private rootElmRef = React.createRef<HTMLDivElement>();
  private rAFHandle: number;

  constructor(props: Required<IProps>) {
    super(props);

    this.state = {
      index: props.defaultIndex,
      isInteracting: false,
      isTransitioning: false,
      nextIndex: -1,
      offset: 0,
      prevOffset: undefined,
      prevStartX: undefined,
      slideWidth: -1,
      startX: undefined,
      transitionStart: 0,
      transitionStartOffset: 0
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.transition = this.transition.bind(this);
  }

  public render() {
    const { children, overscanCount, className, style, loop } = this
      .props as Required<IProps>;
    const { index, offset, isInteracting, isTransitioning } = this.state;

    const visibleChildren = getVisibleChildren(
      children,
      this.props.index || index,
      overscanCount,
      loop
    );

    return (
      <div
        ref={this.rootElmRef}
        style={{
          cursor: isInteracting ? 'grabbing' : 'grab',
          display: 'block',
          overflow: 'hidden',
          position: 'relative',
          touchAction: 'pan-x',
          userSelect: 'none',
          willChange:
            isInteracting || isTransitioning ? 'transform' : undefined,
          ...style
        }}
        className={className}
        onTouchStart={this.handleTouchStart}
        onTouchEnd={this.handleTouchEnd}
        onTouchMove={this.handleTouchMove}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseOut={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      >
        {visibleChildren.map((child, i) => (
          <div
            key={(child && typeof child === 'object' && child.key) || i}
            style={{
              height: '100%',
              pointerEvents: 'none',
              position: 'absolute',
              transform: `translate3d(calc(${100 *
                (i - 1)}% + ${offset}px), 0, 0)`,
              width: '100%'
            }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  public next() {
    this.slideTo(this.getNextIndex());
  }

  public prev() {
    this.slideTo(this.getPrevIndex());
  }

  private handleInteractionStart(startX: number): void {
    if (this.state.isTransitioning) {
      window.cancelAnimationFrame(this.rAFHandle);
      return this.setState({
        isInteracting: true,
        prevOffset: this.state.offset,
        prevStartX: this.state.startX,
        startX
      });
    }

    this.setState({
      isInteracting: true,
      offset: 0,
      prevStartX: undefined,
      startX
    });
  }

  private handleInteractionEnd() {
    if (!this.state.isInteracting) {
      return;
    }

    const { slideThreshold, loop } = this.props as Required<IProps>;
    const { offset, index } = this.state;

    this.slideTo(
      getTransitionIndex(
        offset,
        slideThreshold,
        React.Children.count(this.props.children),
        index,
        loop
      )
    );
  }

  private handleInteractionMove(x: number): void {
    if (!this.state.isInteracting || !this.state.startX) {
      return;
    }

    const offset = x - this.state.startX;

    if (
      typeof this.state.prevStartX === 'number' &&
      typeof this.state.prevOffset === 'number'
    ) {
      return this.setState({
        offset: this.state.prevOffset + offset
      });
    }

    this.setState({ offset });
  }

  private handleTouchStart(e: React.TouchEvent<HTMLDivElement>): void {
    this.handleInteractionStart(e.touches[0].clientX);
  }

  private handleMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
    this.handleInteractionStart(e.clientX);
  }

  private handleTouchEnd(): void {
    this.handleInteractionEnd();
  }

  private handleMouseUp(): void {
    this.handleInteractionEnd();
  }

  private handleTouchMove(e: React.TouchEvent<HTMLDivElement>): void {
    this.handleInteractionMove(e.touches[0].clientX);
  }

  private handleMouseMove(e: React.MouseEvent<HTMLDivElement>): void {
    this.handleInteractionMove(e.clientX);
  }

  private getNextIndex(): number {
    if (this.state.index === React.Children.count(this.props.children)) {
      return this.props.loop ? 0 : this.state.index;
    }

    return this.state.index + 1;
  }

  private getPrevIndex(): number {
    const count = React.Children.count(this.props.children);

    if (this.state.index === 0) {
      return this.props.loop ? count - 1 : 0;
    }

    return this.state.index - 1;
  }

  private slideTo(index: number) {
    const { animate, onChange } = this.props as Required<IProps>;

    if (!animate || !this.rootElmRef.current) {
      return this.setState(
        {
          index,
          isInteracting: false,
          offset: 0,
          startX: undefined
        },
        () => onChange(index)
      );
    }

    const rect = this.rootElmRef.current.getBoundingClientRect();

    this.setState(
      {
        isInteracting: false,
        isTransitioning: true,
        nextIndex: index,
        slideWidth: rect.width,
        transitionStart: window.performance.now(),
        transitionStartOffset: this.state.offset
      },
      () => (this.rAFHandle = window.requestAnimationFrame(this.transition))
    );
  }

  private transition() {
    if (!this.state.isTransitioning) {
      return;
    }

    const { onChange, animationDuration, easing } = this.props as Required<
      IProps
    >;

    const now = window.performance.now();

    if (now - this.state.transitionStart > animationDuration) {
      return this.setState(
        {
          index: this.state.nextIndex,
          isTransitioning: false,
          nextIndex: -1,
          offset: 0
        },
        () => onChange(this.state.index)
      );
    }

    const transitionOffset = calculateTransitionOffset(
      this.state.index,
      this.state.nextIndex,
      this.state.transitionStartOffset,
      this.state.slideWidth,
      React.Children.count(this.props.children)
    );

    const progress = (now - this.state.transitionStart) / animationDuration;
    const amount = transitionOffset * easing(progress);

    const offset = this.state.transitionStartOffset - amount;

    this.setState(
      { offset },
      () => (this.rAFHandle = window.requestAnimationFrame(this.transition))
    );
  }
}

export default Carousel;
