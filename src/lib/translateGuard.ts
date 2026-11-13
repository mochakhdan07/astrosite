/**
 * Browser translators (Google Translate in Chrome, the translate option in
 * WhatsApp/Instagram in-app browsers) wrap page text in their own <font>
 * elements. When React later swaps a label – for example the globe's
 * "Auto-rotate" / "Stop rotation" button – it tries to remove a text node that
 * the translator has already moved, throws, and the whole page unmounts into a
 * black screen. These guards make those DOM calls tolerant so the page keeps
 * working while translated.
 */
export function installTranslateGuard() {
  if (typeof Node !== 'function' || !Node.prototype) return;
  const proto = Node.prototype as Node & { __translateGuard?: boolean };
  if (proto.__translateGuard) return;
  proto.__translateGuard = true;

  const originalRemoveChild = proto.removeChild;
  proto.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      // Already moved by the translator: remove it from wherever it is now.
      if (child.parentNode) child.parentNode.removeChild(child);
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = proto.insertBefore;
  proto.insertBefore = function <T extends Node>(this: Node, node: T, reference: Node | null): T {
    if (reference && reference.parentNode !== this) {
      return this.appendChild(node) as T;
    }
    return originalInsertBefore.call(this, node, reference) as T;
  };
}
