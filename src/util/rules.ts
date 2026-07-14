/**
 * Dynamic-form rule engine: condition evaluation + safe formula computation.
 *
 * Used by FormGenerator to power reactive behaviour (visibleWhen / disabledWhen /
 * requiredWhen) and computed (formula) fields. Pure and dependency-free so it is
 * trivially testable and safe to run on every render.
 */

export type Operator =
    | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
    | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith'
    | 'empty' | 'notEmpty' | 'truthy' | 'falsy';

export interface Condition {
    /** Field id whose current value is tested. */
    field: string;
    /** Comparison operator. Defaults to 'eq' when `value` is given, else 'truthy'. */
    op?: Operator;
    /** Value (or array, for in/nin) to compare against. */
    value?: any;
}

export interface ConditionGroup {
    /** All must be true (AND). */
    all?: RuleExpr[];
    /** Any may be true (OR). */
    any?: RuleExpr[];
    /** None may be true (NOR). */
    none?: RuleExpr[];
}

export type RuleExpr = Condition | ConditionGroup;

const isEmptyValue = (v: any): boolean =>
    v == null ||
    v === '' ||
    (Array.isArray(v) && v.length === 0) ||
    (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

const asNumber = (v: any): number => {
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : NaN;
};

const compare = (actual: any, op: Operator, expected: any): boolean => {
    switch (op) {
        case 'eq': return actual === expected || String(actual) === String(expected);
        case 'neq': return !(actual === expected || String(actual) === String(expected));
        case 'gt': return asNumber(actual) > asNumber(expected);
        case 'gte': return asNumber(actual) >= asNumber(expected);
        case 'lt': return asNumber(actual) < asNumber(expected);
        case 'lte': return asNumber(actual) <= asNumber(expected);
        case 'in': return Array.isArray(expected) && expected.map(String).includes(String(actual));
        case 'nin': return Array.isArray(expected) && !expected.map(String).includes(String(actual));
        case 'contains':
            if (Array.isArray(actual)) return actual.map(String).includes(String(expected));
            return String(actual ?? '').includes(String(expected));
        case 'startsWith': return String(actual ?? '').startsWith(String(expected));
        case 'endsWith': return String(actual ?? '').endsWith(String(expected));
        case 'empty': return isEmptyValue(actual);
        case 'notEmpty': return !isEmptyValue(actual);
        case 'truthy': return !!actual && !isEmptyValue(actual);
        case 'falsy': return !actual || isEmptyValue(actual);
        default: return false;
    }
};

const isGroup = (expr: RuleExpr): expr is ConditionGroup =>
    !!expr && (Array.isArray((expr as ConditionGroup).all) ||
        Array.isArray((expr as ConditionGroup).any) ||
        Array.isArray((expr as ConditionGroup).none));

/** Evaluate a condition or nested AND/OR/NOR group against a values map. */
export function evaluateRule(expr: RuleExpr | undefined, values: Record<string, any>): boolean {
    if (!expr) return true;

    if (isGroup(expr)) {
        const { all, any, none } = expr;
        const allOk = all ? all.every((e) => evaluateRule(e, values)) : true;
        const anyOk = any ? any.some((e) => evaluateRule(e, values)) : true;
        const noneOk = none ? !none.some((e) => evaluateRule(e, values)) : true;
        return allOk && anyOk && noneOk;
    }

    const cond = expr as Condition;
    if (!cond.field) return true;
    const actual = values[cond.field];
    const op: Operator = cond.op ?? (cond.value !== undefined ? 'eq' : 'truthy');
    return compare(actual, op, cond.value);
}

// --- Safe formula evaluator (arithmetic + a few functions, no eval) ---

type Token = { t: 'num' | 'id' | 'op' | 'lp' | 'rp' | 'comma'; v: string };

const FUNCS: Record<string, (args: number[]) => number> = {
    SUM: (a) => a.reduce((s, n) => s + n, 0),
    AVG: (a) => (a.length ? a.reduce((s, n) => s + n, 0) / a.length : 0),
    MIN: (a) => (a.length ? Math.min(...a) : 0),
    MAX: (a) => (a.length ? Math.max(...a) : 0),
    ROUND: (a) => {
        const [x, n = 0] = a;
        const f = 10 ** n;
        return Math.round((x || 0) * f) / f;
    },
    ABS: (a) => Math.abs(a[0] || 0),
    FLOOR: (a) => Math.floor(a[0] || 0),
    CEIL: (a) => Math.ceil(a[0] || 0),
};

const tokenize = (input: string): Token[] => {
    const tokens: Token[] = [];
    let i = 0;
    while (i < input.length) {
        const c = input[i];
        if (c === ' ' || c === '\t' || c === '\n') { i += 1; continue; }
        if (c >= '0' && c <= '9') {
            let num = '';
            while (i < input.length && /[0-9.]/.test(input[i])) { num += input[i]; i += 1; }
            tokens.push({ t: 'num', v: num });
            continue;
        }
        if (/[A-Za-z_]/.test(c)) {
            let id = '';
            while (i < input.length && /[A-Za-z0-9_.]/.test(input[i])) { id += input[i]; i += 1; }
            tokens.push({ t: 'id', v: id });
            continue;
        }
        if ('+-*/%'.includes(c)) { tokens.push({ t: 'op', v: c }); i += 1; continue; }
        if (c === '(') { tokens.push({ t: 'lp', v: c }); i += 1; continue; }
        if (c === ')') { tokens.push({ t: 'rp', v: c }); i += 1; continue; }
        if (c === ',') { tokens.push({ t: 'comma', v: c }); i += 1; continue; }
        throw new Error(`Unexpected character '${c}' in formula`);
    }
    return tokens;
};

/**
 * Compute a numeric formula string against a values map. Supports + - * / %,
 * parentheses, unary minus, field references (resolved to numbers, missing → 0),
 * and functions SUM/AVG/MIN/MAX/ROUND/ABS/FLOOR/CEIL. Returns '' on error.
 */
export function computeFormula(formula: string, values: Record<string, any>): number | '' {
    if (typeof formula !== 'string' || formula.trim() === '') return '';
    let tokens: Token[];
    try {
        tokens = tokenize(formula);
    } catch {
        return '';
    }

    let pos = 0;
    const peek = () => tokens[pos];
    const next = () => tokens[pos++];

    const resolveId = (name: string): number => {
        const raw = values[name];
        const n = asNumber(raw);
        return Number.isFinite(n) ? n : 0;
    };

    // recursive-descent: expr -> term (('+'|'-') term)*
    function parseExpr(): number {
        let left = parseTerm();
        while (peek() && peek().t === 'op' && (peek().v === '+' || peek().v === '-')) {
            const op = next().v;
            const right = parseTerm();
            left = op === '+' ? left + right : left - right;
        }
        return left;
    }
    function parseTerm(): number {
        let left = parseFactor();
        while (peek() && peek().t === 'op' && '*/%'.includes(peek().v)) {
            const op = next().v;
            const right = parseFactor();
            if (op === '*') left *= right;
            else if (op === '/') left = right === 0 ? 0 : left / right;
            else left = right === 0 ? 0 : left % right;
        }
        return left;
    }
    function parseFactor(): number {
        const tk = peek();
        if (tk && tk.t === 'op' && tk.v === '-') { next(); return -parseFactor(); }
        if (tk && tk.t === 'op' && tk.v === '+') { next(); return parseFactor(); }
        return parsePrimary();
    }
    function parsePrimary(): number {
        const tk = next();
        if (!tk) throw new Error('Unexpected end of formula');
        if (tk.t === 'num') return parseFloat(tk.v);
        if (tk.t === 'lp') {
            const val = parseExpr();
            if (!peek() || peek().t !== 'rp') throw new Error('Missing )');
            next();
            return val;
        }
        if (tk.t === 'id') {
            // function call?
            if (peek() && peek().t === 'lp') {
                next(); // consume (
                const args: number[] = [];
                if (peek() && peek().t !== 'rp') {
                    args.push(parseExpr());
                    while (peek() && peek().t === 'comma') { next(); args.push(parseExpr()); }
                }
                if (!peek() || peek().t !== 'rp') throw new Error('Missing ) in call');
                next();
                const fn = FUNCS[tk.v.toUpperCase()];
                if (!fn) throw new Error(`Unknown function ${tk.v}`);
                return fn(args);
            }
            return resolveId(tk.v);
        }
        throw new Error(`Unexpected token ${tk.v}`);
    }

    try {
        const result = parseExpr();
        if (pos !== tokens.length) return '';
        return Number.isFinite(result) ? result : '';
    } catch {
        return '';
    }
}

/** Field-comparison validators (evaluated at the form level where sibling values exist). */
export const CROSS_FIELD_VALIDATORS: Record<string, (a: string, b: string) => boolean> = {
    equalsField: (a, b) => a === b,
    notEqualsField: (a, b) => a !== b,
    gtField: (a, b) => asNumber(a) > asNumber(b),
    gteField: (a, b) => asNumber(a) >= asNumber(b),
    ltField: (a, b) => asNumber(a) < asNumber(b),
    lteField: (a, b) => asNumber(a) <= asNumber(b),
};
