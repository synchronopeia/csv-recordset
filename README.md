# CSV-Recordset

Incorporate CSV's into a semi-structured-data workflow by using a simple schema.

## Illustrative Example

```javascript
import { fromCsv, toCsv } from '@synchronopedia/csv-recordset';

const SCHEMA_DEFS = [{
  fieldId: 'participantId',
  default: '',
  /** without colName, this field is excluded from any CSV operations */
}, {
  fieldId: 'lastName',
  default: '',
  colName: 'Last Name', /** CSV uses this as a header */
}, {
  fieldId: 'firstName',
  default: '',
  colName: 'First Name',
}, {
  fieldId: 'email',
  default: '',
  colName: 'Email',
}, {
  fieldId: 'interestRating',
  default: null,
  colName: 'Interest Rating',
}];

const CSV = [
  ['Last Name', 'First Name', 'Email', 'Interest Rating'], /** header row */
  ['Tebaldi', 'Renata', 'rt@opera-singer.com', 91],
  ['Freni', 'Mirella', 'mf@opera-singer.com', 97],
  ['Anderson', 'Marian', 'ma@opera-singer.com'], /** OOPS! The integer value for the last column (Interest Rating) is missing */
  ['Flagstad', 'Kirsten', 'kf@opera-singer.com', 92],
];

const recsFromCsv = fromCsv(CSV, SCHEMA_DEFS);
/** Note that:
  *  (1) participantId is set to its default ('')
  *  (2) the missing value for Marian Anderson's "Interest Rating" has been set to its default (null)
*/
/**
[
  {
    participantId: '',
    lastName: 'Tebaldi',
    firstName: 'Renata',
    email: 'rt@opera-singer.com',
    interestRating: 91
  },
  {
    participantId: '',
    lastName: 'Freni',
    firstName: 'Mirella',
    email: 'mf@opera-singer.com',
    interestRating: 97
  },
  {
    participantId: '',
    lastName: 'Anderson',
    firstName: 'Marian',
    email: 'ma@opera-singer.com',
    interestRating: null
  },
  {
    participantId: '',
    lastName: 'Flagstad',
    firstName: 'Kirsten',
    email: 'kf@opera-singer.com',
    interestRating: 92
  }
]
*/

const recsFromCsvWithParticipantIds = recsFromCsv.map((rec, index) => ({
  ...rec,
  participantId: `Singer-${index + 1}`,
}));
```

## Requirements

We are using es6 modules (Node version >= 13.2.0).

See [Announcing core Node.js support for ECMAScript modules](https://medium.com/@nodejs/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663).
