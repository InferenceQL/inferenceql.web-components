# inferenceql.web-components

## Usage

Include a `script` tag for the component(s) you would like to use.

``` html
<script type="module" src="https://esm.sh/gh/inferenceql/inferenceql.web-components/iql-code.mjs"></script>
<script type="module" src="https://esm.sh/gh/inferenceql/inferenceql.web-components/csv-table.mjs"></script>
<script type="module" src="https://esm.sh/gh/inferenceql/inferenceql.web-components/vega-lite.mjs"></script>
```

Include the component in your HTML.

``` html
<iql-code>SELECT * FROM (GENERATE * UNDER model) LIMIT 10</iql-code>
<csv-table src="data.csv"></csv-table>
<vega-lite src="vega-lite-spec.json"></vega-lite>
```
