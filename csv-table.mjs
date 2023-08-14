import JSON5 from 'json5'
import Papa from 'papaparse';
import { LitElement, css, html, nothing } from 'lit';

export class CSVTable extends LitElement {
  static styles = css`
    table {
      border-collapse: collapse;
      border-spacing: 0;
      display: block;
      font-family: sans-serif;
      max-width: 100%;
      overflow: auto;
      width: max-content;
    }

    table tbody {
      background-color: rgb(0 0 0 / 2.5%); // #f6f8fa
    }

    @media (prefers-color-scheme: dark) {
      table tbody {
        background-color: rgb(255 255 255 / 2.5%);
      }
    }

    table th,
    table td {
      border: 1px solid rgb(0 0 0 / 15%); //#d0d7de;
      padding: 6px 13px;
    }
  `;

  static properties = {
    src:         { type: String },
    parseConfig: { type: Object, attribute: 'parse-config', converter: (s) => JSON5.parse(s) },

    _fields: { type: Array, state: true },
    _data:   { type: Array, state: true },
    _errors: { type: Array, state: true }
  };

  constructor() {
    super();
  }

  updated(changedProperties) {
    if (changedProperties.has('src') || changedProperties.has('parseconfig')) {
      this.fetchCSV();
    }
  }

  async fetchCSV() {
    const response = await fetch(this.src, {
      headers: {
        'Accept': 'text/csv'
      }
    });

    const text = await response.text();
    const csv = Papa.parse(text, this.parseConfig);

    this._fields = csv.meta.fields;
    this._data = !this._fields ? csv.data : csv.data.map((datum) => this._fields.map((field) => datum[field]));
    this._errors = csv.errors;
  }

  render() {
    if (this._errors && this._errors.length > 0) {
      console.error('CSV parsing errors', this._errors);
      return nothing;
    }

    if (!this._data) {
      return nothing;
    }

    const thead = !this._fields ? null : html`
      <thead>
        ${this._fields.map((field) => html`<th>${field}</th>`)}
      </thead>
    `;

    return html`
      <table>
        ${thead}
        <tbody>
          ${this._data.map((datum) => html`<tr>${datum.map((cell) => html`<td>${cell}</td>`)}</tr>`)}
        </tbody>
      </table>
    `;
  }
}

customElements.define('csv-table', CSVTable);
