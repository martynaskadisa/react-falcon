import * as React from 'react';
import './App.css';
import ColorSlide from './ColorSlide';
import Carousel from './components/Carousel';
import logo from './logo.svg';

function* colorGenerator() {
  const getValue = () => Math.round(255 * Math.random());
  while (true) {
    yield `rgb(${getValue()}, ${getValue()}, ${getValue()})`;
  }
}

function* imageGenerator() {
  while (true) {
    yield `https://source.unsplash.com/random/40${Math.round(
      Math.random() * 10
    )}x30${Math.round(Math.random() * 10)}?v=${Math.random()}`;
  }
}

const getImage = imageGenerator();
const getColor = colorGenerator();
const colors = (Array.apply(null, { length: 5 }) as undefined[]).map(
  () => getColor.next().value
);

const images = (Array.apply(null, { length: 1000 }) as undefined[]).map(
  () => getImage.next().value
);

const ConnectedColorCarousel: React.SFC = () => (
  <Carousel style={{ width: 300, height: 300 }} loop={true}>
    {colors.map((color, i) => (
      <ColorSlide key={`color-${color}`} color={color}>
        {i}
      </ColorSlide>
    ))}
  </Carousel>
);

const ConnectedImageCarousel: React.SFC = () => (
  <Carousel style={{ width: 300, height: 300 }} loop={true}>
    {images.map((image, i) => (
      <img
        src={image}
        key={i}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      />
    ))}
  </Carousel>
);

const createArray = (length: number): undefined[] =>
  Array.apply(null, { length }) as undefined[];

interface IState {
  count: number;
}

class App extends React.Component<{}, IState> {
  public state: IState = {
    count: 3
  };

  constructor(props: {}) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <div className="App-body">
          <button onClick={this.handleClick}>Add 10</button>
          {createArray(this.state.count).map((_, i) => (
            <ConnectedColorCarousel key={i} />
          ))}
          <ConnectedImageCarousel />
        </div>
      </div>
    );
  }

  private handleClick() {
    this.setState({ count: this.state.count + 10 });
  }
}

export default App;
