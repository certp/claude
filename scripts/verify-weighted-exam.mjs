import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const first = html.indexOf('const BLUEPRINTS = ');
const last = html.indexOf('const domainLabel = ', first);
assert.ok(first >= 0 && last > first, 'Missing official blueprint configuration');
const BLUEPRINTS = new Function(html.slice(first, last) + '\nreturn BLUEPRINTS;')();
const snippet = html.match(/\/\* BEGIN WEIGHTED EXAM \*\/([\s\S]*?)\/\* END WEIGHTED EXAM \*\//);
assert.ok(snippet, 'Missing weighted exam implementation');
const DATA = Object.fromEntries(Object.keys(BLUEPRINTS).map(cert =>
  [cert, JSON.parse(readFileSync(join(root, 'data', cert + '.json'), 'utf8'))]
));
const shuffle = xs => {
  const out = [...xs];
  for(let i=out.length-1; i>0; i--){
    const j=Math.floor(Math.random()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
};
const { weightedExamQuotas, weightedExamIds } = new Function(
  'BLUEPRINTS', 'DATA', 'shuffle', snippet[1] + '\nreturn {weightedExamQuotas, weightedExamIds};'
)(BLUEPRINTS, DATA, shuffle);

const official = {
  ccaf: [16,11,12,12,9],
  ccao: [8,13,7,10,7,9,6],
  ccdf: [8,17,2,1,9,6,4,6]
};

for(const [cert, blueprint] of Object.entries(BLUEPRINTS)){
  assert.ok(Math.abs(blueprint.domains.reduce((sum,d)=>sum+d.weight,0)-100) < 1e-9,
    cert + ': published weights must total 100%');
  const bank=DATA[cert].qs.filter(q=>q.topic!=='review');
  const byId=new Map(bank.map(q=>[q.id,q]));
  const pools=Object.fromEntries(blueprint.domains.map(d =>
    [d.id, bank.filter(q=>q.topic===d.id).map(q=>q.id)]));
  const quotas=weightedExamQuotas(cert,blueprint.items,pools);
  assert.deepEqual(blueprint.domains.map(d=>quotas[d.id]),official[cert],
    cert + ': official mock must use the largest-remainder domain distribution');
  for(const n of [10,20,30,blueprint.items,bank.length]){
    const expected=weightedExamQuotas(cert,n,pools);
    for(let run=0;run<25;run++){
      const ids=weightedExamIds(cert,n);
      assert.equal(ids.length,n,cert+': incorrect sample size');
      assert.equal(new Set(ids).size,n,cert+': duplicate questions');
      assert.ok(ids.every(id=>byId.has(id)),cert+': out-of-scope or nonexistent question was sampled');
      const actual=Object.fromEntries(blueprint.domains.map(d=>[d.id,0]));
      for(const id of ids)actual[byId.get(id).topic]++;
      assert.deepEqual(actual,expected,cert+': weighted composition does not match quotas');
    }
  }
  console.log('PASS '+cert+': '+bank.length+' eligible questions, official domain distribution '+official[cert].join('/'));
}

// A depleted domain must not block the requested total sample size.
const synthetic = {d1:['x'],d2:Array.from({length:30},(_,i)=>String(i)),
  d3:[],d4:[],d5:[]};
const quotas=weightedExamQuotas('ccaf',20,synthetic);
assert.equal(quotas.d1,1);
assert.equal(Object.values(quotas).reduce((sum,n)=>sum+n,0),20);
console.log('PASS: capacity-aware redistribution');
