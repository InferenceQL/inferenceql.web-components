import { LitElement, nothing } from 'lit';
import JSON5 from 'json5';
import vegaEmbed from 'vega-embed';

export class VegaLite extends LitElement {
  #finalize;

  static properties = {
    spec: { type: String },
    opt: { type: Object, converter: (s) => JSON5.parse(s) },
  };

  static formAssociated() {
    return true;
  }

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.spec = this.spec || JSON5.parse(this.textContent);
  }

  firstUpdated(...args) {
    super.firstUpdated(...args);
    this.internals.setFormValue(this.spec);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#finalize) {
      this.#finalize();
    }
  }

  _hasInlineData() {
    return (
      this.spec.hasOwnProperty('data')
      && this.spec.data.hasOwnProperty('values')
      && Array.isArray(this.spec.data.values)
    );
  }

  _hasDataFromURL() {
    return (
      this.spec.hasOwnProperty('data')
      && Array.isArray(this.spec.data)
    );
  }

  _hasNamedDataSources() {
    return (
      this.spec.hasOwnProperty('data')
      && this.spec.data.hasOwnProperty('name')
      && typeof this.spec.data.name === 'string'
    );
  }

  render() {
    const data = this.spec.data
    if (this._hasInlineData() || this._hasDataFromURL() || this._hasNamedDataSources()) {
      const element = document.createElement('div');
      vegaEmbed(element, this.spec, this.opt).then((result) => this.#finalize = result.finalize);
      return element;
    }
  }
}

customElements.define('vega-lite', VegaLite);
