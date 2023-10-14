import JSON5 from 'json5'
import Papa from 'papaparse';
import { LitElement, css, html, nothing } from 'lit';
import { ifDefined } from 'lit-html/directives/if-defined';

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
    _rowParts:   { type: Object, attribute: 'row-parts',    converter: (s) => JSON5.parse(s) },
    _colParts:   { type: Object, attribute: 'col-parts',    converter: (s) => JSON5.parse(s) },
    _headers:    { type: Array, state: true },
    _data:       { type: Array, state: true },
    _errors:     { type: Array, state: true }
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
    const csv = Papa.parse(text.trim(), this.parseConfig);

    this._headers = csv.meta.fields;
    // PapaParse will return an array of objects if `headers` is set. Otherwise
    // it will return a two-dimensional array. We want the latter. Trun array of
    // objects into a two-dimensional array if necessary.
    this._data = !this._headers ? csv.data : csv.data.map((datum) => this._headers.map((field) => datum[field]));
    this._errors = csv.errors;
  }

  invertMap(obj) {
    // Accepts an object where the values are arrays. Returns a map where each
    // value in each array maps to the corresponding key. For example:
    // ```
    // { x: [0, 1, 2] } ; => { 0: "x", 1: "x", 2: "x" }
    // ```
    const invertedObj = {};
    for (const [k, vs] of Object.entries(obj || {})) {
      vs.forEach((v) => {
        invertedObj[v] = k;
      })
    }
    return (v) => invertedObj[v];
  }

  render() {
    if (this._errors && this._errors.length > 0) {
      console.error('CSV parsing errors', this._errors);
      return nothing;
    }

    if (!this._data) {
      return nothing;
    }

    const rowPart = this.invertMap(this._rowParts);
    const colPart = this.invertMap(this._colParts);

    const headerPart = (headerIndex) => {
      const part = colPart(headerIndex);
      return part ? part + ' header' : part;
    };

    const thead = !this._headers ? null : html`
      <thead>
        ${this._headers.map((header, headerIndex) => html`
          <th part=${ifDefined(headerPart(headerIndex))}>
            ${header}
          </th>
        `)}
      </thead>
    `;

    const renderCell = (cell, colIndex) => html`
      <td part=${ifDefined(colPart(colIndex))}>
        ${cell}
      </td>
    `;

    const renderRow = (row, rowIndex) => html`
      <tr part=${ifDefined(rowPart(rowIndex))}>
        ${row.map(renderCell)}
      </tr>
    `;

    return html`
      <table>
        ${thead}
        <tbody>
          ${this._data.map(renderRow)}
        </tbody>
      </table>
    `;
  }
}

customElements.define('csv-table', CSVTable);
