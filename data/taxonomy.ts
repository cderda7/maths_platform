/**
 * The Methods skill taxonomy: seven categories in canonical order, each with groups, each group
 * with leaves. Taxonomy as code: leaf ids are `category.group.leaf` and the id types are derived
 * from this tree, so an unknown id at an authored site is a compile error. Versioned so a General
 * or Specialist taxonomy (or an editable one) can sit beside it later.
 */
export const TAXONOMY_VERSION = "methods-1";

type LeafDef = { name: string; short: string; description: string };
type GroupDef = { name: string; short: string; leaves: Record<string, LeafDef> };
type CategoryDef = { name: string; short: string; groups: Record<string, GroupDef> };

const leaf = (name: string, short: string, description: string): LeafDef => ({ name, short, description });

export const TAXONOMY = {
  algebra: {
    name: "Algebra",
    short: "Algebra",
    groups: {
      equations: {
        name: "Equations",
        short: "Equations",
        leaves: {
          linear: leaf("Linear equations", "linear equations", "Rearranging, collecting like terms, solving a linear equation in one step or two."),
          quadratic: leaf("Quadratic equations", "quadratic equations", "Recognising ax² + bx + c = 0, choosing a method, reading roots off factors or the formula."),
          simultaneous: leaf("Simultaneous equations", "simultaneous equations", "Substitution or elimination across two equations."),
        },
      },
      "expand-factor": {
        name: "Expanding & factorising",
        short: "Expand & factor",
        leaves: {
          expand: leaf("Distributive expansion", "expansion", "Expanding (x + a)(x + b) and collecting terms; expanding back to check."),
          monic: leaf("Monic trinomials", "monic factorising", "Factorising x² + bx + c by finding the pair."),
          nonmonic: leaf("Non-monic factorisation", "non-monic factorising", "Factorising ax² + bx + c with a ≠ 1: the split, grouping, or a checked pair."),
          special: leaf("Special products", "special products", "Difference of two squares and perfect squares."),
        },
      },
      number: {
        name: "Number & fractions",
        short: "Number",
        leaves: {
          fractions: leaf("Fractions", "fractions","Clearing denominators, fractional coefficients, exact fractional answers."),
          indices: leaf("Index laws", "indices", "Multiplying, dividing and raising powers."),
          surds: leaf("Surds", "surds", "Simplifying and leaving roots exact."),
        },
      },
    },
  },
  functions: {
    name: "Functions",
    short: "Functions",
    groups: {
      notation: {
        name: "Function notation",
        short: "Notation",
        leaves: {
          evaluate: leaf("Evaluating a function", "evaluating", "Substituting into f(x) and simplifying."),
          "domain-range": leaf("Domain & range", "domain & range", "Stating the inputs a function accepts and the outputs it produces."),
        },
      },
      zeros: {
        name: "Zeros & solving",
        short: "Zeros",
        leaves: {
          "zero-finding": leaf("Zero-finding", "zero-finding", "Finding where a function is zero, and knowing that is where its graph meets the x-axis."),
          "function-graph": leaf("Between function and graph", "function ↔ graph", "Moving between a rule and the shape it draws."),
        },
      },
    },
  },
  graphing: {
    name: "Graphing",
    short: "Graphing",
    groups: {
      quadratics: {
        name: "Quadratic graphs",
        short: "Parabolas",
        leaves: {
          sketch: leaf("Sketching a parabola", "sketching parabolas", "The shape of a parabola from its rule: direction, intercepts, turning point."),
          features: leaf("Reading graph features", "graph features", "Intercepts, axis of symmetry and turning point, read or computed."),
          transformations: leaf("Transformations", "transformations", "Shifts, stretches and reflections of a parent graph."),
        },
      },
      lines: {
        name: "Linear graphs",
        short: "Lines",
        leaves: {
          gradient: leaf("Gradient", "gradient", "Rise over run, and what the sign says."),
          intercepts: leaf("Intercepts of a line", "line intercepts", "Where a line crosses each axis."),
        },
      },
    },
  },
  communication: {
    name: "Communication",
    short: "Communication",
    groups: {
      process: {
        name: "Process & rigor",
        short: "Process",
        leaves: {
          working: leaf("Showing complete working", "complete working", "Each step follows from the last in a way a reader can check; no line skips a step."),
          notation: leaf("Correct notation", "correct notation", "Equals signs, brackets and symbols used as they mean."),
        },
      },
    },
  },
  reasoning: {
    name: "Reasoning",
    short: "Reasoning",
    groups: {
      justify: {
        name: "Reasoning & justification",
        short: "Justify",
        leaves: {
          formal: leaf("Formal justification", "formal justification", "A show / prove / justify step that follows logically from what is known."),
          conclusions: leaf("Drawing conclusions in context", "conclusions in context", "Saying what a result means for the situation or the graph."),
        },
      },
      interpret: {
        name: "Interpretation & translation",
        short: "Interpret",
        leaves: {
          worded: leaf("Interpreting worded problems", "worded problems", "Turning a description into an equation or a question about a graph."),
          translate: leaf("Translating between representations", "representations", "Table, rule, graph and words for the same relationship."),
        },
      },
    },
  },
  stats: {
    name: "Statistics",
    short: "Stats",
    groups: {
      data: {
        name: "Data & distributions",
        short: "Data",
        leaves: {
          summary: leaf("Summary statistics", "summary statistics", "Mean, median, spread."),
          distributions: leaf("Distributions", "distributions", "Shape, centre and spread of a distribution."),
        },
      },
      probability: {
        name: "Probability",
        short: "Probability",
        leaves: {
          basic: leaf("Basic probability", "basic probability", "Outcomes, events and simple rules."),
        },
      },
    },
  },
  unit: {
    name: "Unit Focus",
    short: "New skills",
    groups: {
      u1: {
        name: "Unit 1",
        short: "Unit 1",
        leaves: {
          nfl: leaf("Null factor law", "null factor law", "If a product is zero, a factor is zero; and only when the product is zero."),
          binomial: leaf("Binomial expansion identity", "binomial identity", "(a + b)² and (a + b)(a − b), used as identities."),
          discriminant: leaf("The discriminant", "discriminant", "b² − 4ac and what its sign says about the roots."),
        },
      },
      u2: {
        name: "Unit 2",
        short: "Unit 2",
        leaves: {
          "exp-log": leaf("Exponential & log laws", "exp & log laws", "Index and logarithm laws as identities."),
          series: leaf("Arithmetic & geometric series", "series", "Terms and sums of the two standard sequences."),
        },
      },
      u3: {
        name: "Unit 3",
        short: "Unit 3",
        leaves: {
          chain: leaf("Chain rule", "chain rule", "Differentiating a composite function."),
          product: leaf("Product rule", "product rule", "Differentiating a product."),
          quotient: leaf("Quotient rule", "quotient rule", "Differentiating a quotient."),
        },
      },
      u4: {
        name: "Unit 4",
        short: "Unit 4",
        leaves: {
          normal: leaf("Normal distribution", "normal distribution", "Standardising and reading probabilities."),
          sampling: leaf("Sampling", "sampling", "Sample proportions and their spread."),
        },
      },
    },
  },
} as const satisfies Record<string, CategoryDef>;

