import type { TreeOpKey } from "@/lib/trees";
import type { CodeSet } from "@/lib/code/types";

const CPP_NODE = `
 |struct Node {
 |  int value;
 |  Node *left = nullptr, *right = nullptr;
 |  Node(int v) : value(v) {}
 |};
 |`;

const JAVA_NODE = `
 |static class Node {
 |  int value;
 |  Node left, right;
 |  Node(int v) { value = v; }
 |}
 |`;

const PY_NODE = `
 |class Node:
 |    def __init__(self, value):
 |        self.value = value
 |        self.left = self.right = None
 |`;

/** Traversal snippets reuse the BST Node above; generated so the three stay in sync. */
function traversal(name: string, order: ("left" | "visit" | "right")[]): CodeSet {
  // Pseudocode: 0 signature, 1 null check, 2..4 the three steps in order.
  const cppStep = {
    left: `${name}(node->left, out);`,
    visit: "out.push_back(node->value);  // visit",
    right: `${name}(node->right, out);`,
  };
  const javaStep = {
    left: `${name}(node.left, out);`,
    visit: "out.add(node.value);  // visit",
    right: `${name}(node.right, out);`,
  };
  const pyStep = {
    left: `${name}(node.left, out)`,
    visit: "out.append(node.value)  # visit",
    right: `${name}(node.right, out)`,
  };
  const steps = (table: Record<string, string>, indent: string) =>
    order.map((s, i) => `${i + 2}|${indent}${table[s]}`).join("\n");

  return {
    cpp: `
0|void ${name}(Node* node, vector<int>& out) {
1|  if (!node) return;
${steps(cppStep, "  ")}
 |}`,
    java: `
0|static void ${name}(Node node, List<Integer> out) {
1|  if (node == null) return;
${steps(javaStep, "  ")}
 |}`,
    python: `
0|def ${name}(node, out):
1|    if node is None:
1|        return
${steps(pyStep, "    ")}`,
  };
}

