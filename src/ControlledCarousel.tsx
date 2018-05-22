import * as React from 'react';
import ColorSlide from './ColorSlide';
import Carousel from './components/Carousel';
import { colorGenerator } from './utils';

const getColor = colorGenerator();

interface IState {
  index: number;
  colors: string[];
  loop: boolean;
}

class ControlledCarousel extends React.PureComponent<{}, IState> {
  public state: IState = {
    colors: (Array.apply(null, { length: 5 }) as undefined[]).map(
      () => getColor.next().value
    ),
    index: 0,
    loop: false
  };
  private carouselRef = React.createRef<Carousel>();

  constructor(props: {}) {
    super(props);

    this.handlePrevClick = this.handlePrevClick.bind(this);
    this.handleNextClick = this.handleNextClick.bind(this);
    this.toggleLoop = this.toggleLoop.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  public render() {
    const { index, colors, loop } = this.state;

    return (
      <div>
        <div
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}
        >
          <label>
            <input type="checkbox" checked={loop} onChange={this.toggleLoop} />
            loop
          </label>
          <label>
            active index:
            <input
              type="number"
              value={index}
              onChange={this.handleInputChange}
            />
          </label>
        </div>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <button onClick={this.handlePrevClick}>Prev</button>
          <Carousel
            ref={this.carouselRef}
            style={{ width: 300, height: 300 }}
            index={index}
            loop={loop}
          >
            {colors.map((color, i) => (
              <ColorSlide key={`color-${color}`} color={color}>
                {i}
              </ColorSlide>
            ))}
          </Carousel>
          <button onClick={this.handleNextClick}>Next</button>
        </div>
      </div>
    );
  }

  private handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ index: parseInt(e.target.value, 10) });
  }

  private toggleLoop() {
    this.setState({ loop: !this.state.loop });
  }

  private handlePrevClick() {
    this.setState({ index: this.getPrevIndex() });
  }

  private handleNextClick() {
    this.setState({ index: this.getNextIndex() });
  }

  private getPrevIndex() {
    if (this.state.index === 0) {
      return this.state.colors.length - 1;
    }

    return this.state.index - 1;
  }

  private getNextIndex() {
    if (this.state.index === this.state.colors.length - 1) {
      return 0;
    }

    return this.state.index + 1;
  }
}

export default ControlledCarousel;
