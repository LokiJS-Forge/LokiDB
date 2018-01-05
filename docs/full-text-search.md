# Full-Text Search

LokiJS provides a fast and powerful open-source full-text search engine.

The engine can be used with the LokiJS database to perform full-text
searches over a collection. In addition, the combination enables an easy
document and persistence management since this is already handled by the
database itself.

But the full-text search can also be used as a standalone engine, to fit
all your needs.

## Technical concept

The technical concept is very similar to [Apache Lucene][Lucene] and
[Elasticsearch].

This full-text search is able to achieve fast search responses because,
instead of searching the text directly, it searches an index instead.
This would be the equivalent of retrieving pages in a book related to a
keyword by searching the index at the back of a book, as opposed to
searching the words in each page of the book.

For example, the given text:

> Betty Botter bought some butter<br/>

will be tokenized into these words:

> betty, botter, bought, butter

and then used as an 1-gram inverted index tree:

![inverted-index][inverted-index]

Now the inverted index can be searched in different ways:

 * the term query *"betty"* finds `betty`
 * the wildcard query *"b?tter"* finds `botter, butter`
 * the fuzzy query *"boght"* finds `bought`
 * the term query *"some"* finds nothing
 * and so on...

In addition to it, this full-text search ranks the matching documents
according to their relevance to a given search query using the ranking
function [Okapi BM25][BM25].

For example, these five documents:

1. Betty Botter bought some butter
2. But she said the butter’s bitter
3. If I put it in my batter, it will make my batter bitter
4. But a bit of better butter will make my batter better
5. So ‘twas better Betty Botter bought a bit of better butter

<div/>

* For the term query *"butter"* document 1 has the highest score, because it has the fewest words.
* For the term query *"batter"* document 3 has the highest score, because this document contains "*batter*" twice.
* For the term query *"better"* document 4 and 5 has the highest score, because there word count is the same and containing "*better*" twice.

[Lucene]: https://lucene.apache.org/core/
[Elasticsearch]: https://www.elastic.co/de/products/elasticsearch
[inverted-index]: https://www.planttext.com/plantuml/img/LP313e8m44JlynLDJzg4Iq6u6Ny5P0KIf4cP7lnxPH5ZJvDzCvb9zhQoZKpF6RCyQ1XCd8QHff-Yt3c51ITtDaLnDRQpfbrDXqvFWQWIt6sgJG_w7JZtSixYcmy8MQu4omnKOBK3KI0UyckAshGt92JL0OFgYF68yHFJiiinQvE2v95yDbU3TGOQiCdsIqZvlx_1w07SPEctZxq1
[BM25]: https://en.wikipedia.org/wiki/Okapi_BM25

## Quick start

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


### Within LokiJS database

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
