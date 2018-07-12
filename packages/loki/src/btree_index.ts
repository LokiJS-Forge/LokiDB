import { ILokiRangedComparer, IRangedIndex, IRangedIndexRequest } from "./helper";

/**
 * Treenode type for binary search tree (BST) implementation.
 *
 * To support duplicates, we may need to either repurpose parent to
 * point to 'elder' sibling or add a siblingId to point to owner of
 * node represented in tree.
 */
export type TreeNode<T> = {
  id: number,
  value: T,
  parent: number | null,
  balance: number,
  height: number,
  left: number | null,
  right: number | null,
  siblings: number[]
};

/* using indexer than than Map since Map is not serializable. 'id' is document id (such as $loki) */
export interface ITreeNodeHash<T> {
  [id: number]: TreeNode<T>;
}

/**
 * Experimental LokiDB AVL Balanced Binary Tree Index implementation.
 * To support duplicates, we use siblings (array) in tree nodes.
 * This index data structure should have higher memory usage than legacy loki binary
 * index but faster maintenance and performance throughout insert/update/remove ops.
 * AVL components guided by William Fiset tutorials at :
 * https://github.com/williamfiset/data-structures/blob/master/com/williamfiset/datastructures/balancedtree/AVLTreeRecursive.java
 * https://www.youtube.com/watch?v=g4y2h70D6Nk&list=PLDV1Zeh2NRsD06x59fxczdWLhDDszUHKt
 */
export class BinaryTreeIndex<T> implements IRangedIndex<T> {
  name: string;
  comparator: ILokiRangedComparer<T>;
  nodes: ITreeNodeHash<T> = {};
  apex: number | null = null;

  /**
   * Initializes index with property name and a comparer function.
   */
  constructor(name: string, comparator: ILokiRangedComparer<T>) {
    this.name = name;
    this.comparator = comparator;
  }

  backup(): BinaryTreeIndex<T> {
    let result = new BinaryTreeIndex<T>(this.name, this.comparator);
    result.nodes = JSON.parse(JSON.stringify(this.nodes));
    result.apex = this.apex;
    return result;
  }

  restore(tree: BinaryTreeIndex<T>) {
    this.name = tree.name;
    this.comparator = tree.comparator;
    this.nodes = JSON.parse(JSON.stringify(tree.nodes));
    this.apex = tree.apex;
  }

  /**
   * Used for inserting a new value into the BinaryTreeIndex
   * @param id Unique Id (such as $loki) to associate with value
   * @param val Value to be indexed and inserted into binary tree
   */
  insert(id: number, val: T) {
    if (id <= 0) {
      throw new Error("btree index ids are required to be numbers greater than zero");
    }

    let node: TreeNode<T> = this.nodes[id] = {
      id: id,
      value: val,
      parent: null,
      balance: 0,
      height: 0,
      left: null,
      right: null,
      siblings: []
    };

    if (!this.apex) {
      this.apex = id;
      return;
    }

    this.insertNode(this.nodes[this.apex], node);
  }

  /**
   * Recursively inserts a treenode and re-balances if needed.
   * @param current
   * @param node
   */
  insertNode(current: TreeNode<T>, node: TreeNode<T>): number {
    switch (this.comparator.compare(node.value, current.value)) {
      case 0:
        // eq
        current.siblings.push(node.id);
        node.parent = current.id;
        break;
      case 1:
        // gt
        if (current.right) {
          this.insertNode(this.nodes[current.right], node);
          this.updateBalance(current);
        }
        else {
          current.right = node.id;
          node.parent = current.id;
          this.updateBalance(current);
        }
        break;
      case -1:
        // lt
        if (current.left) {
          this.insertNode(this.nodes[current.left], node);
          this.updateBalance(current);
        }
        else {
          current.left = node.id;
          node.parent = current.id;
          this.updateBalance(current);
        }
        break;
      default: throw new Error("Invalid comparator result");
    }

    if (current.balance < -1) {
      if (current.left === null) {
        throw new Error("insertNode.balance() : left child should not be null");
      }
      if (this.nodes[current.left].balance <= 0) {
        this.leftLeftCase(current);
      }
      else {
        this.leftRightCase(current);
      }
    }

    if (current.balance > 1) {
      if (current.right === null) {
        throw new Error("insertNode.balance() : right child should not be null");
      }
      if (this.nodes[current.right].balance >= 0) {
        this.rightRightCase(current);
      }
      else {
        this.rightLeftCase(current);
      }
    }

    return current.height;
  }

