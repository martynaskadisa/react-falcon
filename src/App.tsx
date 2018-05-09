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
    yield `https://source.unsplash.com/random/400x300?v=${Math.random()}`;
  }
}

const getImage = imageGenerator();
const getColor = colorGenerator();
const colors = (Array.apply(null, { length: 7 }) as undefined[]).map(
  () => getColor.next().value
);

const images = (Array.apply(null, { length: 7 }) as undefined[]).map(
  () => getImage.next().value
);

const ConnectedColorCarousel: React.SFC = () => (
  <Carousel style={{ width: 300, height: 300 }} loop={true}>
    {colors.map((color, i) => (
      <ColorSlide key={i} color={color}>
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
        style={{ OObjectFit: 'cover', width: '100%', height: '100%' }}
      />
    ))}
  </Carousel>
);

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <div className="App-body">
          <ConnectedColorCarousel />
          <ConnectedImageCarousel />
        </div>
      </div>
    );
  }
}

export default App;
