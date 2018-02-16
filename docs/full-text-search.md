# Full-Text Search

LokiJS provides a fast and powerful open-source full-text search engine.

The engine can be used with the LokiJS database to perform full-text
searches over a collection. In addition, the combination enables an easy
document and persistence management since this is already handled by the
database itself.

To fit all your needs, the full-text search can also be used as a standalone library.

## Technical concept

The technical concept is very similar to [Apache Lucene][Lucene] and
[Elasticsearch].

This full-text search is able to achieve fast search responses because,
instead of searching the text directly, it searches an index instead.
This would be the equivalent of retrieving pages in a book related to a
keyword by searching the index at the back of a book, as opposed to
searching the words in each page of the book.

For example, the given text:

> *Peter Piper picked a peck of pickled peppers. How many pickled peppers did Peter Piper pick?. <br/>*

will be tokenized into these tokens:

> *peter, piper, picked, a, peck, of, pickled, peppers, how, many, did*

and then used as an 1-gram inverted index tree (reduced to the **p** branch):

![1-gram-inverted-index][1-gram-inverted-index]
<div style="display:none">
@startuml
left to right direction

(*) --> "p" as p1
p1 --> "e" as e1
e1 --> "t" as t1
t1 --> "e" as e2
e2 --> "<b>r</b>" as r3

p1 --> "i" as i1
i1 --> "c" as c1
c1 --> "<b>k</b>" as k1

k1 --> "e" as e3
e3 --> "<b>d</b>" as d1

i1 --> "p" as p2
p2 --> "e" as e4
e4 --> "<b>r</b>" as r4

e1 --> "c" as c2
c2 --> "<b>k</b>" as k2

k1 --> "l" as l1
l1 --> "e" as e5
e5 --> "<b>d</b>" as d2

e1 --> "p" as p3
p3 --> "p" as p4
p4 --> "e" as e6
e6 --> "r" as r5
r5 --> "<b>s</b>" as s1

@enduml
</div>

Now the inverted index can be searched in different ways:

 * the term query *"peter"* finds `peter`
 * the wildcard query *"p?ck"* finds `pick, peck`
 * the fuzzy query *"pepers"* finds `peppers`
 * the term query *"betty"* finds nothing

Section [Queries](#queries) explains all query types in detail.

In addition to this, the full-text search ranks the matching documents
according to their relevance to a given search query using the ranking
function [Okapi BM25][BM25]. Take a look at section [Scoring](#scoring) for more information.

Check out section [Tokenizer](#Tokenizer) to control which words should be tokenized.


[Lucene]: https://lucene.apache.org/core/
[Elasticsearch]: https://www.elastic.co/de/products/elasticsearch
[1-gram-inverted-index]: https://www.planttext.com/plantuml/img/RP51QiCm44Nt_nGYgwHWoaYoLy7aAeayQONLHCZJ-pUL5Hc1juy_VzumbqMkINv_0WBVHSbJ9V_rBMhoYPtuvmCuVfnKrutg40_gkgX8YBG2pe09N81a80Hf4ngiLt2-ZUdyUHipJmQrosVY2Ru0bu4ZEAgZSnsT2PZR9GPiQdAgoUcLV7UM2pIYRaOjsExvMTJJYew6qtiwUjC9cGH2QFrwSB_dfxSbnSyWcWPOHDjq3U1X1MarxP6sygMMBw_ZB_oO_X_y1m00
[BM25]: https://en.wikipedia.org/wiki/Okapi_BM25

### Demo application

<div id="fts-demo-example"></div>
<script>$(document).ready(() => { $("#fts-demo-example").load("../example/fts-demo.html"); });</script>

## Quick start

#### Naming

The library functionality can be imported with `import {<...>} from "@lokijs/full-text-search`.
If the library is included directly with a script tag, the global variable `LokiFullTextSearch` is available.

The following classes/functions/variables are available:

* FullTextSearch (default)
* Tokenizer

### Standalone

```javascript
// Runnable code
const fts = new LokiFullTextSearch([{field: "txt"}], "id");

fts.addDocument({id: 1, txt: "Betty Botter some butter"});
fts.addDocument({id: 2, txt: "But she said the butter’s bitter"});
fts.addDocument({id: 3, txt: "If I put it in my batter, it will make my batter bitter"});
fts.addDocument({id: 4, txt: "But a bit of better butter will make my batter better"});
fts.addDocument({id: 5, txt: "So ‘twas better Betty Botter bought a bit of better butter"});

const query = {query: {type: "term", field: "txt", value: "butter"}}
const result = fts.search(query);

cout(result);
```


### With LokiJS

```javascript
// Runnable code
// Call before use!
LokiFullTextSearch.register();

const loki = new Loki();

const coll = loki.addCollection("test", {fullTextSearch: [{field: "txt"}]});
coll.insert([
  {txt: "Betty Botter some butter"},
  {txt: "But she said the butter’s bitter"},
  {txt: "If I put it in my batter, it will make my batter bitter"},
  {txt: "But a bit of better butter will make my batter better"},
  {txt: "So ‘twas better Betty Botter bought a bit of better butter"}
]);

const query = {query: {type: "term", field: "txt", value: "butter"}}
const result = coll.find({$fts: query});
cout(result);

```

# Queries

# Scoring

# Tokenizer
