/**
 * The Methods skill taxonomy: seven home categories in canonical order, each with groups, each group
 * with leaves. Taxonomy as code: leaf ids are `category.group.leaf` and the id types are derived
 * from this tree, so an unknown id at an authored site is a compile error. Versioned so a General
 * or Specialist taxonomy (or an editable one) can sit beside it later.
 *
 * Every skill has one home here (ticket 209). "New skills" is not a place in the tree: it is a
 * column a set lists skills into (`Assignment.newSkills`), and on that set a listed skill's evidence
 * rolls up under New skills instead of its home (`lib/hierarchy.ts`). See DECISION_LOG.md, 2026-09-13
 * (New skills per set).
 */
export const TAXONOMY_VERSION = "methods-2";

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
          discriminant: leaf("The discriminant", "discriminant", "b² − 4ac and what its sign says about the roots."),
        },
      },
      "expand-factor": {
        name: "Expanding & factorising",
        short: "Expand & factor",
        leaves: {
          expand: leaf("Distributive expansion", "expansion", "Expanding (x + a)(x + b) and collecting terms; expanding back to check."),
          monic: leaf("Monic factorisation", "monic factorising", "Factorising x² + bx + c by finding the pair."),
          nonmonic: leaf("Non-monic factorisation", "non-monic factorising", "Factorising ax² + bx + c with a ≠ 1: the split, grouping, or a checked pair."),
          binomial: leaf("Binomial expansion identity", "binomial identity", "(a + b)², (a − b)² and (a + b)(a − b), used as identities: perfect squares and the difference of two squares."),
        },
      },
      number: {
        name: "Number & fractions",
        short: "Number",
        leaves: {
          fractions: leaf("Fractions", "fractions","Clearing denominators, fractional coefficients, exact fractional answers."),
          indices: leaf("Index laws", "indices", "Multiplying, dividing and raising powers."),
          surds: leaf("Surds", "surds", "Simplifying and leaving roots exact."),
          "exp-log": leaf("Exponential & log laws", "exp & log laws", "Index and logarithm laws as identities."),
        },
      },
      sequences: {
        name: "Sequences & series",
        short: "Sequences",
        leaves: {
          series: leaf("Arithmetic & geometric series", "series", "Terms and sums of the two standard sequences."),
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
          nfl: leaf("Null factor law", "null factor law", "If a product is zero, a factor is zero; and only when the product is zero."),
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
          sampling: leaf("Sampling", "sampling", "Sample proportions and their spread."),
        },
      },
      probability: {
        name: "Probability",
        short: "Probability",
        leaves: {
          basic: leaf("Basic probability", "basic probability", "Outcomes, events and simple rules."),
          normal: leaf("Normal distribution", "normal distribution", "Standardising and reading probabilities."),
        },
      },
    },
  },
  calculus: {
    name: "Calculus",
    short: "Calculus",
    groups: {
      differentiation: {
        name: "Differentiation rules",
        short: "Rules",
        leaves: {
          chain: leaf("Chain rule", "chain rule", "Differentiating a composite function."),
          product: leaf("Product rule", "product rule", "Differentiating a product."),
          quotient: leaf("Quotient rule", "quotient rule", "Differentiating a quotient."),
        },
      },
    },
  },
} as const satisfies Record<string, CategoryDef>;

type Tx = typeof TAXONOMY;
/** A category that is a skill's home: one of the taxonomy's own. */
export type HomeCategoryId = keyof Tx;
/**
 * The New skills column (ticket 209): no groups and no leaves of its own. A set lists the skills that
 * are new on it and their evidence rolls up here instead of under their home.
 */
export const NEW_SKILLS = "new";
export type CategoryId = HomeCategoryId | typeof NEW_SKILLS;
type GroupsOf<C extends HomeCategoryId> = keyof Tx[C]["groups"] & string;
export type GroupId = { [C in HomeCategoryId]: `${C}.${GroupsOf<C>}` }[HomeCategoryId];
type LeavesOf<C extends HomeCategoryId, G extends GroupsOf<C>> = Tx[C]["groups"][G] extends { leaves: infer L } ? keyof L & string : never;
export type LeafId = {
  [C in HomeCategoryId]: { [G in GroupsOf<C>]: `${C}.${G}.${LeavesOf<C, G>}` }[GroupsOf<C>];
}[HomeCategoryId];

