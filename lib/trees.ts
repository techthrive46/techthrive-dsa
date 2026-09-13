export type BSTNodeStatus =
  | "idle"
  | "comparing"
  | "inserted"
  | "found"
  | "deleted"
  | "visiting"
  | "visited"
  | "unbalanced"
  | "rotating";

export type BSTNode = {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
  status: BSTNodeStatus;
  /** Identifies the physical value token, so the UI can fly it when a delete copies it into another slot. */
  valueId: string;
};

export type BSTSnapshot = {
  nodes: BSTNode[];
  rootId: string | null;
};

export type Frame = {
  tree: BSTSnapshot;
  caption: string;
  note: string;
  line: number;
  /** Running output sequence; only meaningful for traversal operations. */
  visited: number[];
  comparisons: number;
};

export type TreeOpKey =
  | "insert"
  | "delete"
  | "inorder"
  | "preorder"
  | "postorder"
  | "avl";

export type TreeOpMeta = {
  key: TreeOpKey;
  name: string;
  time: string;
  space: string;
  blurb: string;
  pseudocode: string[];
  needsTarget: boolean;
  defaultValues: number[];
  defaultTarget?: number;
};

export const TREE_OPS: Record<TreeOpKey, TreeOpMeta> = {
  insert: {
    key: "insert",
    name: "BST Insert",
    time: "O(h)",
    space: "O(h)",
    blurb:
      "Inserting into a binary search tree walks down from the root, going left whenever the new value is smaller and right whenever it's larger, until it falls off the tree — that empty spot is exactly where the new node belongs. Because each comparison eliminates one whole subtree, the walk is only as long as the tree is tall (h), not as long as it has nodes.",
    pseudocode: [
      "insert(node, value)",
      "  if node is null: return new Node(value)",
      "  if value == node.value: return node  // duplicate",
      "  if value < node.value: node.left = insert(node.left, value)",
      "  else: node.right = insert(node.right, value)",
      "  return node",
    ],
    needsTarget: true,
    defaultValues: [50, 30, 70, 20, 40, 60, 80],
    defaultTarget: 35,
  },
  delete: {
    key: "delete",
    name: "BST Delete",
    time: "O(h)",
    space: "O(h)",
    blurb:
      "Deleting from a binary search tree has three cases. A leaf is simply removed. A node with one child is spliced out and replaced by that child. A node with two children can't just disappear without breaking the ordering, so it borrows its in-order successor — the smallest value in its right subtree — copies that value into place, then deletes the (now duplicate, easier) successor instead.",
    pseudocode: [
      "delete(node, value)",
      "  if value < node.value: node.left = delete(node.left, value)",
      "  else if value > node.value: node.right = delete(node.right, value)",
      "  else if node found:",
      "    if 0 or 1 child: splice it out, return the remaining child",
      "    else: node.value = min(node.right); node.right = delete(node.right, node.value)",
      "  return node",
    ],
    needsTarget: true,
    defaultValues: [50, 30, 70, 20, 40, 60, 80],
    defaultTarget: 70,
  },
  inorder: {
    key: "inorder",
    name: "Inorder Traversal",
    time: "O(n)",
    space: "O(h)",
    blurb:
      "Visits the left subtree, then the node itself, then the right subtree. On a binary search tree this always produces every value in sorted order — a free side effect of the BST ordering property, and the reason inorder is the traversal you reach for whenever you need sorted output.",
    pseudocode: [
      "inorder(node)",
      "  if node is null: return",
      "  inorder(node.left)",
      "  visit(node)",
      "  inorder(node.right)",
    ],
    needsTarget: false,
    defaultValues: [50, 30, 70, 20, 40, 60, 80],
  },
  preorder: {
    key: "preorder",
    name: "Preorder Traversal",
    time: "O(n)",
    space: "O(h)",
    blurb:
      "Visits the node itself first, then its left subtree, then its right subtree. Because a node is always recorded before its children, preorder is the traversal used to serialize a tree for later reconstruction, or to copy a tree structure top-down.",
    pseudocode: [
      "preorder(node)",
      "  if node is null: return",
      "  visit(node)",
      "  preorder(node.left)",
      "  preorder(node.right)",
    ],
    needsTarget: false,
    defaultValues: [50, 30, 70, 20, 40, 60, 80],
  },
  postorder: {
    key: "postorder",
    name: "Postorder Traversal",
    time: "O(n)",
    space: "O(h)",
    blurb:
      "Visits both subtrees before the node itself, so every node is recorded only after everything beneath it. That makes postorder the natural traversal for anything that must finish with the children before touching the parent — freeing memory bottom-up, or evaluating an expression tree.",
    pseudocode: [
      "postorder(node)",
      "  if node is null: return",
      "  postorder(node.left)",
      "  postorder(node.right)",
      "  visit(node)",
    ],
    needsTarget: false,
    defaultValues: [50, 30, 70, 20, 40, 60, 80],
  },
  avl: {
    key: "avl",
    name: "AVL Rotation",
    time: "O(1) per rotation",
    space: "O(1)",
    blurb:
      "A plain BST can degrade into a straight chain if values arrive in sorted order, turning every operation into O(n). An AVL tree prevents that by tracking each node's balance factor (right subtree height minus left) and, the moment it drifts past 1 or -1, restoring balance with a rotation — a constant-time pointer rearrangement that shortens the tall side without breaking the BST ordering.",
    pseudocode: [
      "balance(node) = height(node.right) - height(node.left)",
      "if |balance| > 1: node is unbalanced",
      "  (LL/RR: single rotation, LR/RL: rotate child first)",
      "  if the child leans the opposite way: rotate the child first",
      "rotateLeft/rotateRight(node): pivot takes node's place",
      "reattach pivot where node used to be",
    ],
    needsTarget: false,
    defaultValues: [10, 20, 30],
  },
};

