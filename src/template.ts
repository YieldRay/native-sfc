import { effect, signal, computed, effectScope } from "./signals.ts";

// TODO
function example() {
  const div = Object.assign(document.createElement("div"), {
    innerHTML: `
    <span .text-content="count()"></span>
    <button @click="setCount(count() + 1)">Increment</button>
    `,
  });
  document.body.appendChild(div);

  reactiveNodes(div.childNodes, () => {
    const [count, setCount] = signal(0);
    return { count, setCount };
  });
}

function toCamelCase(str: string): string {
  // since we use real DOM attributes, we need to convert kebab-case to camelCase
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function reactiveNodes(
  nodes: NodeListOf<ChildNode> | ChildNode[],
  contextProvider: () => Record<string, any>,
) {
  const context = contextProvider();

  const evalExpr = (expr: string, additionalContext?: Record<string, any>) => {
    const ctx = { ...context, ...additionalContext };
    const keys = Object.keys(ctx);
    const values = Object.values(ctx);
    const func = new Function(...keys, `return ${expr.trimStart()}`);
    return func(...values);
  };

  return effectScope(() => {
    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement; // note: this may also be a custom element
        for (const attr of Array.from(element.attributes)) {
          if (attr.name.startsWith(".")) {
            const propName = toCamelCase(attr.name.slice(1));
            const expr = attr.value;
            effect(() => {
              const value = evalExpr(expr);
              Reflect.set(element, propName, value);
            });
            element.removeAttribute(attr.name);
          } else if (attr.name.startsWith(":")) {
            // no need to convert to camelCase since DOM attributes are always in lowercase
            const attrName = attr.name.slice(1);
            const expr = attr.value;
            effect(() => {
              const value = evalExpr(expr);
              element.setAttribute(attrName, value);
            });
            element.removeAttribute(attr.name);
          } else if (attr.name.startsWith("@")) {
            // no need to convert to camelCase since DOM events are always in lowercase
            const eventName = attr.name.slice(1);
            const expr = attr.value;
            const listener = computed(() => (event: Event) => {
              evalExpr(expr, { event });
            })();
            element.addEventListener(eventName, listener);
            element.removeAttribute(attr.name);
          }
        }
      }
    }
  });
}
