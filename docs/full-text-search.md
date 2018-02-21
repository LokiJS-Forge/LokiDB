# Introduction

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

Section [Query types](#query types) explains all query types in detail.

In addition to this, the full-text search ranks the matching documents according to their relevance to a given query
using the ranking function [Okapi BM25][BM25]. Take a look at section [Scoring](#scoring) for more information.

Check out section [Analyzer](#analyzer) to control which and how words should be indexed.

[Lucene]: https://lucene.apache.org/core/
[Elasticsearch]: https://www.elastic.co/de/products/elasticsearch
[1-gram-inverted-index]: https://www.planttext.com/plantuml/img/RP51QiCm44Nt_nGYgwHWoaYoLy7aAeayQONLHCZJ-pUL5Hc1juy_VzumbqMkINv_0WBVHSbJ9V_rBMhoYPtuvmCuVfnKrutg40_gkgX8YBG2pe09N81a80Hf4ngiLt2-ZUdyUHipJmQrosVY2Ru0bu4ZEAgZSnsT2PZR9GPiQdAgoUcLV7UM2pIYRaOjsExvMTJJYew6qtiwUjC9cGH2QFrwSB_dfxSbnSyWcWPOHDjq3U1X1MarxP6sygMMBw_ZB_oO_X_y1m00
[BM25]: https://en.wikipedia.org/wiki/Okapi_BM25

### Demo application

<div id="fts-demo-example"></div>
<script>$(document).ready(() => { $("#fts-demo-example").load("../../example/fts-demo.html"); });</script>

# Quick Start

The library functionality can be imported with `import {<...>} from "@lokijs/full-text-search`.
If the library is included directly with a html-script tag, the global variable `LokiFullTextSearch` is available.

- FullTextSearch (default exported)
- Tokenizer

## Standalone

```javascript
// Runnable code
// Setup the full-text search.
const fts = new LokiFullTextSearch([{field: "txt"}], "id");
// Add documents.
fts.addDocument({id: 1, txt: "Betty Botter some butter"});
fts.addDocument({id: 2, txt: "But she said the butter’s bitter"});
fts.addDocument({id: 3, txt: "If I put it in my batter, it will make my batter bitter"});
fts.addDocument({id: 4, txt: "But a bit of better butter will make my batter better"});
fts.addDocument({id: 5, txt: "So ‘twas better Betty Botter bought a bit of better butter"});
// Search.
const query = {
  query: {
    type: "term",
    field: "txt",
    value: "butter"
  }
};
const result = fts.search(query);
cout(result);
```

## With LokiJS

```javascript
// Runnable code
// Call before use!
LokiFullTextSearch.register();

const loki = new Loki();
// Setup the collection with full-text search options.
const coll = loki.addCollection("test", {fullTextSearch: [{field: "txt"}]});
// Add documents.
coll.insert([
  {txt: "Betty Botter some butter"},
  {txt: "But she said the butter’s bitter"},
  {txt: "If I put it in my batter, it will make my batter bitter"},
  {txt: "But a bit of better butter will make my batter better"},
  {txt: "So ‘twas better Betty Botter bought a bit of better butter"}
]);
// Search.
const query = {
  query: {
    type: "term",
    field: "txt",
    value: "butter"
  }
};
const result = coll.find({$fts: query});
cout(result);

```

# Query types

The full-text search queries are simple javascript objects following an easy to understand language specification
similar to the [Query DSL of Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html).

There exists two kinds of query clauses:

- Leaf query clauses look for a particular value in a particular field.
    - [Term query](api/interfaces/termquery.html)
    - [Terms query](api/interfaces/termsquery.html)
    - [Wildcard query](api/interfaces/wildcardquery.html)
    - [Fuzzy query](api/interfaces/fuzzyquery.html)
    - [Prefix query](api/interfaces/prefixquery.html)
    - [Match query](api/interfaces/matchquery.html)
    - [Exists query](api/interfaces/existsquery.html)
    - [Match all query](api/interfaces/matchallquery.html)
- Compound query clauses wrap other leaf or compound queries and are used to combine multiple queries in a logical
fashion, or to alter their behaviour.
    - [Bool query](api/interfaces/boolquery.html)
    - [Constant score query](api/interfaces/constantscorequery.html)

Apart from this the behaviour of the clauses depends on the used context:

- The query context considers how well a clause matches a specific document using the calculated scoring.
- The filter context only includes or excludes matching documents of a clause.

The example below shows the synergy of the query clauses and the query contexts.

```js
const query = {
  query: {  // Indicates a query context.
    bool: { // A compound query clauses.
      must: [{ // Still query context.
        type: "term", field: "name", value: "odin" // A leaf query clauses.
      }],
      filter: [{   // Indicates a filter context.
        type: "term", field: "username", value: "thor" // A leaf query clauses.
      }]
    }
  }
}
```

Via the property `$fts` the queries of the full-text search can be used in conjunction with the queries of LokiJS.

```js
// Finds all documents with the field age greater than 25
// and the field name containing the token gungnir
coll.find({
  $and: [{
    age: { "$qt": 25 }
  }, {
    $fts: {
      query: {
        type: term,
        field: "name",
        value: "gungnir"
      }
    }
  }]
})
```

Please note that the search time of a full-text search query will not decrease because of a reduced document selection
from a previous query. Each query (if caching is disabled) will always browse the whole inverted index.

As opposed to this, non-indexed queries (like LokiJS' queries) could speed up because of fewer documents after a
full-text search query.

# Scoring

Each matching document of a query will be ranked with a numeric score, depending on their relevance towards to the query
clauses inside the query context.

This full-text search uses [Okapi BM25][BM25] as default ranking function.
BM25 is a state-of-the-art TF-IDF bases similarity with tf-normalization.

To configure BM25, disable scoring or to get a detailed explanation of the scoring result from your query, use the
properties described in the [API](api/interfaces/query.html).

# Analyzer

A given document string will be analyzed to extract only relevant tokens, which should be indexed.

An analyser is the appropriate combination of:

- zero or more [characters filters](#character filters)
- a [tokenizer](#tokenizer)
- zero or more [token filters]

Available analyzer

- English analyzer
- German analyzer

## Character filters

TODO

## Tokenizer

A tokenizer breaks a given string into individual tokens. For example, a whitespace tokenizer splits a string at
whitespace:

`"Betty Botter some butter."` to `["Betty", "Botter", "some", "butter."]`

Available tokenizer:

- Whitespace tokenizer
- Word tokenizer

## Token filters

A token filter takes the tokens form a tokenizer and can modify tokens (e.g. lowercasing), delete token (e.g. remove
stopwords) or add tokens (e.g. synonyms).

- LowercaseTokenFilter



