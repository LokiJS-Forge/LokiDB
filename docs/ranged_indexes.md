# LokiDB Ranged Indexes

## Overview
RangedIndexes in LokiDB represent an interface which the more higher-performance indexes which can be applied to properties within your collection.

In LokiDB, we have settled on and implemented an **_AVL self balancing binary tree (which supports duplicates)_** as our highest performance index for applying to properties.  This AVL index adheres to and implements the IRangedIndex interface.

While the "avl" ranged index implementation is our only implementation of IRangedIndex, having the interface as an abstraction allows the possibility of offerring alternate implemenations using other algorithms and structures in the future.  It also allows users to experiment, create, and inject their own IRangedIndex implementations in a configurable manner.

## What is the performance of LokiDB's "avl" index implementation?

The best way to compare this is to compare the avl index to the former LokiJS's implementation of binary indices.

In that comparison, avl index seems to be roughly 20% faster for finds() but where avl index really shines is in the "maintenance" costs and for inserts, updates, and removes.  Once you get over a few thousand documents the logarithmic performance of the avl index for maintenance costs really shines comparared to linear maintenance of the binary indices array-splicing approach.

So **_the AVL index is highly scalable_** and not very dependent on collection size for the ops implemented within it ($eq, $lt, $lte, $gt, $gte, $between and somewhat for $in).

On an older Intel Core i5 laptop (in node.js), avl index performance might equate to roughly :
- ~800K - 1M find ops/sec doing single object lookups
- ~250K ops/sec for inserts, updates, and removes (maintenance)

And that approximate performance does not significantly change when we scale from 40K documents to 100K documents.

Obviously on newer and higher performance processors this quickly scales up well above those numbers but when compared to LokiJS you would not likely be able to see those number with any

## How can I apply an avl index to a property in my collection?

Easy, a simple (javascript) example demonstrating this is the following :
```javascript
const db = new Loki("idxtest");

// create a "users" collection, applying an avl index to the "name" property of its documents
const items = db.addCollection("users", {
  rangedIndexes: {
    name: { indexTypeName: "avl", comparatorName: "js" }
  }
});
```

## What other indexes might I want to have an implementation for in the future?
Honestly, most people probably will not need anything other than our AVL index implementation.

The AVL tree is known for keeping strict balancing of its property's values as documents are inserted, updated and removed.

Other implementations such as Red-Black balanced binary search tree algorithms are less strictly balanced so they may have slightly faster inserts, updates, and removes while potentially having slightly higher lookups/finds. 

## If i implement my own RangedIndex, how might I register and use that IRangedIndex implemenation?

Typescript example (may provide javascript example in the future) :
```typescript
// define index implementation
class customRangedIndex<T> implements IRangedIndex<T> {
  public name: string;
  public comparator: ILokiComparer<T>;

  constructor(name: string, comparator: ILokiComparer<T>) {
    this.name = name;
    this.comparator = comparator;
  }

  insert(id: number, val: T) {
    if (!id || !val) throw new Error("");
    return;
  }
  update(id: number, val: T) {
    if (!id || val === null) throw new Error("");
    return;
  }
  remove(id: number) {
    if (!id) throw new Error("");
    return;
  }
  restore(tree: any) {
    if (!tree) throw new Error("");
    return;
  }
  backup() {
    return this;
  }
  rangeRequest(range?: IRangedIndexRequest<T>) {
    if (range === null) {
      // return everything
      return <number[]> [];
    }
    return <number[]> [];
  }
  validateIndex() {
    return true;
  }
}

// randex index implementations need factory function
let myCustomIndexFactory = (name: string, cmp: ILokiComparer<any>) => { 
  return new customRangedIndex<any>(name, cmp); 
};

// register ranged index factory function with loki constructor
let db = new Loki("test.db", {
  rangedIndexFactoryMap: {
    "MyCustomRangedIndex": myCustomIndexFactory
  }
});

// utilize your registed ranged index within a collection
let items = db.addCollection<TestUserType>("users", {
  rangedIndexes: {
    "name": { indexTypeName: "MyCustomRangedIndex", comparatorName: "js" }
  }
});


```
