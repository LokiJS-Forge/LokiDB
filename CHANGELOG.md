<a name="2.0.0-beta.9"></a>
# [2.0.0-beta.9](https://github.com/LokiJS-Forge/LokiDB/compare/2.0.0-beta.8...2.0.0-beta.9) (2020-02-07)


### Bug Fixes

* **loki:** unique search with no matching entry should not fail ([#172](https://github.com/LokiJS-Forge/LokiDB/issues/172)) ([fd2c7d9](https://github.com/LokiJS-Forge/LokiDB/commit/fd2c7d9))
* **loki:** use global.proceas in getENV ([#170](https://github.com/LokiJS-Forge/LokiDB/issues/170)) ([a65e668](https://github.com/LokiJS-Forge/LokiDB/commit/a65e668))


<a name="2.0.0-beta.8"></a>
# [2.0.0-beta.8](https://github.com/LokiJS-Forge/LokiDB/compare/2.0.0-beta.7...2.0.0-beta.8) (2018-09-14)


### Bug Fixes

* **loki:** define nested properties on rollback transaction ([#149](https://github.com/LokiJS-Forge/LokiDB/issues/149)) ([9e06e91](https://github.com/LokiJS-Forge/LokiDB/commit/9e06e91))


### Features

* **loki:** remove binary index  ([#146](https://github.com/LokiJS-Forge/LokiDB/issues/146)) ([1fb99f2](https://github.com/LokiJS-Forge/LokiDB/commit/1fb99f2))
* **loki:** user definable comparators and operator packages ([#152](https://github.com/LokiJS-Forge/LokiDB/issues/152)) ([5c14bc2](https://github.com/LokiJS-Forge/LokiDB/commit/5c14bc2))


<a name="2.0.0-beta.7"></a>
# [2.0.0-beta.7](https://github.com/LokiJS-Forge/LokiDB/compare/2.0.0-beta.6...2.0.0-beta.7) (2018-06-27)


### Bug Fixes

* **full-text-search:** apply bool query boost to subquery results ([#122](https://github.com/LokiJS-Forge/LokiDB/issues/122)) ([5548fe5](https://github.com/LokiJS-Forge/LokiDB/commit/5548fe5))
* **full-text-search:** handle not and filter bool queries right ([#128](https://github.com/LokiJS-Forge/LokiDB/issues/128)) ([98d0cd8](https://github.com/LokiJS-Forge/LokiDB/commit/98d0cd8))
* **loki:** fix autosave and autoload of the database ([#112](https://github.com/LokiJS-Forge/LokiDB/issues/112)) ([ef260fd](https://github.com/LokiJS-Forge/LokiDB/commit/ef260fd))
* **loki:** when cloning, meta will be applied correctly and clones emitted ([#111](https://github.com/LokiJS-Forge/LokiDB/issues/111)) ([d287a2d](https://github.com/LokiJS-Forge/LokiDB/commit/d287a2d)), closes [techfort/LokiJS#666](https://github.com/techfort/LokiJS/issues/666)


### Features

* improve type notation ([#109](https://github.com/LokiJS-Forge/LokiDB/issues/109)) ([3b60c9f](https://github.com/LokiJS-Forge/LokiDB/commit/3b60c9f))
* **full-text-search:** allow number or string as document id ([#115](https://github.com/LokiJS-Forge/LokiDB/issues/115)) ([1d81e25](https://github.com/LokiJS-Forge/LokiDB/commit/1d81e25))
* **full-text-search:** export function analyze ([#102](https://github.com/LokiJS-Forge/LokiDB/issues/102)) ([c1dd78c](https://github.com/LokiJS-Forge/LokiDB/commit/c1dd78c))
* **full-text-search:** if elasticsearch is not available, disable its unit test ([#98](https://github.com/LokiJS-Forge/LokiDB/issues/98)) ([a1c7d8d](https://github.com/LokiJS-Forge/LokiDB/commit/a1c7d8d))
* **full-text-search:** implement conditional minimum should match parameter ([#129](https://github.com/LokiJS-Forge/LokiDB/issues/129)) ([baa6311](https://github.com/LokiJS-Forge/LokiDB/commit/baa6311))
* **full-text-search:** make analyzers classes instead of objects ([#123](https://github.com/LokiJS-Forge/LokiDB/issues/123)) ([1959688](https://github.com/LokiJS-Forge/LokiDB/commit/1959688))


<a name="2.0.0-beta.6"></a>
# [2.0.0-beta.6](https://github.com/LokiJS-Forge/LokiDB/compare/2.0.0-beta.5...2.0.0-beta.6) (2018-03-23)

For a better distinction, the library has been renamed to LokiDB.

The repository is now located under https://github.com/LokiJS-Forge/LokiDB

The npm packages can be found under the organization scope @lokidb.


## Commit Summary
### Bug Fixes

* **full-text-search:** fix fuzzy's prefix length, edit distance and idf ([#68](https://github.com/LokiJS-Forge/LokiDB/issues/68)) ([da06836](https://github.com/LokiJS-Forge/LokiDB/commit/da06836))
* **full-text-search:** rename field option "name" to "field" ([#67](https://github.com/LokiJS-Forge/LokiDB/issues/67)) ([ff74219](https://github.com/LokiJS-Forge/LokiDB/commit/ff74219))
* **loki:** fix a autosave race condition when using asynchronous adapter ([#79](https://github.com/LokiJS-Forge/LokiDB/issues/79)) ([db26d02](https://github.com/LokiJS-Forge/LokiDB/commit/db26d02))
* **loki:** fix binary index in batch updates when not cloning ([#78](https://github.com/LokiJS-Forge/LokiDB/issues/78)) ([8081799](https://github.com/LokiJS-Forge/LokiDB/commit/8081799))


### Features

* **full-text-search:** remove query builder ([#73](https://github.com/LokiJS-Forge/LokiDB/issues/73)) ([84757ab](https://github.com/LokiJS-Forge/LokiDB/commit/84757ab))
* **full-text-search:** remove unnecessary array query ([#75](https://github.com/LokiJS-Forge/LokiDB/issues/75)) ([4ff5165](https://github.com/LokiJS-Forge/LokiDB/commit/4ff5165))
* **full-text-search:** replace the old "tokenizer" class with an analyzer interface ([#76](https://github.com/LokiJS-Forge/LokiDB/issues/76)) ([2d44384](https://github.com/LokiJS-Forge/LokiDB/commit/2d44384))
* **full-text-search:** return score result as an equivalent array to result set data ([#69](https://github.com/LokiJS-Forge/LokiDB/issues/69)) ([7ea17c0](https://github.com/LokiJS-Forge/LokiDB/commit/7ea17c0))
* **loki:** add diagnostic function to test binary index validity ([#85](https://github.com/LokiJS-Forge/LokiDB/issues/85)) ([d611722](https://github.com/LokiJS-Forge/LokiDB/commit/d611722))
* **loki:** add option to disable meta property for documents added to a collection ([#80](https://github.com/LokiJS-Forge/LokiDB/issues/80)) ([1a49470](https://github.com/LokiJS-Forge/LokiDB/commit/1a49470))
* **loki:** add simplified javascript comparisons $jgt, $jgte, $jlt, $jlte, $jbetween ([#87](https://github.com/LokiJS-Forge/LokiDB/issues/87)) ([32e4b1e](https://github.com/LokiJS-Forge/LokiDB/commit/32e4b1e))
* **loki:** change and improve nested property support ([#81](https://github.com/LokiJS-Forge/LokiDB/issues/81)) ([2730284](https://github.com/LokiJS-Forge/LokiDB/commit/2730284))
* **loki:** return an existing collection if a collection with the same name already exists ([#77](https://github.com/LokiJS-Forge/LokiDB/issues/77)) ([75afd67](https://github.com/LokiJS-Forge/LokiDB/commit/75afd67))
* **loki:** simplesort leverages binary indices better when filtered ([#83](https://github.com/LokiJS-Forge/LokiDB/issues/83)) ([4d1b25b](https://github.com/LokiJS-Forge/LokiDB/commit/4d1b25b))


<a name="2.0.0-beta.5"></a>
# [2.0.0-beta.5](https://github.com/LokiJS-Forge/LokiJS2/compare/2.0.0-beta.4...2.0.0-beta.5) (2018-01-02)


### Bug Fixes

* **full-text-search-language:** add missing function export ([#64](https://github.com/LokiJS-Forge/LokiJS2/issues/64)) ([9b926e2](https://github.com/LokiJS-Forge/LokiJS2/commit/9b926e2))


### Features

* improve typings ([#62](https://github.com/LokiJS-Forge/LokiJS2/issues/62)) ([b44f550](https://github.com/LokiJS-Forge/LokiJS2/commit/b44f550))
* **full-text-search:** add an optional score explanation ([#65](https://github.com/LokiJS-Forge/LokiJS2/issues/65)) ([9fde195](https://github.com/LokiJS-Forge/LokiJS2/commit/9fde195))
* **memory-storage:** move memory storage to a separate package ([#63](https://github.com/LokiJS-Forge/LokiJS2/issues/63)) ([7cea02a](https://github.com/LokiJS-Forge/LokiJS2/commit/7cea02a))


<a name="2.0.0-beta.4"></a>
# [2.0.0-beta.4](https://github.com/LokiJS-Forge/LokiJS2/compare/2.0.0-beta.3...2.0.0-beta.4) (2017-12-01)


### Features

* **full-text-search:** make index Unicode safe and improve fuzzy performance ([#55](https://github.com/LokiJS-Forge/LokiJS2/issues/55)) ([f1dea05](https://github.com/LokiJS-Forge/LokiJS2/commit/f1dea05))


<a name="2.0.0-beta.3"></a>
# [2.0.0-beta.3](https://github.com/LokiJS-Forge/LokiJS2/compare/2.0.0-beta.2...2.0.0-beta.3) (2017-11-26)


### Bug Fixes

* coverage ([#42](https://github.com/LokiJS-Forge/LokiJS2/issues/42)) ([3509429](https://github.com/LokiJS-Forge/LokiJS2/commit/3509429))
* **full-text-search:** fix fuzzy extended to withdraw wrong results ([#51](https://github.com/LokiJS-Forge/LokiJS2/issues/51)) ([4d493ac](https://github.com/LokiJS-Forge/LokiJS2/commit/4d493ac))
* **loki:** cloning method for specific classes ([#30](https://github.com/LokiJS-Forge/LokiJS2/issues/30)) ([4f4a182](https://github.com/LokiJS-Forge/LokiJS2/commit/4f4a182))
* **loki:** fix error if passed parameters are not serializable for transform ([#43](https://github.com/LokiJS-Forge/LokiJS2/issues/43)) ([dde34ed](https://github.com/LokiJS-Forge/LokiJS2/commit/dde34ed))
* **loki:** implement deep clone as default clone option ([#44](https://github.com/LokiJS-Forge/LokiJS2/issues/44)) ([2f3b718](https://github.com/LokiJS-Forge/LokiJS2/commit/2f3b718))


### Features

* **full-text-search:** add full-text-search as separate package ([#35](https://github.com/LokiJS-Forge/LokiJS2/issues/35)) ([14b9947](https://github.com/LokiJS-Forge/LokiJS2/commit/14b9947))
* **full-text-search:** english and german language support ([3a93477](https://github.com/LokiJS-Forge/LokiJS2/commit/3a93477))
* **full-text-search:** implement extended fuzzy ([#47](https://github.com/LokiJS-Forge/LokiJS2/issues/47)) ([0579026](https://github.com/LokiJS-Forge/LokiJS2/commit/0579026))
* **loki:** add 'dataOptions' to eqJoin ([#33](https://github.com/LokiJS-Forge/LokiJS2/issues/33)) ([efa450e](https://github.com/LokiJS-Forge/LokiJS2/commit/efa450e))
* **loki:** add optional flag for Changes API to limit update operation output to modified properties only ([#29](https://github.com/LokiJS-Forge/LokiJS2/issues/29)) ([a8abe99](https://github.com/LokiJS-Forge/LokiJS2/commit/a8abe99))
* **loki:** allow sorting on nested properties ([#31](https://github.com/LokiJS-Forge/LokiJS2/issues/31)) ([9b426a4](https://github.com/LokiJS-Forge/LokiJS2/commit/9b426a4))
* **loki:** chained/transform map op now accepts 'dataOptions' for clone/removeMeta ([#34](https://github.com/LokiJS-Forge/LokiJS2/issues/34)) ([67d61ac](https://github.com/LokiJS-Forge/LokiJS2/commit/67d61ac))
* **loki:** make Resultset and DynamicView sortable by full-text-search scoring ([#45](https://github.com/LokiJS-Forge/LokiJS2/issues/45)) ([0a5b946](https://github.com/LokiJS-Forge/LokiJS2/commit/0a5b946))
* **loki:** rename collection ([#32](https://github.com/LokiJS-Forge/LokiJS2/issues/32)) ([745e025](https://github.com/LokiJS-Forge/LokiJS2/commit/745e025))
* integrate full-text-search to loki (insert/update/remove + search) ([8fbc174](https://github.com/LokiJS-Forge/LokiJS2/commit/8fbc174))
* move to typescript ([#36](https://github.com/LokiJS-Forge/LokiJS2/issues/36)) ([d47f190](https://github.com/LokiJS-Forge/LokiJS2/commit/d47f190))


<a name="2.0.0-beta.2"></a>
# [2.0.0-beta.2](https://github.com/LokiJS-Forge/LokiJS2/compare/2.0.0-beta.1...2.0.0-beta.2) (2017-09-21)





<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2017-09-21)


### Features

* **fs-storage:** add fs storage as separate package ([#19](https://github.com/LokiJS-Forge/LokiJS2/issues/19)) ([ec2e523](https://github.com/LokiJS-Forge/LokiJS2/commit/ec2e523))
* **indexed-storage:** add indexed storage as separate package ([#20](https://github.com/LokiJS-Forge/LokiJS2/issues/20)) ([1150029](https://github.com/LokiJS-Forge/LokiJS2/commit/1150029))
* **local-storage:** add local storage as separate package ([#18](https://github.com/LokiJS-Forge/LokiJS2/issues/18)) ([548abfe](https://github.com/LokiJS-Forge/LokiJS2/commit/548abfe))
* **loki:** add lokijs as core package ([#9](https://github.com/LokiJS-Forge/LokiJS2/issues/9)) ([f670ea0](https://github.com/LokiJS-Forge/LokiJS2/commit/f670ea0))
* **partitioning-adapter:** add partitioning-adapter as separate package ([#14](https://github.com/LokiJS-Forge/LokiJS2/issues/14)) ([c6b18ca](https://github.com/LokiJS-Forge/LokiJS2/commit/c6b18ca))


