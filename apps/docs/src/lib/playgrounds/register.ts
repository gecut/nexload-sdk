type Evaluate = (input: string, mode: string) => string | Promise<string>;

export function registerLab(tag: string, evaluate: Evaluate): void {
  if (customElements.get(tag)) return;
  customElements.define(tag, class extends HTMLElement {
    connectedCallback(): void {
      const field = this.querySelector("input");
      const menu = this.querySelector("select");
      const output = this.querySelector("output");
      const share = this.querySelector("a");
      if (!field || !menu || !output || !share) return;
      this.querySelector("[data-nojs]")?.setAttribute("hidden", "");
      const sample = field.defaultValue;
      const defaultMode = menu.value;
      let revision = 0;
      const update = async (): Promise<void> => {
        const token = ++revision;
        const input = field.value;
        const mode = menu.value;
        const url = new URL(location.href);
        url.hash = "try?" + new URLSearchParams({ input, mode }).toString();
        share.href = url.href;
        share.hidden = false;
        const result = await evaluate(input, mode);
        if (token === revision) output.textContent = result;
      };
      const restore = (): void => {
        const state = new URLSearchParams(location.hash.startsWith("#try?") ? location.hash.slice(5, 2053) : "");
        field.value = (state.get("input") ?? sample).slice(0, 120);
        const mode = state.get("mode");
        menu.value = Array.from(menu.options).some(option => option.value === mode) ? String(mode) : defaultMode;
        void update();
      };
      this.oninput = () => { void update(); };
      window.addEventListener("hashchange", restore, { signal: this.lifecycle.signal });
      restore();
    }

    private lifecycle = new AbortController();

    disconnectedCallback(): void {
      this.lifecycle.abort();
      this.lifecycle = new AbortController();
      this.oninput = null;
    }
  });
}