  /**
   * Updates height and balance (calculation) for tree node
   * @param node
   */
  private updateBalance(node: TreeNode<T>) {
    let hl = node.left ? this.nodes[node.left].height : -1;
    let hr = node.right ? this.nodes[node.right].height : -1;

    //node.height = 1 + Math.max(hl, hr);
    node.height = (hl > hr) ? 1 + hl : 1 + hr;

    node.balance = hr - hl;
  }

  /**
   * Balance the 'double left-heavy' condition
   * @param node
   */
  private leftLeftCase(node: TreeNode<T>) {
    return this.rotateRight(node);
  }

  /**
   * Balance the '(parent) left heavy, (child) right heavy' condition
   * @param node
   */
  private leftRightCase(node: TreeNode<T>) {
    if (!node.left) {
      throw new Error("leftRightCase: left child not set");
    }
    node.left = this.rotateLeft(this.nodes[node.left]).id;
    return this.rotateRight(node);
  }

  /**
   * Balance the 'double right-heavy' condition
   * @param node
   */
  private rightRightCase(node: TreeNode<T>) {
    return this.rotateLeft(node);
  }

  /**
   * Balance the '(parent) right heavy, (child) left heavy' condition
   * @param node
   */
  private rightLeftCase(node: TreeNode<T>) {
    if (!node.right) {
      throw new Error("rightLeftCase: right child not set");
    }

    node.right = this.rotateRight(this.nodes[node.right]).id;
    return this.rotateLeft(node);
  }

  /**
   * Left rotation of node. Swaps right child into current location.
   * @param node
   */
  private rotateLeft(node: TreeNode<T>) {
    if (!node.right) {
      throw new Error("rotateLeft: right child was unavailable.");
    }

    let parent = (node.parent) ? this.nodes[node.parent] : null;
    let right = this.nodes[node.right];

    // assume rights (old) left branch as our (new) right branch
    node.right = right.left;
    if (node.right) {
      this.nodes[node.right].parent = node.id;
    }

    // right will be new parent to node and assume old node's parent
    right.left = node.id;
    right.parent = node.parent;
    node.parent = right.id;

    // remap parent child pointer to right
    if (parent) {
      if (parent.left === node.id) {
        parent.left = right.id;
      }
      else if (parent.right === node.id) {
        parent.right = right.id;
      }
      else {
        throw new Error("rotateLeft() : attempt to remap parent back to child failed... not found");
      }
    }
    else {
      if (this.apex !== node.id) {
        throw new Error("rightRotate expecting parentless node to be apex");
      }

      this.apex = right.id;
    }

    // recalculate height and balance for swapped nodes
    this.updateBalance(node);
    this.updateBalance(right);

    return right;
  }

  /**
   * Right rotation of node. Swaps left child into current location.
   * @param node
   */
  private rotateRight(node: TreeNode<T>) {
    if (!node.left) {
      throw new Error("rotateRight : left child unavailable");
    }

    let parent = (node.parent) ? this.nodes[node.parent] : null;
    let left = this.nodes[node.left];

    // assume left's (old) right branch as our (new) left branch
    node.left = left.right;
    if (left.right) {
      this.nodes[left.right].parent = node.id;
    }

    // 'node' will be right child of left
    left.right = node.id;
    left.parent = node.parent;
    node.parent = left.id;

    if (parent) {
      if (parent.left === node.id) {
        parent.left = left.id;
      }
      else {
        parent.right = left.id;
      }
    }
    else {
      if (this.apex !== node.id) {
        throw new Error("rightRotate expecting parentless node to be apex");
      }

      this.apex = left.id;
    }

    // recalculate height and balance for swapped nodes
    this.updateBalance(node);
    this.updateBalance(left);

    return left;
  }

