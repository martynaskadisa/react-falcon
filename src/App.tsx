import * as React from 'react';
import './App.css';
import Carousel from './components/Carousel';
import ControlledCarousel from './ControlledCarousel';
import logo from './logo.svg';
import UncontrolledCarousel from './UncontrolledCarousel';

function* imageGenerator() {
  while (true) {
    yield `https://source.unsplash.com/random/40${Math.round(
      Math.random() * 10
    )}x30${Math.round(Math.random() * 10)}?v=${Math.random()}`;
  }
}

const getImage = imageGenerator();

const images = (Array.apply(null, { length: 5 }) as undefined[]).map(
  () => getImage.next().value
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
          <div>
            <h3>Uncontrolled example</h3>
            <UncontrolledCarousel />
          </div>
          <div>
            <h3>Controlled example</h3>
            <ControlledCarousel />
          </div>
          <div>
            <h3>Uncontrolled w/ images</h3>
            <ConnectedImageCarousel />
          </div>
        </div>
      </div>
    );
  }

  private handleClick() {
    this.setState({ count: this.state.count + 10 });
  }
}

export default App;
