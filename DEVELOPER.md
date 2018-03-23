<!-- This page is a modified version of [Angular](https://github.com/angular/angular/blob/master/docs/DEVELOPER.md). -->

# Building and testing LokiDB

This document describes how to set up your development environment to build and test LokiDB.

* [Prerequisite software](#prerequisite-software)
* [Running tests](#running-tests)
* [Formatting your source code](#formatting-your-source-code)
* [Building LokiDB](#building-lokidb)

See the [contribution guidelines][contribution] if you'd like to contribute to LokiDB.

## Prerequisite software

Before you can build and test LokiDB, you must install and configure the
following products on your development machine:

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com)); [GitHub's Guide to Installing
  Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), (version `>=7.0.0`) which is used to run tests and generate distributable files.
  We also use Node's Package Manager, `npm`(version `>=4.0.0`), which comes with Node.
  Depending on your system, you can install Node either from source or as a pre-packaged bundle.

* [Elasticsearch](https://www.elastic.co/downloads/elasticsearch) which is used to unit test LokiDB's full text search.

## Running tests

To run tests:

```shell
$ npm run test            # Run all LokiDB tests

$ npm run test:web        # Run tests only in web browser
$ npm run test:node       # Run tests only in node
```

All the tests are executed on our Continuous Integration infrastructure and a PR could only be merged once the tests pass.

## Formatting your source code

LokiDB uses [ESLint][eslint] to format the source code. If the source code is not properly formatted, the CI will fail and the PR can not be merged.

You can check that your code is properly formatted and adheres to coding style by running:

``` shell
$ npm run lint
```

You can automatically format your code by running:

``` shell
$ npm run lint:fix
```

## Building LokiDB

To build LokiDB, run:

``` shell
$ npm run build
```

[eslint]: https://eslint.org/
[contribution]: https://github.com/LokiJS-Forge/LokiDB/blob/master/CONTRIBUTING.md