  /**
   * Diagnostic method for examining tree contents and structure
   * @param node
   */
  getValuesAsTree(node?: TreeNode<T>): any {
    if (this.apex === null) return null;

    node = node || this.nodes[this.apex];

    return {
      id: node.id,
      val: node.value,
      siblings: node.siblings,
      balance: node.balance,
      height: node.height,
      left: node.left ? this.getValuesAsTree(this.nodes[node.left]) : null,
      right: node.right ? this.getValuesAsTree(this.nodes[node.right]) : null,
    };
  }

  /**
   * Updates a value, possibly relocating it, within binary tree
   * @param id Unique Id (such as $loki) to associate with value
   * @param val New value to be indexed within binary tree
   */
  update(id: number, val: T) {
    let node = this.nodes[id];
    let cmp = this.comparator.compare(node.value, val);

    // if the value did not change, or changed to value considered equal to itself, return.
    if (cmp === 0) return;

    this.remove(id);
    this.insert(id, val);
  }

  /**
   * Removes a value from the binary tree index
   * @param id
   */
  remove(id: number) {
    if (!this.apex) {
      throw new Error("remove() : attempting remove when tree has no apex");
    }

    this.removeNode(this.nodes[this.apex], id);
  }

  /**
   * Recursive node removal and rebalancer
   * @param node
   * @param val
   */
  private removeNode(node: TreeNode<T>, id: number) {
    if (!this.nodes[id]) {
      throw new Error("removeNode: attempting to remove a node which is not in hashmap");
    }
    let val: T = this.nodes[id].value;

    switch (this.comparator.compare(val, node.value)) {
      case 0:
        // eq - handle siblings if present
        if (node.siblings.length > 0) {
          // if node to remove is alpha sibling...
          if (node.id === id) {
            // get first sibling as replacement
            let alphaSiblingId: number = <number> node.siblings.shift();
            let alphaSibling: TreeNode<T> = this.nodes[alphaSiblingId];

            // remap all properties but id and value from node onto alphasibling
            alphaSibling.parent = node.parent;
            this.updateChildLink(node.parent, id, alphaSiblingId);
            if (node.left) {
              this.nodes[node.left].parent = alphaSiblingId;
            }
            if (node.right) {
              this.nodes[node.right].parent = alphaSiblingId;
            }
            alphaSibling.left = node.left;
            alphaSibling.right = node.right;
            alphaSibling.siblings = node.siblings;
            alphaSibling.height = node.height;
            alphaSibling.balance = node.balance;
            if (this.apex === id) {
              this.apex = alphaSiblingId;
            }

            // parent all remaining siblings alphaSibling (new parent)
            for (let si of alphaSibling.siblings) {
              this.nodes[si].parent = alphaSiblingId;
            }

            // delete old node from nodes and return
            delete this.nodes[id];
            return;
          }
          // else we are inner sibling
          else {
            let idx = node.siblings.indexOf(id);
            if (idx === -1) {
              throw new Error("Unable to remove sibling from parented sibling");
            }
            node.siblings.splice(idx, 1);
            delete this.nodes[id];
            return;
          }
        }
        // else we have no siblings, node will be removed
        else {
          // if node to delete has no children
          if (!node.left && !node.right) {
            // if we have a parent, remove us from either left or right child link
            this.updateChildLink(node.parent, node.id, null);
            delete this.nodes[id];
            if (id === this.apex) {
              this.apex = null;
            }
            return;
          }

          // if node to delete has only one child we can do simple copy/replace
          if (!node.left || !node.right) {
            if (node.left) {
              this.promoteChild(node, this.nodes[node.left]);
              if (this.apex === id) {
                this.apex = node.left;
              }
            }

            if (node.right) {
              this.promoteChild(node, this.nodes[node.right]);
              if (this.apex === id) {
                this.apex = node.right;
              }
            }

            return;
          }

          // node to delete has two children, need swap with inorder successor
          // use find inorder successor by default
          this.promoteSuccessor(node);
          return;
        }
      case 1:
        // gt - search right branch

        if (!node.right) {
          throw new Error("removeNode: Unable to find value in tree");
        }

        this.removeNode(this.nodes[node.right], id);

        break;
      case -1:
        // lt - search left branch

        if (!node.left) {
          throw new Error("removeNode: Unable to find value in tree");
        }

        this.removeNode(this.nodes[node.left], id);

        break;
    }

    this.updateBalance(node);

    if (node.balance < -1) {
      if (node.left === null) {
        throw new Error("insertNode.balance() : left child should not be null");
      }
      if (this.nodes[node.left].balance <= 0) {
        this.leftLeftCase(node);
      }
      else {
        this.leftRightCase(node);
      }
    }

    if (node.balance > 1) {
      if (node.right === null) {
        throw new Error("insertNode.balance() : right child should not be null");
      }
      if (this.nodes[node.right].balance >= 0) {
        this.rightRightCase(node);
      }
      else {
        this.rightLeftCase(node);
      }
    }

  }

