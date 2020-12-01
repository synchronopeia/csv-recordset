/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */

import test from 'ava';
import crypto from 'crypto';

import { fromCsv, toCsv } from './index.mjs';

const PREFIX = 'singer';

const getUniqueId = (email) => {
  const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex').substring(0, 8); // 8 should be sufficient for this tiny example
  return `${PREFIX}-${hash}`;
};

const SCHEMA_DEFS = [{
  fieldId: 'participantId',
  default: '',
}, {
  fieldId: 'lastName',
  default: '',
  colLabel: 'Last Name',
  colOutputMode: 'include', /** include|optional|exclude|obfuscate */
}, {
  fieldId: 'firstName',
  default: '',
  colLabel: 'First Name',
  colOutputMode: 'include',
}, {
  fieldId: 'email',
  default: '',
  colLabel: 'Email',
  colOutputMode: 'exclude',
}, {
  fieldId: 'interestRating',
  default: null,
  colLabel: 'Interest Rating',
  colOutputMode: 'include',
}, {
  fieldId: 'awardedPrize',
  default: '',
  colLabel: 'Awarded Prize',
  colOutputMode: 'include',
  colIsOptional: true,
}];

const PRIZES = [
  'Grammy Award',
  'Deutsche Grammophon Contract',
  'Met Debut',
  'Major Motion Picture Role',
];

const CSV = [
  ['Last Name', 'First Name', 'Email', 'Interest Rating'], /** header row */
  ['Tebaldi', 'Renata', 'rt@opera-singer.com', 91],
  ['Freni', 'Mirella', 'mf@opera-singer.com', 97],
  ['Anderson', 'Marian', 'ma@opera-singer.com'], /** OOPS the last column value is missing */
  ['Flagstad', 'Kirsten', 'kf@opera-singer.com', 92],
];

test('invalid column label throws', (t) => {
  const INVALID_DEF = {
    fieldId: 'middleName',
    default: '',
    colLabel: 'Middle  Name', /** consecutive spaces */
  };
  t.throws(() => fromCsv(CSV, [...SCHEMA_DEFS, INVALID_DEF]));
  t.pass();
});

test('fromCsv(CSV, SCHEMA_DEFS)', (t) => {
  t.notThrows(() => fromCsv(CSV, SCHEMA_DEFS));

  const recsFromCsv = fromCsv(CSV, SCHEMA_DEFS);

  if (CSV.length !== recsFromCsv.length + 1) t.fail();

  t.pass();
});

test('toCsv(CSV, SCHEMA_DEFS)', (t) => {
  const recsFromCsv = fromCsv(CSV, SCHEMA_DEFS);

  const properRecordset = recsFromCsv.map((rec, index) => ({
    ...rec,
    participantId: getUniqueId(rec.email), // make this a proper recordset by populating participantId
    awardedPrize: PRIZES[index], // and assign the awarded prize
  }));

  t.notThrows(() => toCsv(properRecordset, SCHEMA_DEFS));

  const csvForPublication = toCsv(properRecordset, SCHEMA_DEFS);

  if (csvForPublication.length !== recsFromCsv.length + 1) t.fail();

  t.pass();
});