type Tx = typeof TAXONOMY;
export type CategoryId = keyof Tx;
type GroupsOf<C extends CategoryId> = keyof Tx[C]["groups"] & string;
export type GroupId = { [C in CategoryId]: `${C}.${GroupsOf<C>}` }[CategoryId];
type LeavesOf<C extends CategoryId, G extends GroupsOf<C>> = Tx[C]["groups"][G] extends { leaves: infer L } ? keyof L & string : never;
export type LeafId = {
  [C in CategoryId]: { [G in GroupsOf<C>]: `${C}.${G}.${LeavesOf<C, G>}` }[GroupsOf<C>];
}[CategoryId];

/** Canonical column order. */
export const CATEGORY_ORDER = Object.keys(TAXONOMY) as CategoryId[];

export const ALL_GROUPS: GroupId[] = CATEGORY_ORDER.flatMap((c) => Object.keys(TAXONOMY[c].groups).map((g) => `${c}.${g}` as GroupId));
export const ALL_LEAVES: LeafId[] = ALL_GROUPS.flatMap((g) => {
  const [c, gk] = g.split(".") as [CategoryId, string];
  const group = (TAXONOMY[c].groups as Record<string, GroupDef>)[gk];
  return Object.keys(group.leaves).map((l) => `${g}.${l}` as LeafId);
});
const LEAF_SET = new Set<string>(ALL_LEAVES);