  /**
   * Utility method for updating a parent's child link when it changes
   * @param parentId
   * @param oldChildId
   * @param newChildId
   */
  private updateChildLink(parentId: number | null, oldChildId: number, newChildId: number | null) {
    if (parentId === null) return;

    let parent = this.nodes[parentId];

    if (parent.left === oldChildId) {
      parent.left = newChildId;
    }
    else if (parent.right === oldChildId) {
      parent.right = newChildId;
    }
  }

  /**
   * When removing a parent with only child, this does simple remap of child to grandParent.
   * @param grandParent New parent of 'child'.
   * @param parent Node being removed.
   * @param child Node to reparent to grandParent.
   */
  private promoteChild(parent: TreeNode<T>, child: TreeNode<T>) {
    let gpId = parent.parent;
    if (gpId) {
      let gp = this.nodes[gpId];
      if (gp.left === parent.id) {
        gp.left = child.id;
      }
      else if (gp.right === parent.id) {
        gp.right = child.id;
      }
    }
    // remap (grand) child's parent pointer to grandparent (new parent) or null if new apex
    child.parent = gpId;

    // remove parent from bst hashmap
    delete this.nodes[parent.id];
    return;
  }

  /**
   * Finds a successor to a node and replaces that node with it.
   * @param node
   */
  private promoteSuccessor(node: TreeNode<T>) {
    let oldId = node.id;

    // assume successor/right branch (for now)
    if (!node.right || !node.left) {
      throw new Error("promoteSuccessor() : node to replace does not have two children");
    }

    let successor: TreeNode<T> | null = null;
    let glsId: number;
    let glsValue: T;
    let glsSiblings: number[];

    // if tree is already left heavy,
    // let's replace with predecessor (greatest val in left branch)
    if (node.balance < 0) {
      let lchild = this.nodes[node.left];
      successor = this.findGreaterLeaf(lchild);
      glsId = successor.id;
      glsValue = successor.value;
      glsSiblings = successor.siblings;
      successor.siblings = [];
      this.removeNode(lchild, glsId);
    }
    // otherwise the tree is either balanced or right heavy,
    // so let's use sucessor (least value in right branch)
    else {
      let rchild = this.nodes[node.right];
      successor = this.findLesserLeaf(rchild);
      glsId = successor.id;
      glsValue = successor.value;
      glsSiblings = successor.siblings;
      // dont leave any siblings when we (temporarily) 'remove' or they will assume ownership of old node
      successor.siblings = [];
      this.removeNode(rchild, glsId);
    }

    // update any parent pointers to node being replaced
    if (node.parent) {
      let p = this.nodes[node.parent];
      if (p.left === oldId) p.left = glsId;
      if (p.right === oldId) p.right = glsId;
    }

    // update any child points to node being replaced
    if (node.left) this.nodes[node.left].parent = glsId;
    if (node.right) this.nodes[node.right].parent = glsId;

    // update (reuse) node instance id and value with that of successor
    node.id = glsId;
    node.value = glsValue;
    node.siblings = glsSiblings;

    // update hashmap
    this.nodes[glsId] = node;
    delete this.nodes[oldId];

    // if old was apex, update apex to point to successor
    if (this.apex === oldId) this.apex = glsId;

    this.updateBalance(node);
  }

