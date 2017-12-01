<div align="center">

[![npm status][npm]][npm-url]

[![build status][build]][build-url]
[![coverage status][coverage]][coverage-url]

</div>

<h1 align="center">LokiJS 2</h1>

LokiJS is a document oriented database written in javascript, published under MIT License.
Its purpose is to store javascript objects as documents in a nosql fashion and retrieve them with a similar mechanism.

<h2 align="center">Install</h2>

Install with npm:

```bash
npm install @lokijs/loki
```

<h2 align="center">Documentation</h2>

Check out our interactive [documentation](https://lokijs-forge.github.io/LokiJS2/).

<h2 align="center">Plugins</h2>

<h3>Storage and Adapter</h3>

|Name|Description|
|:---|:----------|
|[@loki/fs-storage][fs-storage-npm-url]                             |  A persistence adapter which persists to node fs module storage. |
|[@loki/local-storage][local-storage-npm-url]                       |  A persistence adapter which persists to web browser's indexed db storage. |
|[@loki/indexed-storage][indexed-storage-npm-url]                   |  A persistence adapter which persists to web browser's local storage. |
|[@loki/partitioning-adapter][partitioning-adapter-npm-url]         |  An adapter for adapters. Converts a non reference mode adapter into a reference mode adapter which can perform destructuring and partitioning.|

<h3>Full-Text Search</h3>

|Name|Description|
|:---|:----------|
|[@loki/full-text-search][full-text-search]                         |  A full-text search engine. |
|[@loki/full-text-search-language][full-text-search-language]       |  A language analyzer utility package. |
|[@loki/full-text-search-language-de][full-text-search-language-de] |  A german language analyzer. ![flag][full-text-search-language-de-flag] |
|[@loki/full-text-search-language-en][full-text-search-language-en] |  An english language analyzer. ![flag][full-text-search-language-en-flag] |

[build]: https://travis-ci.org/LokiJS-Forge/LokiJS2.svg?branch=master
[build-url]: https://travis-ci.org/LokiJS-Forge/LokiJS2
[coverage]: https://coveralls.io/repos/github/LokiJS-Forge/LokiJS2/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/LokiJS-Forge/LokiJS2?branch=master

[npm]: https://img.shields.io/npm/v/@lokijs/loki.svg
[npm-url]: https://www.npmjs.com/package/@lokijs/loki

[fs-storage]: https://github.com/LokiJS-Forge/LokiJS2
[fs-storage-npm-url]: https://www.npmjs.com/package/@lokijs/fs-storage

[local-storage]: https://github.com/LokiJS-Forge/LokiJS2
[local-storage-npm-url]: https://www.npmjs.com/package/@lokijs/fs-storage

[indexed-storage]: https://github.com/LokiJS-Forge/LokiJS2
[indexed-storage-npm-url]: https://www.npmjs.com/package/@lokijs/indexed-storage

[partitioning-adapter]: https://github.com/LokiJS-Forge/LokiJS2
[partitioning-adapter-npm-url]: https://www.npmjs.com/package/@lokijs/partitioning-adapter

[full-text-search]: https://github.com/LokiJS-Forge/LokiJS2
[full-text-search-npm-url]: https://www.npmjs.com/package/@lokijs/full-text-search
[full-text-search-language]: https://github.com/LokiJS-Forge/LokiJS2
[full-text-search-language-npm-url]: https://www.npmjs.com/package/@lokijs/full-text-search-language
[full-text-search-language-de]: https://github.com/LokiJS-Forge/LokiJS2
[full-text-search-language-de-flag]: https://cdn.rawgit.com/gosquared/flags/1d382a9e/flags/flags/flat/48/Germany.png
[full-text-search-language-de-npm-url]: https://www.npmjs.com/package/@lokijs/full-text-search-language-de
[full-text-search-language-en]: https://github.com/LokiJS-Forge/LokiJS2
[full-text-search-language-en-npm-url]: https://www.npmjs.com/package/@lokijs/full-text-search-language-en
[full-text-search-language-en-flag]: https://cdn.rawgit.com/gosquared/flags/1d382a9e/flags/flags/flat/48/United-States.png
