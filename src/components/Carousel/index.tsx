import * as React from 'react';
import { calculateTransitionOffset, getVisibleChildren, noop } from './utils';

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
}

interface IState {
  index: number;
  isInteracting: boolean;
  isTransitioning: boolean;
  startX?: number;
  offset: number;
  transitionStart: number;
  transitionStartOffset: number;
  nextIndex: number;
  slideWidth: number;
}

const ANIMATION_DURATION = 250;

const linearEasing = (t: number) => t;

class Carousel extends React.PureComponent<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    animate: true,
    defaultIndex: 0,
    easing: linearEasing,
    loop: false,
    onChange: noop,
    overscanCount: 3,
    slideThreshold: 50
  };

  private currentSlideRef = React.createRef<HTMLDivElement>();
  private rAFHandle: number;

  constructor(props: Required<IProps>) {
    super(props);

    this.state = {
      index: props.defaultIndex,
      isInteracting: false,
      isTransitioning: false,
      nextIndex: -1,
      offset: 0,
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
      index,
      overscanCount,
      loop
    );

    return (
      <div
        ref={this.currentSlideRef}
        style={{
          cursor: isInteracting ? 'grabbing' : 'grab',
          display: 'block',
          overflow: 'hidden',
          position: 'relative',
          touchAction: 'pan-y',
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
            key={i}
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

  private handleInteractionStart(startX: number): void {
    if (this.state.isTransitioning) {
      window.cancelAnimationFrame(this.rAFHandle);
      return this.setState({
        isInteracting: true,
        offset: this.state.offset,
        startX: this.state.offset
      });
    }

    this.setState({ isInteracting: true, startX, offset: 0 });
  }

  private handleInteractionEnd() {
    if (!this.state.isInteracting) {
      return;
    }

    this.slideTo(this.getNextIndex());
  }

  private handleInteractionMove(x: number): void {
    if (!this.state.isInteracting || !this.state.startX) {
      return;
    }

    this.setState({ offset: x - this.state.startX });
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

  private getNextIndex() {
    const { slideThreshold } = this.props as Required<IProps>;
    if (this.state.offset >= slideThreshold) {
      if (this.state.index === 0) {
        return this.props.loop
          ? React.Children.count(this.props.children) - 1
          : this.state.index;
      }

      return this.state.index - 1;
    }

    if (this.state.offset <= -slideThreshold) {
      if (this.state.index === React.Children.count(this.props.children) - 1) {
        return this.props.loop ? 0 : this.state.index;
      }

      return this.state.index + 1;
    }

    return this.state.index;
  }

  private slideTo(index: number) {
    if (!this.props.animate || !this.currentSlideRef.current) {
      return this.setState({
        index,
        isInteracting: false,
        offset: 0,
        startX: undefined
      });
    }

    const rect = this.currentSlideRef.current.getBoundingClientRect();

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

    const now = window.performance.now();

    if (now - this.state.transitionStart > ANIMATION_DURATION) {
      return this.setState({
        index: this.state.nextIndex,
        isTransitioning: false,
        nextIndex: -1,
        offset: 0
      });
    }

    const transitionOffset = calculateTransitionOffset(
      this.state.index,
      this.state.nextIndex,
      this.state.transitionStartOffset,
      this.state.slideWidth
    );

    const { easing } = this.props as Required<IProps>;
    const progress = (now - this.state.transitionStart) / ANIMATION_DURATION;
    const amount = transitionOffset * easing(progress);

    const offset = this.state.transitionStartOffset - amount;

    this.setState(
      { offset },
      () => (this.rAFHandle = window.requestAnimationFrame(this.transition))
    );
  }
}

export default Carousel;