  /**
   * Utility method for finding In-Order predecessor to the provided node
   * @param node Parent node to find leaf node of greatest 'value'
  */
  private findGreaterLeaf(node: TreeNode<T>): TreeNode<T> {
    if (!node.right) {
      return node;
    }

    let result: TreeNode<T> = this.findGreaterLeaf(this.nodes[node.right]);

    return result ? result : node;
  }

  /**
   * Utility method for finding In-Order successor to the provided node
   * @param node Parent Node to find leaf node of least 'value'
   */
  private findLesserLeaf(node: TreeNode<T>): TreeNode<T> {
    if (!node.left) {
      return node;
    }

    let result: TreeNode<T> = this.findLesserLeaf(this.nodes[node.left]);

    return result ? result : node;
  }

  /**
   *  Interface method to support ranged queries.  Results sorted by index property.
   * @param range Options for ranged request.
   */
  rangeRequest(range?: IRangedIndexRequest<T>): number[] {
    if (!this.apex) return [];

    // if requesting all id's sorted by their value
    if (!range) {
      return this.collateIds(this.nodes[this.apex]);
    }

    if (range.op === "$eq") {
      let match = this.locate(this.nodes[this.apex], range.val);
      if (match === null) {
        return [];
      }

      if (match.siblings.length) {
        return [match.id, ...match.siblings];
      }

      return [match.id];
    }

    let result = this.collateRequest(this.nodes[this.apex], range);

    return result;
  }

  /**
   * Implements ranged request operations.
   * @param node
   * @param range
   */
  private collateRequest(node: TreeNode<T>, range: IRangedIndexRequest<T>): number[] {
    let result: number[] = [];

    if (range.op === "$eq") {
      // we use locate instead for $eq range requests
      throw new Error("collateRequest does not support $eq range request");
    }

    let cmp1: number = this.comparator.compare(node.value, range.val);
    let cmp2: number = 0;

    if (range.op === "$between") {
      if (range.high === null || range.high === undefined) {
        throw new Error("collateRequest: $between request missing high range value");
      }
      cmp2 = this.comparator.compare(node.value, range.high);
    }

    if (node.left) {
      switch (range.op) {
        case "$lt":
        case "$lte":
          result = this.collateRequest(this.nodes[node.left], range);
          break;
        case "$gt":
        case "$gte":
          // if the current node is still greater than compare value,
          // it's possible left child will be too
          if (cmp1 === 1) {
            result = this.collateRequest(this.nodes[node.left], range);
          }
          break;
        case "$between":
          // only pursue left path if current node greater than (low) range val
          if (cmp1 === 1) {
            result = this.collateRequest(this.nodes[node.left], range);
          }
          break;
        default: break;
      }
    }

    if (!range) {
      result.push(node.id);
      result.push(...node.siblings);
    }
    else {
      switch (range.op) {
        case "$lt":
          if (cmp1 === -1) {
            result.push(node.id);
            result.push(...node.siblings);
          }
          break;
        case "$lte":
          if (cmp1 === -1 || cmp1 === 0) {
            result.push(node.id);
            result.push(...node.siblings);
          }
          break;
        case "$gt":
          if (cmp1 === 1) {
            result.push(node.id);
            result.push(...node.siblings);
          }
          break;
        case "$gte":
          if (cmp1 === 1 || cmp1 === 0) {
            result.push(node.id);
            result.push(...node.siblings);
          }
          break;
        case "$between":
          if (cmp1 >= 0 && cmp2 <= 0) {
            result.push(node.id);
            result.push(...node.siblings);
          }
          break;
        default: break;
      }
    }

    if (node.right) {
      if (!range) {
        result.push(...this.collateRequest(this.nodes[node.right], range));
      }
      else {
        switch (range.op) {
          case "$lt":
          case "$lte":
            // if the current node is still less than compare value,
            // it's possible right child will be too
            if (cmp1 === -1) {
              result.push(...this.collateRequest(this.nodes[node.right], range));
            }
            break;
          case "$gt":
          case "$gte":
            result.push(...this.collateRequest(this.nodes[node.right], range));
            break;
          case "$between":
            // only pursue right path if current node less than (high) range val
            if (cmp2 === -1) {
              result.push(...this.collateRequest(this.nodes[node.right], range));
            }
            break;
          default: break;
        }
      }
    }

    return result;
  }

