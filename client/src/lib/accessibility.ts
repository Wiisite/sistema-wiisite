/**
 * Accessibility utilities for the application
 */

/**
 * Generates a unique ID for accessibility purposes
 */
let idCounter = 0;
export function generateId(prefix = "a11y"): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Screen reader only text (visually hidden but accessible)
 */
export const srOnlyClass = "sr-only";

/**
 * Announces a message to screen readers
 */
export function announce(message: string, priority: "polite" | "assertive" = "polite"): void {
  const announcer = document.getElementById("a11y-announcer") || createAnnouncer();
  
  announcer.setAttribute("aria-live", priority);
  announcer.textContent = "";
  
  // Use setTimeout to ensure the change is detected
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
}

/**
 * Creates the announcer element if it doesn't exist
 */
function createAnnouncer(): HTMLElement {
  const announcer = document.createElement("div");
  announcer.id = "a11y-announcer";
  announcer.className = "sr-only";
  announcer.setAttribute("aria-live", "polite");
  announcer.setAttribute("aria-atomic", "true");
  document.body.appendChild(announcer);
  return announcer;
}

/**
 * Focus trap utilities for modals and dialogs
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");
  
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
}

/**
 * Traps focus within a container
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };
  
  container.addEventListener("keydown", handleKeyDown);
  firstElement?.focus();
  
  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Keyboard navigation helpers
 */
export const KeyCodes = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
} as const;

/**
 * Checks if an element is currently visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  );
}

/**
 * Gets the accessible name of an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel;
  
  // Check aria-labelledby
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent || "";
  }
  
  // Check for associated label
  if (element.id) {
    const label = document.querySelector<HTMLLabelElement>(`label[for="${element.id}"]`);
    if (label) return label.textContent || "";
  }
  
  // Check title attribute
  const title = element.getAttribute("title");
  if (title) return title;
  
  // Return text content
  return element.textContent || "";
}

/**
 * ARIA role descriptions in Portuguese
 */
export const roleDescriptions: Record<string, string> = {
  button: "botão",
  link: "link",
  checkbox: "caixa de seleção",
  radio: "botão de opção",
  textbox: "campo de texto",
  combobox: "caixa de combinação",
  listbox: "lista",
  menu: "menu",
  menuitem: "item de menu",
  tab: "aba",
  tabpanel: "painel de aba",
  dialog: "diálogo",
  alert: "alerta",
  alertdialog: "diálogo de alerta",
  progressbar: "barra de progresso",
  slider: "controle deslizante",
  spinbutton: "botão giratório",
  table: "tabela",
  grid: "grade",
  tree: "árvore",
  treegrid: "grade de árvore",
};

/**
 * Status messages in Portuguese for common actions
 */
export const statusMessages = {
  loading: "Carregando...",
  loaded: "Conteúdo carregado",
  saving: "Salvando...",
  saved: "Salvo com sucesso",
  deleting: "Excluindo...",
  deleted: "Excluído com sucesso",
  error: "Ocorreu um erro",
  success: "Operação realizada com sucesso",
  noResults: "Nenhum resultado encontrado",
  resultsFound: (count: number) => `${count} resultado${count !== 1 ? "s" : ""} encontrado${count !== 1 ? "s" : ""}`,
};

/**
 * Creates ARIA props for a loading state
 */
export function getLoadingProps(isLoading: boolean): Record<string, string | boolean> {
  return {
    "aria-busy": isLoading,
    "aria-live": "polite",
  };
}

/**
 * Creates ARIA props for an error state
 */
export function getErrorProps(hasError: boolean, errorMessage?: string): Record<string, string | boolean | undefined> {
  return {
    "aria-invalid": hasError,
    "aria-errormessage": errorMessage,
  };
}

/**
 * Creates ARIA props for a required field
 */
export function getRequiredProps(isRequired: boolean): Record<string, boolean> {
  return {
    "aria-required": isRequired,
  };
}

/**
 * Creates ARIA props for an expanded/collapsed state
 */
export function getExpandedProps(isExpanded: boolean, controlsId?: string): Record<string, string | boolean | undefined> {
  return {
    "aria-expanded": isExpanded,
    "aria-controls": controlsId,
  };
}

/**
 * Creates ARIA props for a selected state
 */
export function getSelectedProps(isSelected: boolean): Record<string, boolean> {
  return {
    "aria-selected": isSelected,
  };
}

/**
 * Creates ARIA props for a disabled state
 */
export function getDisabledProps(isDisabled: boolean): Record<string, boolean> {
  return {
    "aria-disabled": isDisabled,
  };
}

/**
 * Prefixes for skip links
 */
export const skipLinkTargets = {
  mainContent: "main-content",
  navigation: "main-navigation",
  search: "search-input",
};

/**
 * Creates a skip link component props
 */
export function getSkipLinkProps(targetId: string, label: string): Record<string, string> {
  return {
    href: `#${targetId}`,
    className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-4 focus:rounded-md focus:shadow-lg",
    children: label,
  };
}
