# Object as Tree

A lightweight utility for visualizing JavaScript/TypeScript objects in a tree structure in the console.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the package as a dev dependency using npm:
```
npm install --save-dev object-as-tree
```

## Features

- Supports objects, arrays, maps, sets, and other common data structures.

- Displays info for RegExp, Date, and other special objects.

- Provides a clear tree representation for easy debugging.

- Detects circular references.

- Zero dependencies.

## Usage

```js
import { asTree } from 'object-as-tree';

const myObject= {
    a: 1,
    b: "Hello World!",
    c: {
        d: true,
        e: null
    },
    f:new Date('2021-01-01'),
    g:[1,2,3],
};

console.log(asTree(myObject));
```

This will output a tree representation of the object:

```
Object{}
├─• a: 1
├─• b: 'Hello World!'
├─• c: Object{}
│ ├─• d: true
│ └─• e: null
├─• f: Date(2021-01-01T00:00:00.000Z)
└─• g: Array(3)
  ├─• 0: 1
  ├─• 1: 2
  └─• 2: 3
```

## Contributing

Contributions are welcome. Open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.