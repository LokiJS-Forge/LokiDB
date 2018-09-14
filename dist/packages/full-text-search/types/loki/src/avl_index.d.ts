import { IRangedIndex, IRangedIndexRequest } from "./ranged_indexes";
import { ILokiComparer } from "./comparators";
/**
 * Treenode type for binary search tree (BST) implementation.
 *
 * To support duplicates, we may need to either repurpose parent to
 * point to 'elder' sibling or add a siblingId to point to owner of
 * node represented in tree.
 */
export declare type TreeNode<T> = {
    id: number;
    value: T;
    parent: number | null;
    balance: number;
    height: number;
    left: number | null;
    right: number | null;
    siblings: number[];
};
export interface ITreeNodeHash<T> {
    [id: number]: TreeNode<T>;
}
/**
 * LokiDB AVL Balanced Binary Tree Index implementation.
 * To support duplicates, we use siblings (array) in tree nodes.
 * Basic AVL components guided by William Fiset tutorials at :
 * https://github.com/williamfiset/data-structures/blob/master/com/williamfiset/datastructures/balancedtree/AVLTreeRecursive.java
 * https://www.youtube.com/watch?v=g4y2h70D6Nk&list=PLDV1Zeh2NRsD06x59fxczdWLhDDszUHKt
 */
export declare class AvlTreeIndex<T> implements IRangedIndex<T> {
    name: string;
    comparator: ILokiComparer<T>;
    nodes: ITreeNodeHash<T>;
    apex: number | null;
    /**
     * Initializes index with property name and a comparer function.
     */
    constructor(name: string, comparator: ILokiComparer<T>);
    backup(): AvlTreeIndex<T>;
    restore(tree: AvlTreeIndex<T>): void;
    /**
     * Used for inserting a new value into the BinaryTreeIndex
     * @param id Unique Id (such as $loki) to associate with value
     * @param val Value to be indexed and inserted into binary tree
     */
    insert(id: number, val: T): void;
    /**
     * Recursively inserts a treenode and re-balances if needed.
     * @param current
     * @param node
     */
    insertNode(current: TreeNode<T>, node: TreeNode<T>): number;
    /**
     * Updates height and balance (calculation) for tree node
     * @param node
     */
    private updateBalance(node);
    /**
     * Balance the 'double left-heavy' condition
     * @param node
     */
    private leftLeftCase(node);
    /**
     * Balance the '(parent) left heavy, (child) right heavy' condition
     * @param node
     */
    private leftRightCase(node);
    /**
     * Balance the 'double right-heavy' condition
     * @param node
     */
    private rightRightCase(node);
    /**
     * Balance the '(parent) right heavy, (child) left heavy' condition
     * @param node
     */
    private rightLeftCase(node);
    /**
     * Left rotation of node. Swaps right child into current location.
     * @param node
     */
    private rotateLeft(node);
    /**
     * Right rotation of node. Swaps left child into current location.
     * @param node
     */
    private rotateRight(node);
    /**
     * Diagnostic method for examining tree contents and structure
     * @param node
     */
    getValuesAsTree(node?: TreeNode<T>): any;
    /**
     * Updates a value, possibly relocating it, within binary tree
     * @param id Unique Id (such as $loki) to associate with value
     * @param val New value to be indexed within binary tree
     */
    update(id: number, val: T): void;
    /**
     * Removes a value from the binary tree index
     * @param id
     */
    remove(id: number): void;
    /**
     * Recursive node removal and rebalancer
     * @param node
     * @param val
     */
    private removeNode(node, id);
    /**
     * Utility method for updating a parent's child link when it changes
     * @param parentId
     * @param oldChildId
     * @param newChildId
     */
    private updateChildLink(parentId, oldChildId, newChildId);
    /**
     * When removing a parent with only child, this does simple remap of child to grandParent.
     * @param grandParent New parent of 'child'.
     * @param parent Node being removed.
     * @param child Node to reparent to grandParent.
     */
    private promoteChild(parent, child);
    /**
     * Finds a successor to a node and replaces that node with it.
     * @param node
     */
    private promoteSuccessor(node);
    /**
     * Utility method for finding In-Order predecessor to the provided node
     * @param node Parent node to find leaf node of greatest 'value'
    */
    private findGreaterLeaf(node);
    /**
     * Utility method for finding In-Order successor to the provided node
     * @param node Parent Node to find leaf node of least 'value'
     */
    private findLesserLeaf(node);
    /**
     *  Interface method to support ranged queries.  Results sorted by index property.
     * @param range Options for ranged request.
     */
    rangeRequest(range?: IRangedIndexRequest<T>): number[];
    /**
     * Implements ranged request operations.
     * @param node
     * @param range
     */
    private collateRequest(node, range);
    /**
     * Used on a branch node to return an array of id within that branch, sorted by their value
     * @param node
     */
    private collateIds(node);
    /**
     * Traverses tree to a node matching the provided value.
     * @param node
     * @param val
     */
    /**
     * Inline/Non-recusive 'single value' ($eq) lookup.
     * Traverses tree to a node matching the provided value.
     * @param node
     * @param val
     */
    private locate(node, val);
    /**
     * Index integrity check (IRangedIndex interface function)
     */
    validateIndex(): boolean;
    /**
     * Recursive Node validation routine
     * @param node
     */
    private validateNode(node);
}
