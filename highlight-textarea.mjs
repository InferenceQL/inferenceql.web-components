import hljs from 'highlight.js';
import { LitElement, css, html } from 'lit';
import { live } from 'lit/directives/live.js';
import { createRef, ref } from 'lit/directives/ref.js'

class HighlightTextarea extends LitElement {
  static styles = css`
    :host {
      display: grid;
      font-size: inherit;
      font-family: monospace;
      margin: 0px;
      padding: 0px;
      tab-size: 2;
    }

    textarea, highlight-code {
      grid-area: 1 / 1 / 2 / 2;
      overflow-x: auto;
      overflow-y: hidden;
      white-space: pre;

      border-style: solid;
      border-width: 1px;
      margin: 2px;
      padding: 2px;
      tab-size: 2;

      line-height: 1rem;

      font-size: inherit;
      font-family: inherit;
    }

    highlight-code {
      z-index: 0;
      border-color: transparent;
    }

    textarea {
      z-index: 1;

      resize: none;

      color: transparent;
      background: transparent;
      caret-color: black;
      @media (prefers-color-scheme: dark) {
        caret-color: white;
      }
    }
  `;

  static properties = {
    name: { type: String },
    value: { type: String },
    language: { type: String },
  };

  static formAssociated() {
    return true;
  }

  firstUpdated(...args) {
    super.firstUpdated(...args);
    this.internals.setFormValue(this.value);
  }

  textareaRef = createRef();
  codeRef = createRef();

  _handleInput(event) {
    this.value = event.target.value;
    this.internals.setFormValue(this.value);
  }

  _handleScroll(event) {
    this.codeRef.value.scrollTop = this.textareaRef.value.scrollTop;
    this.codeRef.value.scrollLeft = this.textareaRef.value.scrollLeft;
  }

  constructor() {
    super();
    this.internals = this.attachInternals();

    const textContent = this.textContent || "";
    const lines = textContent.split('\n');

    // Remove leading and trailing empty lines.
    while (/^\s*$/.test(lines[0])) lines.shift();
    while (/^\s*$/.test(lines[lines.length - 1])) lines.pop();

    // Remove leading spaces from remaining lines.
    const numLeadingSpaces = lines.map((s) => s.match(/^\s*/)[0].length).reduce((acc, n) => Math.min(acc, n));
    this.value = lines.map((s) => s.replace(new RegExp(`^\\s{0,${numLeadingSpaces}}`), '')).join('\n');
  }

  render() {
    const text = this.value[this.value.length-1] == '\n' ? this.value + ' ' : this.value;
    return html`
      <textarea
        name=${this.name}
        ref=${ref(this.textareaRef)}
        spellcheck="false"
        @input=${this._handleInput}
        @scroll=${this._handleScroll}
        rows="1"
        wrap="off"
      >${text}</textarea>
      <highlight-code
        ref=${ref(this.codeRef)}
        language=${this.language}
      >${text}</highlight-code>
    `;
  }
}

customElements.define('highlight-textarea', HighlightTextarea);
