import * as React from 'react';
import ColorSlide from './ColorSlide';
import Carousel from './components/Carousel';
import { colorGenerator } from './utils';

const getColor = colorGenerator();
const colors = (Array.apply(null, { length: 5 }) as undefined[]).map(
  () => getColor.next().value
);

const UncontrolledCarousel: React.SFC = () => (
  <Carousel style={{ width: 300, height: 300 }} onClick={console.log}>
    {colors.map((color, i) => (
      <ColorSlide key={`color-${color}`} color={color}>
        {i}
      </ColorSlide>
    ))}
  </Carousel>
);

export default UncontrolledCarousel;
