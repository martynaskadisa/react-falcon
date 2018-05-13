# react-falcon
<!-- Insert CI/npm badges here -->

Lightweight and fast carousel component.

<!-- Don't forget to add github pages -->
_Checkout the demo_

## Table of contents

- [Installing](#installing)
- [Why create yet another carousel component?](#why-create-yet-another-carousel-component)
- [Examples](#examples)
- [Dependencies](#dependencies)
- [API](#api)
- [Changelog](#changelog)
- [Licence](#licence)

## Installing

```npm install react-falcon```

or

```yarn add react-falcon```


## Why create yet another carousel component?

Most carousel implementations use initialization process with expensive DOM 
operations which causes them to slow down the performance of a website, 
especially when the carousel is mounting. 

This carousel has no initialization process (besides React lifecycle) 
and only performs reads when absolutely necessary. Therefore, there can 
safely be many instances of this component.

In addition to that, `react-falcon` uses windowing technique so it only 
renders 3 slides at a time (no need to render what users can't see).

## Examples

<!-- Don't forget to add github pages -->
_Checkout the demo_

```jsx
import React from 'react'
import { Carousel } from 'react-falcon'

const App = () => (
  <Carousel>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
    <div>5</div>
  </Carousel>
)

export default App
```

## Dependencies

__React__ is the only dependency for this component.

## API

### props

| prop name | Required?   | Default value | Notes                                                                    |
|-----------|:-----------:|:-------------:|--------------------------------------------------------------------------|
| loop      | no          | false         | Whether it should go to the first slide after the last one or vice versa |
| animate   | no          | true          | Whether it should animate transition when use let goes of the slide      |

## Licence

MIT