import { configure, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import Carousel, { IState } from './index';

configure({ adapter: new Adapter() });

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>> // tslint:disable-next-line:no-shadowed-variable
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : DeepPartial<T[P]>
};

const createMouseEventPayload = (
  props: DeepPartial<React.MouseEvent<HTMLDivElement>>
) => props;
const createTouchEventPayload = (
  props: DeepPartial<React.TouchEvent<HTMLDivElement>>
) => props;

jest.useFakeTimers();

describe('<Carousel />', () => {
  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      setImmediate(cb);
    });
  });

  afterEach(() => {
    (window.requestAnimationFrame as any).mockRestore();
  });

  it('should render without errors', () => {
    const render = () =>
      TestRenderer.create(
        <Carousel>
          <div />
        </Carousel>
      );

    expect(render).not.toThrowError();
  });

  it('should trigger onClick if user is not interacting', () => {
    const handleClick = jest.fn();
    const carousel = mount(
      <Carousel onClick={handleClick}>
        <div />
      </Carousel>
    );

    carousel.simulate('click');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not trigger onClick if user is swiping (mouse)', () => {
    const handleClick = jest.fn();
    const carousel = mount(
      <Carousel onClick={handleClick}>
        <div />
      </Carousel>
    );

    carousel.simulate('mousedown', createMouseEventPayload({ clientX: 100 }));
    carousel.simulate('mousemove', createMouseEventPayload({ clientX: 50 }));
    carousel.simulate('mouseup', createMouseEventPayload({ clientX: 50 }));
    carousel.simulate('click');

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not trigger onClick if user is swiping (touch)', () => {
    const handleClick = jest.fn();
    const carousel = mount(
      <Carousel onClick={handleClick}>
        <div />
      </Carousel>
    );

    carousel.simulate(
      'touchstart',
      createTouchEventPayload({ touches: [{ clientX: 100 }] })
    );
    carousel.simulate(
      'touchmove',
      createTouchEventPayload({ touches: [{ clientX: 50 }] })
    );
    carousel.simulate(
      'touchend',
      createTouchEventPayload({ touches: [{ clientX: 50 }] })
    );
    carousel.simulate('click');

    jest.runAllTimers();

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should increment index when swiping left (mouse)', () => {
    const threshold = 50;
    const carousel = mount(
      <Carousel slideThreshold={threshold}>
        <div />
        <div />
        <div />
      </Carousel>
    );

    carousel.simulate('mousedown', createMouseEventPayload({ clientX: 100 }));
    carousel.simulate(
      'mousemove',
      createMouseEventPayload({ clientX: 100 - threshold })
    );
    carousel.simulate('mouseup');

    jest.runAllTimers();

    const state = carousel.state() as IState;
    expect(state.index).toBe(1);
  });

  it('should increment index when swiping left (touch)', () => {
    const threshold = 50;
    const carousel = mount(
      <Carousel slideThreshold={threshold}>
        <div />
        <div />
        <div />
      </Carousel>
    );

    carousel.simulate(
      'touchstart',
      createTouchEventPayload({ touches: [{ clientX: 100 }] })
    );
    carousel.simulate(
      'touchmove',
      createTouchEventPayload({ touches: [{ clientX: 100 - threshold }] })
    );
    carousel.simulate('touchend');

    jest.runAllTimers();

    const state = carousel.state() as IState;
    expect(state.index).toBe(1);
  });

  it('should decrement index when swiping right (mouse)', () => {
    const threshold = 50;
    const carousel = mount(
      <Carousel slideThreshold={threshold} defaultIndex={1}>
        <div />
        <div />
        <div />
      </Carousel>
    );

    carousel.simulate('mousedown', createMouseEventPayload({ clientX: 100 }));
    carousel.simulate(
      'mousemove',
      createMouseEventPayload({ clientX: 100 + threshold })
    );
    carousel.simulate('mouseup');

    jest.runAllTimers();

    const state = carousel.state() as IState;
    expect(state.index).toBe(0);
  });

  it('should decrement index when swiping right (touch)', () => {
    const threshold = 50;
    const carousel = mount(
      <Carousel slideThreshold={threshold} defaultIndex={1}>
        <div />
        <div />
        <div />
      </Carousel>
    );

    carousel.simulate(
      'touchstart',
      createTouchEventPayload({ touches: [{ clientX: 100 }] })
    );
    carousel.simulate(
      'touchmove',
      createTouchEventPayload({ touches: [{ clientX: 100 + threshold }] })
    );
    carousel.simulate('touchend');

    jest.runAllTimers();

    const state = carousel.state() as IState;
    expect(state.index).toBe(0);
  });
});
