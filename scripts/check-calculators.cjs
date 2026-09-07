const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
// Load these pure TypeScript modules with the project's existing compiler.
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { getConverter, converters } = require('../lib/conversions.ts');
const { inputErrors } = require('../lib/validation.ts');
const { getGuide } = require('../lib/guides.ts');
const convert = (slug, inputs, label) => getConverter(slug).convert(inputs).find(r => r.label === label).value;
assert.equal(convert('ml-to-uk-tablespoons', {ml:'15'}, 'UK tablespoons'), '1.00 tbsp');
assert.equal(convert('ml-to-uk-tablespoons', {ml:'45'}, 'UK teaspoons'), '9.00 tsp');
assert.equal(convert('day-rate-to-salary', {dayRate:'400',billableDays:'220'}, 'Gross annual billings'), '£88,000');
for (const [salary, tax, ni] of [[12570,'£0','£0'],[35000,'£4,486','£1,794'],[50270,'£7,540','£3,016'],[100000,'£27,432','£4,011'],[125140,'£42,516','£4,513'],[150000,'£53,703','£5,011']]) {
  const v={salary:String(salary),hours:'37.5',weeks:'52'};
  assert.equal(convert('salary-to-hourly-after-tax',v,'Income tax'),tax);
  assert.equal(convert('salary-to-hourly-after-tax',v,'National Insurance'),ni);
}
assert.equal(convert('salary-to-hourly-after-tax',{salary:'35000',hours:'37.5',weeks:'52'},'Real hourly rate (after tax)'), '£14.73');
assert.equal(convert('cups-to-grams-by-ingredient',{amount:'1',unit:'metric-cup',ingredient:'water'},'Weight of water'),'250 g');
assert.equal(convert('cups-to-grams-by-ingredient',{amount:'1',unit:'us-cup',ingredient:'flour'},'Weight of plain / all-purpose flour'),'125 g');
for (const converter of converters) {
 const defaults=Object.fromEntries(converter.inputs.map(f=>[f.name,String(f.default)]));
 assert.deepEqual(inputErrors(converter.inputs,defaults),{});
 for(const field of converter.inputs.filter(f=>f.type==='number')) {
  for(const bad of ['', '-1', 'Infinity', 'NaN', ...(field.max === undefined ? [] : [String(field.max+1)])]) assert.ok(inputErrors(converter.inputs,{...defaults,[field.name]:bad})[field.name]);
 }
 const guide=getGuide(converter.slug);
 assert.ok(guide && guide.rows.length);
 assert.ok(guide.rows.every(row=>row.length===guide.columns.length));
}
console.log('PASS: tax bands and taper, NI boundaries, day rates, kitchen conversions, invalid inputs and reference tables.');