export const isLeafId = (s: string): s is LeafId => LEAF_SET.has(s);
export const categoryOf = (id: LeafId | GroupId): CategoryId => id.split(".")[0] as CategoryId;
export const groupOf = (id: LeafId): GroupId => id.split(".").slice(0, 2).join(".") as GroupId;
export const groupsOf = (c: CategoryId): GroupId[] => ALL_GROUPS.filter((g) => categoryOf(g) === c);
export const leavesOf = (g: GroupId): LeafId[] => ALL_LEAVES.filter((l) => groupOf(l) === g);

function groupDef(g: GroupId): GroupDef {
  const [c, gk] = g.split(".") as [CategoryId, string];
  return (TAXONOMY[c].groups as Record<string, GroupDef>)[gk];
}
export const categoryName = (c: CategoryId): { name: string; short: string } => ({ name: TAXONOMY[c].name, short: TAXONOMY[c].short });
export const groupName = (g: GroupId): { name: string; short: string } => ({ name: groupDef(g).name, short: groupDef(g).short });
export function leafName(l: LeafId): LeafDef {
  const lk = l.split(".")[2];
  return groupDef(groupOf(l)).leaves[lk];
}

const warned = new Set<string>();
/** An unknown id is dropped with one logged warning, never silently and never fatally. */
export function resolveLeaf(s: string): LeafId | null {
  if (isLeafId(s)) return s;
  if (!warned.has(s)) {
    warned.add(s);
    console.warn(`[taxonomy ${TAXONOMY_VERSION}] unknown leaf id dropped: ${s}`);
  }
  return null;
}

/** The QCAA unit a Unit Focus leaf belongs to (1–4), or null. */
export const unitOf = (l: LeafId): 1 | 2 | 3 | 4 | null => (categoryOf(l) === "unit" ? (Number(l.split(".")[1].slice(1)) as 1 | 2 | 3 | 4) : null);

/**
 * Categories shown with two layers instead of three: their skills hang straight off the category
 * and the group level is not drawn. Unit Focus is one: the confirmed unit names the category and
 * its named facts are the things to scan.
 */
export const FLAT_CATEGORIES: readonly CategoryId[] = ["unit"];
export const isFlat = (c: CategoryId) => FLAT_CATEGORIES.includes(c);

/** The category's display name, with Unit Focus named after the assignment's confirmed unit. */
export function categoryLabel(c: CategoryId, unit: 1 | 2 | 3 | 4): { name: string; short: string } {
  return c === "unit" ? { name: `Unit ${unit}`, short: `Unit ${unit}` } : categoryName(c);
}

/**
 * How a leaf is named to the student. Stored and shown to the teacher as "monic factorising";
 * the student just sees "factorising" (non-monic keeps its qualifier, so the contrast is clear
 * when they meet it).
 */
const STUDENT_NAMES: Partial<Record<LeafId, { name: string; short: string }>> = {
  "algebra.expand-factor.monic": { name: "Factorising", short: "factorising" },
};
export function studentLeafName(l: LeafId): { name: string; short: string } {
  return STUDENT_NAMES[l] ?? leafName(l);
}

/** The plain word for a group in a sentence to the student ("this is your second mistake on factorising"). */
const GROUP_WORDS: Partial<Record<GroupId, string>> = {
  "algebra.equations": "solving equations",
  "algebra.expand-factor": "factorising",
  "algebra.number": "fractions",
  "functions.notation": "function notation",
  "functions.zeros": "finding zeros",
  "graphing.quadratics": "parabolas",
  "graphing.lines": "straight lines",
  "reasoning.justify": "justifying",
  "reasoning.interpret": "interpreting the question",
  "unit.u1": "the unit's rules",
};
export const groupWord = (g: GroupId): string => GROUP_WORDS[g] ?? groupName(g).short.toLowerCase();