  /**
   * Used on a branch node to return an array of id within that branch, sorted by their value
   * @param node
   */
  private collateIds(node: TreeNode<T>): number[] {
    let result: number[] = [];

    // debug diagnostic
    if (!node) {
      return [];
    }

    if (node.left) {
      result = this.collateIds(this.nodes[node.left]);
    }

    result.push(node.id);
    result.push(...node.siblings);

    if (node.right) {
      result.push(...this.collateIds(this.nodes[node.right]));
    }

    return result;
  }

  /**
   * Traverses tree to a node matching the provided value.
   * @param node
   * @param val
   */
  /*
  private locate(node: TreeNode<T>, val: any): TreeNode<T> {
     switch (this.comparator.compare(val, node.value)) {
        case 0: return node;
        case 1:
           if (!node.right) {
              return null;
           }

           return this.locate(this.nodes[node.right], val);
        case -1:
           if (!node.left) {
              return null;
           }

           return this.locate(this.nodes[node.left], val);
     }
  }
  */

  /**
   * Inline/Non-recusive 'single value' ($eq) lookup.
   * Traverses tree to a node matching the provided value.
   * @param node
   * @param val
   */
  private locate(node: TreeNode<T>, val: T): TreeNode<T> | null {
    while (node !== null) {
      switch (this.comparator.compare(val, node.value)) {
        case 0: return node;
        case 1:
          if (!node.right) {
            return null;
          }

          node = this.nodes[node.right];
          break;
        case -1:
          if (!node.left) {
            return null;
          }

          node = this.nodes[node.left];
          break;
      }
    }

    return null;
  }

  /**
   * Index integrity check (IRangedIndex interface function)
   */
  validateIndex(): boolean {
    // handle null apex condition and verify empty tree and nodes
    if (!this.apex) {
      if (Object.keys(this.nodes).length !== 0) {
        return false;
      }
      return true;
    }

    // ensure apex has no parent
    if (this.nodes[this.apex].parent !== null) {
      return false;
    }

    // high level verification - retrieve all node ids ordered by their values
    let result: number[] = this.collateIds(this.nodes[this.apex]);
    let nc = Object.keys(this.nodes).length;
    // verify the inorder traversal returned same number of elements as nodes hashmap
    if (result.length !== nc) {
      return false;
    }
    // if only one result
    if (result.length === 1) {
      if (this.nodes[result[0]].parent !== null) return false;
      if (this.nodes[result[0]].left !== null) return false;
      if (this.nodes[result[0]].right !== null) return false;

      return true;
    }

    // iterate results and ensure next value is greater or equal to current
    for (let i = 0; i < result.length - 1; i++) {
      if (this.comparator.compare(this.nodes[result[i]].value, this.nodes[result[i + 1]].value) === 1) {
        return false;
      }

    }

    return this.validateNode(this.nodes[this.apex]);
  }

  /**
   * Recursive Node validation routine
   * @param node
   */
  private validateNode(node: TreeNode<T>): boolean {
    // should never have parent or child pointers reference self
    if ([node.parent, node.left, node.right].indexOf(node.id) !== -1) {
      return false;
    }

    // validate height and balance
    let hl = (node.left) ? this.nodes[node.left].height : -1;
    let hr = (node.right) ? this.nodes[node.right].height : -1;
    let eh = 1 + Math.max(hl, hr);
    if (node.height !== eh) {
      return false;
    }
    if (node.balance !== hr - hl) {
      return false;
    }

    // verify any siblings parent back to self
    if (node.siblings.length > 0) {
      for (let sid of node.siblings) {
        if (this.nodes[sid].parent !== node.id) return false;
      }
    }

    // if there is a left child, verify it parents to self and recurse it
    if (node.left) {
      if (this.nodes[node.left].parent !== node.id) {
        return false;
      }
      if (!this.validateNode(this.nodes[node.left])) {
        return false;
      }
    }

    // if there is a right child, verify it parents to self and recurse it
    if (node.right) {
      if (this.nodes[node.right].parent !== node.id) {
        return false;
      }

      if (!this.validateNode(this.nodes[node.right])) {
        return false;
      }
    }

    return true;
  }
}
