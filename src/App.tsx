import * as React from 'react';
import './App.css';
import ColorSlide from './ColorSlide';
import Carousel from './components/Carousel';

import logo from './logo.svg';

const ConnectedCarousel: React.SFC = () => (
  <Carousel style={{ width: 300, height: 300 }} loop={true}>
    {(Array.apply(null, { length: 7 }) as undefined[])
      .map((_, i) => i)
      .map(item => <ColorSlide key={item}>{item}</ColorSlide>)}
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
          <ConnectedCarousel />
          <ConnectedCarousel />
          <ConnectedCarousel />
        </div>
      </div>
    );
  }
}

export default App;
