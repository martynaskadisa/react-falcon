import * as React from 'react';
import {
  calculateTransitionOffset,
  getChildsKey,
  getNextIndex,
  getPrevIndex,
  getTransformStyles,
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
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /**
   * Allows providing custom easing function
   *
   * defaults to linear easing `(f) => f`
   */
  easing?: (progress: number) => number;
  animationDuration?: number;
}

export interface IState {
  index: number;
  isInteracting: boolean;
  isTransitioning: boolean;
  startX?: number;
  prevStartX?: number;
  prevOffset?: number;
  offset: number;
  transitionStart: number;
  transitionStartOffset: number;
  transitionEndOffset: number;
  nextIndex: number;
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
    onClick: noop,
    overscanCount: 3,
    slideThreshold: 75
  };

  public static getDerivedStateFromProps(
    nextProps: IProps
    // prevState: IState
  ): Partial<IState> | null {
    if (typeof nextProps.index === 'number') {
      return {
        index: nextProps.index
      };
    }

    return null;
  }

  private rootElmRef = React.createRef<HTMLDivElement>();
  private rAFHandle: number;

  constructor(props: Required<IProps>) {
    super(props);

    this.state = {
      index: props.index || props.defaultIndex,
      isInteracting: false,
      isTransitioning: false,
      nextIndex: -1,
      offset: 0,
      prevOffset: undefined,
      prevStartX: undefined,
      startX: undefined,
      transitionEndOffset: 0,
      transitionStart: 0,
      transitionStartOffset: 0
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
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
        onClick={this.handleClick}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseOut={this.handleMouseUp}
        onMouseUp={this.handleMouseUp}
        onTouchEnd={this.handleTouchEnd}
        onTouchMove={this.handleTouchMove}
        onTouchStart={this.handleTouchStart}
      >
        {visibleChildren.map((child, i) => (
          <div
            key={getChildsKey(child, i)}
            style={{
              height: '100%',
              pointerEvents: 'none',
              position: 'absolute',
              width: '100%',
              ...getTransformStyles(offset, i)
            }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  public next() {
    this.slideTo(
      getNextIndex(
        this.state.index,
        React.Children.count(this.props.children),
        this.props.loop
      )
    );
  }

  public prev() {
    this.slideTo(
      getPrevIndex(
        this.state.index,
        React.Children.count(this.props.children),
        this.props.loop
      )
    );
  }

  private handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (this.state.isTransitioning) {
      return;
    }

    (this.props as Required<IProps>).onClick(e);
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

    if (offset === 0) {
      return this.setState({
        isInteracting: false
      });
    }

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

    const transitionOffset = calculateTransitionOffset(
      this.state.index,
      index,
      this.state.offset,
      rect.width,
      React.Children.count(this.props.children)
    );

    this.setState(
      {
        isInteracting: false,
        isTransitioning: true,
        nextIndex: index,
        transitionEndOffset: transitionOffset,
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

    const progress = (now - this.state.transitionStart) / animationDuration;
    const amount = this.state.transitionEndOffset * easing(progress);

    const offset = this.state.transitionStartOffset - amount;

    this.setState(
      { offset },
      () => (this.rAFHandle = window.requestAnimationFrame(this.transition))
    );
  }
}

export default Carousel;
