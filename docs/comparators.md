# Loki Comparators

>Comparators (in javascript and loki) are functions which accepting two values and return :
>- 0 : if the first and second are considered 'equal'
>- -1 : if the first is less than the second
>- 1 : if the first is greater than the second

## Overview
Since comparators now play a important role in customizing and fine-tuning LokiDB, this page will attempt to summarize reasoning behind this increased structuring. 

In the previous version of LokiDB (LokiJS), various components such as find ops, BinaryIndices and sorting shared a common set of helper functions serving as a common comparator. This arbitrary co-mingling inadvertently became standard as it would have been too much of a breaking change to decouple that later on (although some attempts to provide additional options were later added).

In LokiDB, to support decoupling these various components, we have established a 'ComparatorMap' which is a collection of named comparator functions.

LokiDB utilizes these comparators for : 
- Unindexed sorting
- Used with [RangedIndexes](./ranged_indexes.md) (such as our provided "avl" index) for higher performance.
- Can be optionally leveraged within unindexed find() operations (like $eq, $gt, $gte, $lt, $lte, $bewtween) when using our new 'ComparatorOperatorPackage' (See [operators.md](./operators.md)).  

## Why would I need more than the default "js" comparator?

Out of the box, LokiDB provides some base comparators :
- "js" (default) : fastest, pure javascript with strict equality for $eq
- "abstract-js": fast, pure javascript with loose equality
- "abstract-date": can be used for comparing dates in various formats
- "loki" comparators: slower, safer for mixed datatypes in ranged indexes.  This more closely resembles the comparator functionality which existed in LokiJS.
- (possible additon) "string-insensitive" : could be used for comparing, sorting strings with case insensitivity.

Individual comparators can be selected from the above to be used for indexing, sorting, or filtering... wherever it makes sense from a performance, functional, or type safety perspective.

## Custom, user-defined comparators
If the various 'built-in' comparatos don't fit a particular use case,  users can define their own comparator functions and add to (or override) comparators within the ComparatorMap.  They can then be leveraged in various places for sorting, indexing, filtering.  This configuration is done when instancing your Loki database instance, within the constructor.

An Example of this might look like the following : 
```javascript
// define comparator as fat-arrow or named function
let myComparator = (a, b) => {
   if (a === b) return 0;
   if (a > b) return 1;
   return -1;
}

// pass in any number of comparators to add to or override those aleady registered
let db = new Loki("test.db", {
   comparatorMap: {
      "MyComparator": myComparator
   }
});
```

Having configured the above example, you might use them within collections, such as this simplesort() operation :
```javascript
// when instancing a new collection, you can specify this to override the default "js" unindexedSortComparator.
let coll = db.addCollection("users", {
   unindexedSortComparator: "MyComparator"
});

coll.insert(someDocuments);

// this will use the currently configured default unindexedSortComparator
let result = coll.simplesort("name");

// simplesort also allows you to override this in options
let reversed = coll.simplesort("name", { 
   desc: true,
   unindexedSortComparator: "string-insensitive" 
});

```

Other uses for utilizing the named comparators include defining your own [LokiOperatorPackage](./operators.md) and using within [RangedIndexes](./ranged_indexes.md).  Those topics will go into details and give code samples within their respective pages.

Transform steps such as 'find' filtering and simplesort steps will also be able to leverage these, either explicitly or via options.

## Summary
In the future, anywhere where these comparators can be leveraged, we will likely do so... to allow the ability for the user to customize and optimize LokiDB to best work with their data.

Registration of user defined comparators needs to done every time you re-instance the database.  Only the names of the comparators are persisted within your saved/serialized database.  While this is an additional responsibility, it also allows experimentation to determine the performance (for tuning).

**_Warning_** : If a user defined comparator is paired with a range index, it is important that the comparator not change over time.  Ranged indexes (typically) persist themselves as ordered represenations and future relative calculations of re-organization across inserts, updates, and removes depend on consistent comparison results.

If your custom comparator is **_not_** used by a ranged index, you are free to experiment and refine the comparison results over time to reflect and refine the functional output of various LokiDB tasks. 