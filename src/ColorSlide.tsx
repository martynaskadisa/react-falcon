import * as React from 'react';

const ColorSlide: React.SFC<{ color: string }> = ({ color, children }) => (
  <div
    style={{
      alignItems: 'center',
      backgroundColor: color,
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

export default ColorSlide;