export const TREES_CODE: Record<TreeOpKey, CodeSet> = {
  insert: {
    cpp: `${CPP_NODE}
0|Node* insert(Node* node, int value) {
1|  if (!node) return new Node(value);
2|  if (value == node->value) return node;  // duplicate
3|  if (value < node->value) node->left = insert(node->left, value);
4|  else node->right = insert(node->right, value);
5|  return node;
 |}`,
    java: `${JAVA_NODE}
0|static Node insert(Node node, int value) {
1|  if (node == null) return new Node(value);
2|  if (value == node.value) return node;  // duplicate
3|  if (value < node.value) node.left = insert(node.left, value);
4|  else node.right = insert(node.right, value);
5|  return node;
 |}`,
    python: `${PY_NODE}
0|def insert(node, value):
1|    if node is None:
1|        return Node(value)
2|    if value == node.value:  # duplicate
2|        return node
3|    if value < node.value:
3|        node.left = insert(node.left, value)
4|    else:
4|        node.right = insert(node.right, value)
5|    return node`,
  },

  delete: {
    cpp: `
 |// "delete" is a C++ keyword, so the function is called remove
0|Node* remove(Node* node, int value) {
0|  if (!node) return nullptr;
1|  if (value < node->value) node->left = remove(node->left, value);
2|  else if (value > node->value) node->right = remove(node->right, value);
3|  else {
4|    if (!node->left || !node->right) {
4|      Node* child = node->left ? node->left : node->right;
4|      delete node;
4|      return child;
 |    }
5|    Node* succ = node->right;           // in-order successor
5|    while (succ->left) succ = succ->left;
5|    node->value = succ->value;
5|    node->right = remove(node->right, node->value);
 |  }
6|  return node;
 |}`,
    java: `
0|static Node delete(Node node, int value) {
0|  if (node == null) return null;
1|  if (value < node.value) node.left = delete(node.left, value);
2|  else if (value > node.value) node.right = delete(node.right, value);
3|  else {
4|    if (node.left == null) return node.right;
4|    if (node.right == null) return node.left;
5|    Node succ = node.right;             // in-order successor
5|    while (succ.left != null) succ = succ.left;
5|    node.value = succ.value;
5|    node.right = delete(node.right, node.value);
 |  }
6|  return node;
 |}`,
    python: `
0|def delete(node, value):
0|    if node is None:
0|        return None
1|    if value < node.value:
1|        node.left = delete(node.left, value)
2|    elif value > node.value:
2|        node.right = delete(node.right, value)
3|    else:
4|        if node.left is None:
4|            return node.right
4|        if node.right is None:
4|            return node.left
5|        succ = node.right                # in-order successor
5|        while succ.left:
5|            succ = succ.left
5|        node.value = succ.value
5|        node.right = delete(node.right, node.value)
6|    return node`,
  },

  inorder: traversal("inorder", ["left", "visit", "right"]),
  preorder: traversal("preorder", ["visit", "left", "right"]),
  postorder: traversal("postorder", ["left", "right", "visit"]),

  avl: {
    cpp: `
 |struct Node {
 |  int value, height = 1;
 |  Node *left = nullptr, *right = nullptr;
 |};
 |
 |int height(Node* n) { return n ? n->height : 0; }
 |void update(Node* n) { n->height = 1 + max(height(n->left), height(n->right)); }
 |
4|Node* rotateRight(Node* node) {
4|  Node* pivot = node->left;
4|  node->left = pivot->right;
4|  pivot->right = node;
4|  update(node); update(pivot);
4|  return pivot;
4|}
 |
4|Node* rotateLeft(Node* node) {
4|  Node* pivot = node->right;
4|  node->right = pivot->left;
4|  pivot->left = node;
4|  update(node); update(pivot);
4|  return pivot;
4|}
 |
 |// The caller stores the returned node where \`node\` used to be.
 |Node* rebalance(Node* node) {
 |  update(node);
0|  int balance = height(node->right) - height(node->left);
1|  if (balance < -1) {                     // left-heavy
2|    // LL: one right rotation. LR: rotate the child left first.
3|    if (height(node->left->right) > height(node->left->left))
3|      node->left = rotateLeft(node->left);
4,5|    return rotateRight(node);
 |  }
1|  if (balance > 1) {                      // right-heavy
2|    // RR: one left rotation. RL: rotate the child right first.
3|    if (height(node->right->left) > height(node->right->right))
3|      node->right = rotateRight(node->right);
4,5|    return rotateLeft(node);
 |  }
 |  return node;
 |}`,
    java: `
 |static class Node {
 |  int value, height = 1;
 |  Node left, right;
 |}
 |
 |static int height(Node n) { return n == null ? 0 : n.height; }
 |static void update(Node n) { n.height = 1 + Math.max(height(n.left), height(n.right)); }
 |
4|static Node rotateRight(Node node) {
4|  Node pivot = node.left;
4|  node.left = pivot.right;
4|  pivot.right = node;
4|  update(node); update(pivot);
4|  return pivot;
4|}
 |
4|static Node rotateLeft(Node node) {
4|  Node pivot = node.right;
4|  node.right = pivot.left;
4|  pivot.left = node;
4|  update(node); update(pivot);
4|  return pivot;
4|}
 |
 |// The caller stores the returned node where \`node\` used to be.
 |static Node rebalance(Node node) {
 |  update(node);
0|  int balance = height(node.right) - height(node.left);
1|  if (balance < -1) {                     // left-heavy
2|    // LL: one right rotation. LR: rotate the child left first.
3|    if (height(node.left.right) > height(node.left.left))
3|      node.left = rotateLeft(node.left);
4,5|    return rotateRight(node);
 |  }
1|  if (balance > 1) {                      // right-heavy
2|    // RR: one left rotation. RL: rotate the child right first.
3|    if (height(node.right.left) > height(node.right.right))
3|      node.right = rotateRight(node.right);
4,5|    return rotateLeft(node);
 |  }
 |  return node;
 |}`,
    python: `
 |class Node:
 |    def __init__(self, value):
 |        self.value = value
 |        self.height = 1
 |        self.left = self.right = None
 |
 |def height(n):
 |    return n.height if n else 0
 |
 |def update(n):
 |    n.height = 1 + max(height(n.left), height(n.right))
 |
4|def rotate_right(node):
4|    pivot = node.left
4|    node.left = pivot.right
4|    pivot.right = node
4|    update(node)
4|    update(pivot)
4|    return pivot
 |
4|def rotate_left(node):
4|    pivot = node.right
4|    node.right = pivot.left
4|    pivot.left = node
4|    update(node)
4|    update(pivot)
4|    return pivot
 |
 |# The caller stores the returned node where \`node\` used to be.
 |def rebalance(node):
 |    update(node)
0|    balance = height(node.right) - height(node.left)
1|    if balance < -1:                     # left-heavy
2|        # LL: one right rotation. LR: rotate the child left first.
3|        if height(node.left.right) > height(node.left.left):
3|            node.left = rotate_left(node.left)
4,5|        return rotate_right(node)
1|    if balance > 1:                      # right-heavy
2|        # RR: one left rotation. RL: rotate the child right first.
3|        if height(node.right.left) > height(node.right.right):
3|            node.right = rotate_right(node.right)
4,5|        return rotate_left(node)
 |    return node`,
  },
};
