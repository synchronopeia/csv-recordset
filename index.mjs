/* eslint-disable import/extensions */

import ContextAssert from '@synchronopeia/context-assert';

const assert = new ContextAssert();

/**
 * PARAMETERS
 */

const COL_OUTPUT_MODES = ['include', 'exclude', 'obfuscate']; // enum

/**
 * Error Definitions
 */

const SCHEMA_COL_OUTPUT_MODE_ERR = (arg) => `SCHEMA_COL_OUTPUT_MODE_ERR: schema must specify colOutputMode of type string which is one of ${COL_OUTPUT_MODES.join('|')} (check '${arg}')`;
const HEADER_COL_NOT_FOUND_ERR = (arg) => `HEADER_COL_NOT_FOUND_ERR: CSV header row must include colLabel defined in schema def (check '${arg}')`;

/**
 * Support Functions
 */

const getRec = (row, colDefs) => {
  const rec = {};
  colDefs.forEach((colDef) => {
    const value = (colDef.colIndex === null) || (colDef.colIndex > (row.length - 1)) ? colDef.default : row[colDef.colIndex];
    rec[colDef.fieldId] = (typeof value === 'string') ? value.trim() : value;
  });
  return rec;
};

const buildColDefsForCreatingCsv = (schemaDefs) => {
  const colDefs = [];
  schemaDefs.forEach((schemaDef) => {
    // for omitted colLabel, this column isn't even created
    if ((schemaDef.colLabel === undefined) || (schemaDef.colLabel === null) || (schemaDef.colLabel === '')) return;

    // colOutputMode must also be specified
    if (!((typeof schemaDef.colOutputMode === 'string') && COL_OUTPUT_MODES.includes(schemaDef.colOutputMode))) throw Error(SCHEMA_COL_OUTPUT_MODE_ERR(schemaDef.colLabel));

    // for colOutputMode: exclude, col CSV
    if (schemaDef.colOutputMode === 'exclude') return;

    // create a default colDef and push it onto the array
    const colDef = {
      fieldId: '',
      default: schemaDef.default,
      colLabel: schemaDef.colLabel,
    };
    colDefs.push(colDef);

    // for 'obfuscate' mode, no data is read from the record
    if (schemaDef.colOutputMode === 'obfuscate') return;

    colDef.fieldId = schemaDef.fieldId;
  });

  return colDefs;
};

const buildColDefsForParsingCsv = (schemaDefs, csvHeader) => {
  const colDefs = [];
  schemaDefs.forEach((schemaDef) => {
    // create a default colDef and push it onto the array
    const colDef = {
      fieldId: schemaDef.fieldId,
      default: schemaDef.default,
      colLabel: '',
      colIndex: null,
    };
    colDefs.push(colDef);

    // for omitted colLabel, no data is read from the CSV
    if ((schemaDef.colLabel === undefined) || (schemaDef.colLabel === null) || (schemaDef.colLabel === '')) return;

    /** Process specified column */

    colDef.colLabel = schemaDef.colLabel;

    // attempt to find colIndex
    const colIndex = csvHeader.indexOf(colDef.colLabel);
    if (colIndex === -1) {
      // column not found:
      if (schemaDef.colIsOptional === true) return; // - colIsOptional must be set (the default will be used)
      throw Error(HEADER_COL_NOT_FOUND_ERR(colDef.colLabel)); // - otherwise throw
    }
    // CSV data will be read from each row at colIndex
    colDef.colIndex = colIndex;
  });
  return colDefs;
};

/**
 * @param {Array[]} srcTable
 * @param {Object[]} schemaDefs
 * @returns {Object[]}
 *
 * Note "keys" refers to enumerable properties
 */

const toCsv = (recs, schemaDefs) => {
  /** Throw Early */
  assert.setContext('recs arg for toCsv(recs, schemaDefs)');
  assert.array(recs);

  assert.setContext('schemaDefs arg for fromCsv(csv, schemaDefs)');
  assert.arrayWithRecordProperty(schemaDefs, 'default');
  assert.arrayWithRecordId(schemaDefs, 'fieldId');
  assert.arrayWithOptionalRecordLabel(schemaDefs, 'colLabel');

  /** Build Column Definitions */

  const colDefs = buildColDefsForCreatingCsv(schemaDefs);

  const headerRow = colDefs.map((def) => def.colLabel);

  const csv = [];

  csv.push(headerRow);

  recs.forEach((rec) => {
    const dataRow = colDefs.map((def) => ((def.fieldId && Object.prototype.hasOwnProperty.call(rec, def.fieldId)) ? rec[def.fieldId] : def.default));
    csv.push(dataRow);
  });

  return csv;
};

const fromCsv = (csv, schemaDefs) => {
  /** Throw Early */
  assert.setContext('csv arg for fromCsv(csv, schemaDefs)');
  assert.array(csv);

  assert.setContext('schemaDefs arg for fromCsv(csv, schemaDefs)');
  assert.arrayWithRecordProperty(schemaDefs, 'default');
  assert.arrayWithRecordId(schemaDefs, 'fieldId');
  assert.arrayWithOptionalRecordLabel(schemaDefs, 'colLabel');

  /** Build Column Definitions */

  const colDefs = buildColDefsForParsingCsv(schemaDefs, csv[0]);

  const recs = [];

  for (let index = 1; index < csv.length; index += 1) {
    recs.push(getRec(csv[index], colDefs));
  }

  return recs;
};

export { fromCsv, toCsv };
