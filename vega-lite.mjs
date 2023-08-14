import { LitElement, nothing } from 'lit';
import JSON5 from 'json5';
import vegaEmbed from 'vega-embed';

export class VegaLite extends LitElement {
  #finalize;

  static properties = {
    spec: { type: String },
    opt: { type: Object, converter: (s) => JSON5.parse(s) },
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#finalize) {
      this.#finalize();
    }
  }

  render() {
    const spec = this.spec || JSON5.parse(this.textContent);
    const element = document.createElement('div');
    vegaEmbed(element, spec, this.opt).then((result) => this.#finalize = result.finalize);
    return element;
  }
}

customElements.define('vega-lite', VegaLite);
