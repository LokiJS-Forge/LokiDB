# LokiOperatorPackages

## Overview
LokiDB allows querying your collections with a "mongo-like" query object, passed to a collection.find() or query chain. The set of available "ops" which you can include within your query object is called a **_LokiOperatorPackage_**.  

A LokiOperatorPackage represents the unindexed or "fallback" implementation of all supported ops.

> Ranged Indexes allow the highest performance for querying collections... however they only implement a limited subset of ops ($eq, $lt, $lte, $gt, $gte, $between).
> 
> Filtering other ops (even when a ranged index is applied) falls back to the LokiOperatorPackage registered as that collection's default.

In the previous version of LokiDB (LokiJS) there was just one 'LokiOps'.  LokiDB allows and provides multiple for you to choose from or even provide your own.

## Why support multiple implementations of operators?

The primary reasons/drivers for our adoption of this approach is the following :

- Have simplest and fastest minimal javascript implementations of these operators
- Also have an implementation which is more tolerant of dirty data and mixed datatypes
- Have an implementation which allows injecting your own comparators.
- Future-proofing and smoothing transition between major changes (experimental -> default)

Attempting to merge/blend any of the above use cases into a single implementation had negative impact on performance, so we created the ability to switch out whole implementations which only needs to be done once per find, rather than switching behavior for every document evaluation within that filtering.  Having separate selectable packages also provides future-proofing and development of experimental implementions in parallel with maintaining existing implementations.

## What are the LokiOperatorPackages which LokiDB supports?
Out of the box, LokiDB implements the following operator packages, which you can choose from (currently per-collection) :

- **"js"** (default) : the default implementation using fastest javascript comparisons. This is an instance of the main **LokiOperatorPackage** class.
- **"loki"** : implementation recommended for dirty data / mixed datatypes. This is an instance of **LokiAbstractOperator** class.
- **_comparator_** - you need to instantiate this yourself and register that with a name within the loki constructor (example below).  These are created by instantiating the **ComparatorOperatorPackage** class, passing in a comparator to its constructor.

In practice we have one main implementation of all ops in the (default) "LokiOperatorPackage" class which our other implementations extend from 
and override base behavior where needed.  We may provide other implementations later, and you can provide your own implementations.  Other variants which we (or you) may provide can simply extend this class and override the ops we/you wish to have different implementations.

## How would I select an operator package to use for my collection?

When you call addCollection, such as :
```javascript
let coll = db.addCollection("coll", {
  defaultLokiOperatorPackage: "js"
});
```

## How can I create and register my own operator package?

Usually you would extend the default LokiOperatorPackage, however any of our operator package classes can be extended from.

An example where we extend and override some of the ops with some arbitrary "opposite logic" might be :
```javascript
// extend and override with some opposite logic
class MyOperatorPackage extends LokiOperatorPackage {
  $gt(a, b): boolean {
    if (a < b) return true;
    return false;
  }

  $lt(a, b): boolean {
    if (a > b) return true;
    return false;
  }
}

// inject our new operator into global LokiOperatorPackageMap.
// if it already exists, it will overwrite... this includes overriding native packages.
let db = new Loki("test.db", {
  lokiOperatorPackageMap : {
    "MyOperatorPackage": new MyOperatorPackage()
  }
});
```

Having registered that operator package (in the above example), and creating collections which set that to their default operator package (example above that), unindexed find() filters using the $gt and $lt op will exibit your filtering behavior (RangedIndexes have their own optimized implementation of those ops).  Any other ops specified in your query objects will use the default implementation in the class 
which you extended from.

## How might I create an operator package based on comparators?

If you have created your own comparator or wish to use one of ours as the ultimate determination of filtering for $eq, $lt, $lte, $gt, $gte, and $between ops... how might you set up an operator package for that?

Here is a quick example showing how you might implement that :
```javascript
// create a custom case-insensitive string comparator
let customComparator: ILokiComparer = (a, b) => {
  if (typeof a === "string" && typeof b === "string") {
    a = a.toLocaleLowerCase();
    b = b.toLocaleLowerCase();
  }

  if (a === b) return 0;
  if (a > b) return 1;
  return -1;
};

// instantiate an operator package based on that comparator
let myComparatorOperatorPackage = new ComparatorOperatorPackage(customComparator);

// inject as named operator package within the Loki constructor
let db = new Loki("test.db", {
  lokiOperatorPackageMap: {
    "MyComparatorOperatorPackage": myComparatorOperatorPackage
  }
});
```