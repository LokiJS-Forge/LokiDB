[![NPM Status](https://img.shields.io/npm/v/@lokijs/loki.svg)](https://www.npmjs.com/package/@lokijs/loki)
[![Build Status](https://travis-ci.org/LokiJS-Forge/LokiJS2.svg?branch=master)](https://travis-ci.org/LokiJS-Forge/LokiJS2)
[![Coverage Status](https://coveralls.io/repos/github/LokiJS-Forge/LokiJS2/badge.svg?branch=master)](https://coveralls.io/github/LokiJS-Forge/LokiJS2?branch=master)

<h1 align="center">LokiJS 2</h1>

LokiJS is a document oriented database written in javascript, published under MIT License.
Its purpose is to store javascript objects as documents in a nosql fashion and retrieve them with a similar mechanism.

<h2 align="center">Install</h2>

Install with npm:

```bash
npm install @lokijs/loki
```

<h2 align="center">Concepts</h2>

LokiJS has many plugins.

|Name|Status|Description|
|:--:|:----:|:----------|
|[@loki/fs-storage][fs-storage]|?|A persistence adapter which persists to node fs module storage.|
|[@loki/local-storage][local-storage]|?|A persistence adapter which persists to web browser's indexed db storage.|
|[@loki/indexed-storage][indexed-storage]|?|A persistence adapter which persists to web browser's local storage.|
|[@loki/partitioning-adapter][partitioning-adapter]|?|An adapter for adapters. Converts a non reference mode adapter into a reference mode adapter which can perform destructuring and partitioning.|

[fs-storage]: https://github.com/LokiJS-Forge/LokiJS2
[local-storage]: https://github.com/LokiJS-Forge/LokiJS2
[indexed-storage]: https://github.com/LokiJS-Forge/LokiJS2
[partitioning-adapter]: https://github.com/LokiJS-Forge/LokiJS2