export const TREE_OP_LIST = Object.values(TREE_OPS);

type NodesMap = Map<string, BSTNode>;

function snapshot(nodes: NodesMap, rootId: string | null): BSTSnapshot {
  return { nodes: [...nodes.values()].map((n) => ({ ...n })), rootId };
}

function heightOf(nodes: NodesMap, id: string | null): number {
  if (!id) return 0;
  const node = nodes.get(id)!;
  return 1 + Math.max(heightOf(nodes, node.left), heightOf(nodes, node.right));
}

export function buildTreeFrames(
  op: TreeOpKey,
  values: number[],
  target: number | null,
): Frame[] {
  const frames: Frame[] = [];
  const nodes: NodesMap = new Map();
  let rootId: string | null = null;
  let nextId = 0;
  let comparisons = 0;
  const visited: number[] = [];

  const push = (p: { caption: string; note: string; line: number }) => {
    frames.push({
      tree: snapshot(nodes, rootId),
      caption: p.caption,
      note: p.note,
      line: p.line,
      visited: [...visited],
      comparisons,
    });
  };

  const insertSilent = (value: number) => {
    const id = `n${nextId++}`;
    const node: BSTNode = { id, value, left: null, right: null, status: "idle", valueId: id };
    nodes.set(id, node);
    if (!rootId) {
      rootId = id;
      return;
    }
    let curId = rootId;
    while (true) {
      const cur = nodes.get(curId)!;
      if (value === cur.value) return;
      if (value < cur.value) {
        if (!cur.left) {
          cur.left = id;
          return;
        }
        curId = cur.left;
      } else {
        if (!cur.right) {
          cur.right = id;
          return;
        }
        curId = cur.right;
      }
    }
  };
  values.forEach(insertSilent);

  push({ caption: "Starting tree", note: `${values.length} values inserted`, line: 0 });

  if (op === "insert" && target !== null) {
    if (rootId === null) {
      const id = `n${nextId++}`;
      nodes.set(id, { id, value: target, left: null, right: null, status: "inserted", valueId: id });
      rootId = id;
      push({ caption: `Insert ${target}`, note: "tree was empty — becomes the root", line: 1 });
    } else {
      let curId: string | null = rootId;
      let placed = false;
      while (!placed) {
        const cur: BSTNode = nodes.get(curId!)!;
        cur.status = "comparing";
        comparisons++;
        push({
          caption: `Compare ${target} with ${cur.value}`,
          note:
            target < cur.value
              ? "smaller — go left"
              : target > cur.value
                ? "larger — go right"
                : "already in the tree",
          line: target === cur.value ? 2 : target < cur.value ? 3 : 4,
        });

        if (target === cur.value) {
          cur.status = "found";
          push({ caption: `${target} is already in the tree`, note: "no duplicate inserted", line: 2 });
          placed = true;
          break;
        }

        cur.status = "idle";
        if (target < cur.value) {
          if (!cur.left) {
            const id = `n${nextId++}`;
            nodes.set(id, { id, value: target, left: null, right: null, status: "inserted", valueId: id });
            cur.left = id;
            push({ caption: `${cur.value} has no left child`, note: `${target} becomes its left child`, line: 1 });
            placed = true;
          } else {
            curId = cur.left;
          }
        } else {
          if (!cur.right) {
            const id = `n${nextId++}`;
            nodes.set(id, { id, value: target, left: null, right: null, status: "inserted", valueId: id });
            cur.right = id;
            push({ caption: `${cur.value} has no right child`, note: `${target} becomes its right child`, line: 1 });
            placed = true;
          } else {
            curId = cur.right;
          }
        }
      }
    }
  }

  if (op === "delete" && target !== null) {
    // Walks the left spine of a subtree to find + splice out the in-order successor,
    // returning its value/token identity along with the subtree's new root — deleting
    // the old node and updating the target in the same step is what lets the UI fly
    // the value from its old slot straight into the node being deleted.
    const extractMin = (
      id: string,
    ): { value: number; valueId: string; newRoot: string | null } => {
      const cur = nodes.get(id)!;
      cur.status = "comparing";
      push({
        caption: `Looking for the smallest value, starting at ${cur.value}`,
        note: cur.left ? "has a left child — keep going left" : "no left child — this is the smallest",
        line: 5,
      });

      if (cur.left === null) {
        nodes.delete(id);
        return { value: cur.value, valueId: cur.valueId, newRoot: cur.right };
      }

      const result = extractMin(cur.left);
      cur.left = result.newRoot;
      cur.status = "idle";
      return { value: result.value, valueId: result.valueId, newRoot: id };
    };

    const del = (id: string | null, value: number): string | null => {
      if (id === null) {
        push({ caption: `${value} not found`, note: "reached an empty spot", line: 1 });
        return null;
      }
      const node = nodes.get(id)!;
      node.status = "comparing";
      comparisons++;
      push({
        caption: `Compare ${value} with ${node.value}`,
        note:
          value < node.value
            ? "smaller — go left"
            : value > node.value
              ? "larger — go right"
              : "found it",
        line: value === node.value ? 3 : value < node.value ? 1 : 2,
      });

      if (value < node.value) {
        node.status = "idle";
        node.left = del(node.left, value);
        return id;
      }
      if (value > node.value) {
        node.status = "idle";
        node.right = del(node.right, value);
        return id;
      }

      if (node.left === null) {
        node.status = "deleted";
        push({ caption: `${node.value} has no left child`, note: "replace it with its right child", line: 4 });
        const right = node.right;
        nodes.delete(id);
        return right;
      }
      if (node.right === null) {
        node.status = "deleted";
        push({ caption: `${node.value} has no right child`, note: "replace it with its left child", line: 4 });
        const left = node.left;
        nodes.delete(id);
        return left;
      }

      push({
        caption: `${node.value} has two children`,
        note: "borrow its in-order successor — the smallest value in the right subtree",
        line: 5,
      });
      const { value: successorValue, valueId: successorValueId, newRoot } = extractMin(node.right);
      node.right = newRoot;
      node.value = successorValue;
      node.valueId = successorValueId;
      node.status = "idle";
      push({ caption: `Copy ${successorValue} into this node`, note: "its old slot is spliced out below", line: 5 });
      return id;
    };

    rootId = del(rootId, target);
    push({ caption: `Deleted ${target}`, note: "tree restructured", line: 6 });
  }

  if (op === "inorder" || op === "preorder" || op === "postorder") {
    const visitLine = op === "preorder" ? 2 : op === "inorder" ? 3 : 4;
    const orderNote =
      op === "preorder"
        ? "preorder: node, then left, then right"
        : op === "inorder"
          ? "inorder: left, then node, then right"
          : "postorder: left, then right, then node";

    const traverse = (id: string | null) => {
      if (!id) return;
      const node = nodes.get(id)!;
      node.status = "visiting";
      push({ caption: `At node ${node.value}`, note: "checking it isn't null", line: 1 });

      if (op === "preorder") {
        node.status = "visited";
        visited.push(node.value);
        push({ caption: `Visit ${node.value}`, note: orderNote, line: visitLine });
      }

      traverse(node.left);

      if (op === "inorder") {
        node.status = "visited";
        visited.push(node.value);
        push({ caption: `Visit ${node.value}`, note: orderNote, line: visitLine });
      }

      traverse(node.right);

      if (op === "postorder") {
        node.status = "visited";
        visited.push(node.value);
        push({ caption: `Visit ${node.value}`, note: orderNote, line: visitLine });
      }
    };
    traverse(rootId);
    push({ caption: "Traversal complete", note: `[${visited.join(", ")}]`, line: 0 });
  }

  if (op === "avl") {
    const findUnbalanced = (id: string | null): string | null => {
      if (!id) return null;
      const node = nodes.get(id)!;
      const left = findUnbalanced(node.left);
      if (left) return left;
      const right = findUnbalanced(node.right);
      if (right) return right;
      const bf = heightOf(nodes, node.right) - heightOf(nodes, node.left);
      return Math.abs(bf) > 1 ? id : null;
    };

    const rotateLeft = (id: string): string => {
      const node = nodes.get(id)!;
      const pivotId = node.right!;
      const pivot = nodes.get(pivotId)!;
      node.right = pivot.left;
      pivot.left = id;
      return pivotId;
    };
    const rotateRight = (id: string): string => {
      const node = nodes.get(id)!;
      const pivotId = node.left!;
      const pivot = nodes.get(pivotId)!;
      node.left = pivot.right;
      pivot.right = id;
      return pivotId;
    };
    const replaceInParent = (oldId: string, newId: string) => {
      if (rootId === oldId) {
        rootId = newId;
        return;
      }
      for (const n of nodes.values()) {
        if (n.left === oldId) n.left = newId;
        if (n.right === oldId) n.right = newId;
      }
    };

    const unbalancedId = findUnbalanced(rootId);
    if (!unbalancedId) {
      push({
        caption: "Tree is already height-balanced",
        note: "no rotation needed — try values like 10, 20, 30",
        line: 0,
      });
    } else {
      const node = nodes.get(unbalancedId)!;
      node.status = "unbalanced";
      const bf = heightOf(nodes, node.right) - heightOf(nodes, node.left);
      push({
        caption: `Node ${node.value} is unbalanced (balance factor ${bf})`,
        note: bf > 1 ? "right-heavy" : "left-heavy",
        line: 1,
      });

      if (bf > 1) {
        const rightChild = nodes.get(node.right!)!;
        const rightBf = heightOf(nodes, rightChild.right) - heightOf(nodes, rightChild.left);
        if (rightBf < 0) {
          push({
            caption: `${rightChild.value} is left-heavy — rotate it right first`,
            note: "RL case needs two rotations",
            line: 3,
          });
          node.right = rotateRight(node.right!);
        }
        const pivot = nodes.get(node.right!)!;
        node.status = "rotating";
        pivot.status = "rotating";
        push({
          caption: `Rotate left at ${node.value}`,
          note: `${pivot.value} becomes the new subtree root`,
          line: 4,
        });
        const newSubRoot = rotateLeft(unbalancedId);
        replaceInParent(unbalancedId, newSubRoot);
        node.status = "idle";
        nodes.get(newSubRoot)!.status = "idle";
        push({ caption: "Rotation complete", note: "tree is balanced again", line: 5 });
      } else {
        const leftChild = nodes.get(node.left!)!;
        const leftBf = heightOf(nodes, leftChild.right) - heightOf(nodes, leftChild.left);
        if (leftBf > 0) {
          push({
            caption: `${leftChild.value} is right-heavy — rotate it left first`,
            note: "LR case needs two rotations",
            line: 3,
          });
          node.left = rotateLeft(node.left!);
        }
        const pivot = nodes.get(node.left!)!;
        node.status = "rotating";
        pivot.status = "rotating";
        push({
          caption: `Rotate right at ${node.value}`,
          note: `${pivot.value} becomes the new subtree root`,
          line: 4,
        });
        const newSubRoot = rotateRight(unbalancedId);
        replaceInParent(unbalancedId, newSubRoot);
        node.status = "idle";
        nodes.get(newSubRoot)!.status = "idle";
        push({ caption: "Rotation complete", note: "tree is balanced again", line: 5 });
      }
    }
  }

  return frames;
}
