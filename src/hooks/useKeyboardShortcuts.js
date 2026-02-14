import { useEffect } from "react";

/**
 * useKeyboardShortcuts
 * 
 * Centralized keyboard shortcut handler.
 * All shortcuts use Alt+Key to avoid conflicts.
 * 
 * @param {Object} actions - Map of action callbacks
 * @param {Function} actions.navigateCheckout - Alt+1
 * @param {Function} actions.navigateInventory - Alt+2
 * @param {Function} actions.navigateAnalytics - Alt+3
 * @param {Function} actions.focusSearch - Alt+S
 * @param {Function} actions.focusBarcode - Alt+B
 * @param {Function} actions.newCart - Alt+N
 * @param {Function} actions.deleteCart - Alt+W
 * @param {Function} actions.checkout - Alt+Enter
 * @param {Function} actions.printReceipt - Alt+P
 * @param {Function} actions.prevCart - Alt+ArrowLeft
 * @param {Function} actions.focusLatestQuantity - Alt+Q
 * @param {Function} actions.focusPrevItem - Alt+ArrowUp
 * @param {Function} actions.focusNextItem - Alt+ArrowDown
 * @param {Function} actions.cycleDiscount - Alt+D
 * @param {Function} actions.toggleCustomDiscount - Alt+C
 */
export default function useKeyboardShortcuts(actions = {}) {
    useEffect(() => {
        const handler = (e) => {
            // Only handle Alt+Key combos
            if (!e.altKey) return;

            // Don't fire if user is typing inside a modal's input/textarea
            const tag = document.activeElement?.tagName;
            const isTyping = tag === "INPUT" || tag === "TEXTAREA";

            let matched = false;

            switch (e.key) {
                // Navigation
                case "1":
                    if (actions.navigateCheckout) { actions.navigateCheckout(); matched = true; }
                    break;
                case "2":
                    if (actions.navigateInventory) { actions.navigateInventory(); matched = true; }
                    break;
                case "3":
                    if (actions.navigateAnalytics) { actions.navigateAnalytics(); matched = true; }
                    break;

                // Focus (these SHOULD work even when typing, to switch fields)
                case "s":
                case "S":
                    if (actions.focusSearch) { actions.focusSearch(); matched = true; }
                    break;
                case "b":
                case "B":
                    if (actions.focusBarcode) { actions.focusBarcode(); matched = true; }
                    break;
                case "q":
                case "Q":
                    if (actions.focusLatestQuantity) { actions.focusLatestQuantity(); matched = true; }
                    break;
                case "ArrowUp":
                    if (actions.focusPrevItem) { actions.focusPrevItem(); matched = true; }
                    break;
                case "ArrowDown":
                    if (actions.focusNextItem) { actions.focusNextItem(); matched = true; }
                    break;
                case "d":
                case "D":
                    if (actions.cycleDiscount) { actions.cycleDiscount(); matched = true; }
                    break;
                case "c":
                case "C":
                    if (actions.toggleCustomDiscount) { actions.toggleCustomDiscount(); matched = true; }
                    break;

                // Cart operations (skip if typing in an input)
                case "n":
                case "N":
                    // if (!isTyping && actions.newCart) { actions.newCart(); matched = true; }
                    if (actions.newCart) { actions.newCart(); matched = true; }
                    break;
                case "w":
                case "W":
                    // if (!isTyping && actions.deleteCart) { actions.deleteCart(); matched = true; }
                    if (actions.deleteCart) { actions.deleteCart(); matched = true; }
                    break;

                // Checkout
                case "Enter":
                    if (actions.checkout) { actions.checkout(); matched = true; }
                    break;

                // Print
                case "p":
                case "P":
                    if (actions.printReceipt) { actions.printReceipt(); matched = true; }
                    break;

                // Cart tab switching
                case "ArrowLeft":
                    if (actions.prevCart) { actions.prevCart(); matched = true; }
                    break;
                case "ArrowRight":
                    if (actions.nextCart) { actions.nextCart(); matched = true; }
                    break;

                default:
                    break;
            }

            if (matched) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [actions]);
}
