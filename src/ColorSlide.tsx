import * as React from 'react';

function* colorGenerator() {
  const getValue = () => Math.round(255 * Math.random());
  while (true) {
    yield `rgb(${getValue()}, ${getValue()}, ${getValue()})`;
  }
}

const getColor = colorGenerator();

class ColorSlide extends React.Component<{}, { color: string }> {
  constructor(props: any) {
    super(props);

    this.state = {
      color: getColor.next().value
    };
  }
  public render() {
    const { children } = this.props;
    return (
      <div
        style={{
          alignItems: 'center',
          backgroundColor: this.state.color,
          display: 'flex',
          fontSize: '48px',
          fontWeight: 'bold',
          height: '100%',
          justifyContent: 'center'
        }}
      >
        {children}
      </div>
    );
  }
}

export default ColorSlide;