/** The home categories in canonical order. */
export const HOME_CATEGORIES = Object.keys(TAXONOMY) as HomeCategoryId[];
/** Canonical column order: the homes, then New skills last. */
export const CATEGORY_ORDER: CategoryId[] = [...HOME_CATEGORIES, NEW_SKILLS];

export const ALL_GROUPS: GroupId[] = HOME_CATEGORIES.flatMap((c) => Object.keys(TAXONOMY[c].groups).map((g) => `${c}.${g}` as GroupId));
export const ALL_LEAVES: LeafId[] = ALL_GROUPS.flatMap((g) => {
  const [c, gk] = g.split(".") as [HomeCategoryId, string];
  const group = (TAXONOMY[c].groups as Record<string, GroupDef>)[gk];
  return Object.keys(group.leaves).map((l) => `${g}.${l}` as LeafId);
});
const LEAF_SET = new Set<string>(ALL_LEAVES);

export const isLeafId = (s: string): s is LeafId => LEAF_SET.has(s);
/** A leaf's or group's home category (never New skills: which column a skill shows in depends on the set, `columnOf` in `lib/hierarchy`). */
export const categoryOf = (id: LeafId | GroupId): HomeCategoryId => id.split(".")[0] as HomeCategoryId;
export const groupOf = (id: LeafId): GroupId => id.split(".").slice(0, 2).join(".") as GroupId;
export const groupsOf = (c: CategoryId): GroupId[] => ALL_GROUPS.filter((g) => categoryOf(g) === c);
export const leavesOf = (g: GroupId): LeafId[] => ALL_LEAVES.filter((l) => groupOf(l) === g);

function groupDef(g: GroupId): GroupDef {
  const [c, gk] = g.split(".") as [HomeCategoryId, string];
  return (TAXONOMY[c].groups as Record<string, GroupDef>)[gk];
}
export const categoryName = (c: CategoryId): { name: string; short: string } => (c === NEW_SKILLS ? { name: "New skills", short: "New skills" } : { name: TAXONOMY[c].name, short: TAXONOMY[c].short });
export const groupName = (g: GroupId): { name: string; short: string } => ({ name: groupDef(g).name, short: groupDef(g).short });
export function leafName(l: LeafId): LeafDef {
  const lk = l.split(".")[2];
  return groupDef(groupOf(l)).leaves[lk];
}

/**
 * Leaf ids the taxonomy has retired, and where each skill lives now (ticket 209): the Unit Focus
 * leaves moved to their one home, and special products merged into the binomial identity (the same
 * facts: perfect squares and the difference of two squares). Stored or tagged old ids resolve here.
 */
export const LEAF_ALIASES: Readonly<Record<string, LeafId>> = {
  "unit.u1.nfl": "functions.zeros.nfl",
  "unit.u1.discriminant": "algebra.equations.discriminant",
  "unit.u1.binomial": "algebra.expand-factor.binomial",
  "algebra.expand-factor.special": "algebra.expand-factor.binomial",
  "unit.u2.exp-log": "algebra.number.exp-log",
  "unit.u2.series": "algebra.sequences.series",
  "unit.u3.chain": "calculus.differentiation.chain",
  "unit.u3.product": "calculus.differentiation.product",
  "unit.u3.quotient": "calculus.differentiation.quotient",
  "unit.u4.normal": "stats.probability.normal",
  "unit.u4.sampling": "stats.data.sampling",
};

const warned = new Set<string>();
/** A current id as it is, a retired one as its new id (`LEAF_ALIASES`); an unknown id is dropped with one logged warning, never silently and never fatally. */
export function resolveLeaf(s: string): LeafId | null {
  if (isLeafId(s)) return s;
  if (LEAF_ALIASES[s]) return LEAF_ALIASES[s];
  if (!warned.has(s)) {
    warned.add(s);
    console.warn(`[taxonomy ${TAXONOMY_VERSION}] unknown leaf id dropped: ${s}`);
  }
  return null;
}

/**
 * Categories shown with two layers instead of three: their skills hang straight off the category
 * and the group level is not drawn. New skills is the one: the set's named skills are the things to scan.
 */
export const isFlat = (c: CategoryId): boolean => c === NEW_SKILLS;

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

/** The plain word for a group in a sentence to the student ("This is your second mistake on factorising."). */
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
};
export const groupWord = (g: GroupId): string => GROUP_WORDS[g] ?? groupName(g).short.toLowerCase();
