import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,validateState,grade,escapeHtml} from '../dist/core.js';
import {lessons} from '../dist/content.js';
import {library,exams} from '../dist/practice.js';
import {grammarBank,extraDrills} from '../dist/grammar.js';

const ids=lessons.map(item=>item.id);
const lesson=lessons.find(item=>item.level==='B1');
const answersFor=items=>items.map(item=>item.options?item.answer:item.accepted[0]);
const restore=state=>validateState(state,ids);

test('Ordinary grading rejects missing, sparse and invalid answers without producing NaN',()=>{
  const valid=answersFor(lesson.quiz);
  for(const input of [null,{},[],new Array(valid.length),[...valid.slice(0,-1),null],[...valid.slice(0,-1),NaN],[...valid.slice(0,-1),Infinity],[...valid.slice(0,-1),'0'],[...valid.slice(0,-1),3]])assert.throws(()=>grade(lesson.quiz,input),/Responde/);
  assert.throws(()=>grade([],[]),/Responde/);
  assert.throws(()=>grade(new Array(6),valid),/Responde/);
  const result=grade(lesson.quiz,valid);
  valid[0]=-1;
  assert.equal(result.percent,100);
  assert.equal(result.answers[0],lesson.quiz[0].answer);
});

test('Backup exam counts use the actual level limits and finite whole numbers',()=>{
  const state=freshState();
  for(const level of ['A2','B1','B2','C1'])state.examResults[level]={reading:999,listening:999};
  const clean=restore(state);
  for(const level of ['A2','B1','B2','C1']){
    assert.equal(clean.examResults[level].reading,exams[level].reading);
    assert.equal(clean.examResults[level].listening,exams[level].listening);
  }
  state.examResults.B1={reading:27.9,listening:-3};
  assert.deepEqual(restore(state).examResults.B1,{reading:27,listening:0,notes:'',model:''});
  for(const invalid of [NaN,Infinity,-Infinity,null,'23',{},[]]){
    state.examResults.B1={reading:invalid,listening:invalid};
    assert.equal(restore(state).examResults.B1.reading,0);
    assert.equal(restore(state).examResults.B1.listening,0);
  }
});

test('Imported lesson and reading answers outrank fabricated aggregate scores',()=>{
  const state=freshState();
  for(const item of [lesson,library[0]]){
    const questions=item.quiz??item.questions,answers=answersFor(questions);
    answers[0]=(answers[0]+1)%questions[0].options.length;
    state.results[item.id]={answers,correct:100,total:100,percent:100,attempts:999999};
    const result=restore(state).results[item.id];
    assert.equal(result.correct,questions.length-1);
    assert.equal(result.total,questions.length);
    assert.equal(result.attempts,10000);
    assert.deepEqual(result.answers,answers);
    assert.notEqual(result.answers,answers);
  }
  state.results[lesson.id]={correct:1,total:1,percent:100};
  assert.equal(restore(state).results[lesson.id],undefined);
  state.results[lesson.id]={correct:6,total:6,answers:[]};
  assert.equal(restore(state).results[lesson.id],undefined);
});

test('Count-only v1 progress survives with sensible attempt counts and new defaults',()=>{
  const old={version:1,level:'B1',english:true,notes:'My earlier notes',results:{[lesson.id]:{correct:5,total:6,percent:100,attempts:-20}},drafts:{[lesson.id]:'Mi texto anterior'},ratings:{conversation:[1,2,3,4,5]},reviewed:{[lesson.id]:true},lastLesson:lesson.id};
  const clean=restore(JSON.parse(JSON.stringify(old)));
  assert.equal(clean.results[lesson.id].percent,83);
  assert.equal(clean.results[lesson.id].attempts,1);
  assert.equal(clean.drafts[lesson.id],old.drafts[lesson.id]);
  assert.equal(clean.lastLesson,lesson.id);
  assert.equal(clean.english,true);
  assert.deepEqual(clean.ratings.conversation,[1,2,3,4,5]);
  assert.deepEqual(clean.review,{});
  assert.deepEqual(clean.quizDrafts,{});
  assert.equal(clean.sessionMinutes,15);
  assert.equal(clean.version,1);
});

test('Malformed optional containers cannot break valid personal notes or pollute prototypes',()=>{
  const fields=['drafts','reviewed','ratings','results','examResults','grammarResults','drillResults','review','quizDrafts'];
  for(const malformed of [null,true,false,17,'bad',[],[1,2],{'__proto__':null}]){
    const state={...freshState(),notes:'Keep me'};
    for(const field of fields)state[field]=malformed;
    assert.equal(restore(state).notes,'Keep me');
  }
  const hostile=JSON.parse('{"version":1,"level":"B1","drafts":{"__proto__":{"polluted":true},"constructor":"bad"},"review":{"__proto__":{"due":"2026-10-17","stage":1}},"quizDrafts":{"constructor":[0],"grammar/B1/__proto__":[0]}}');
  const clean=validateState(hostile,[...ids,'__proto__','constructor']);
  assert.deepEqual(clean.drafts,{});
  assert.deepEqual(clean.review,{});
  assert.deepEqual(clean.quizDrafts,{});
  assert.equal({}.polluted,undefined);
  assert.equal(Object.getPrototypeOf(clean.drafts),Object.prototype);
  for(const invalid of [null,[],false,{}, {version:2,level:'B1'},{version:1,level:'C2'}])assert.throws(()=>restore(invalid),/compatible/);
});

test('Grammar and drill imports recalculate and detach answer evidence',()=>{
  const state=freshState();
  state.grammarResults.B1=[{answers:answersFor(grammarBank.B1),percent:0,date:'2026-10-17'}];
  state.drillResults.B1={answers:answersFor(extraDrills.B1),percent:0};
  state.ratings.conversation=[1,2,3,4,5];
  const clean=restore(state);
  assert.equal(clean.grammarResults.B1[0].percent,100);
  assert.equal(clean.drillResults.B1.percent,100);
  state.grammarResults.B1[0].answers[0]=-1;
  state.drillResults.B1.answers[0]=-1;
  state.ratings.conversation[0]=99;
  assert.equal(clean.grammarResults.B1[0].answers[0],grammarBank.B1[0].answer);
  assert.equal(clean.drillResults.B1.answers[0],extraDrills.B1[0].answer);
  assert.equal(clean.ratings.conversation[0],1);
});

test('Review schedules keep valid canonical entries and reject impossible dates and stages',()=>{
  const state=freshState();
  const validKeys=['b1-g1','a2-extra-1',`lesson/${lesson.id}/0`,'text/lib-b1-1/0'];
  for(const id of validKeys)state.review[id]={due:'2028-02-29',stage:2,unexpected:'discard'};
  state.review['b1-g2']={due:'2026-02-29',stage:1};
  state.review['b1-g3']={due:'2026-04-31',stage:1};
  state.review['b1-g4']={due:'2026-10-17',stage:1.5};
  state.review['b1-g5']={due:'2026-10-17',stage:5};
  state.review['b1-g6']={due:'2026-10-17',stage:-1};
  state.review['b1-g7']={due:'2026-10-17<script>',stage:1};
  state.review['<img onerror=alert(1)>']={due:'2026-10-17',stage:1};
  state.review[`b1-${'a'.repeat(120)}`]={due:'2026-10-17',stage:1};
  const clean=restore(state);
  assert.deepEqual(Object.keys(clean.review),validKeys);
  for(const id of validKeys)assert.deepEqual(clean.review[id],{due:'2028-02-29',stage:2});
  state.review=Object.fromEntries(Array.from({length:1200},(_,i)=>[`b1-g${i}`,{due:'2026-10-17',stage:0}]));
  assert.equal(Object.keys(restore(state).review).length,1000);
});

test('Partial quiz drafts preserve unanswered slots while rejecting unsafe or oversized payloads',()=>{
  const state=freshState();
  const keys=[lesson.id,'lib-b1-1','grammar/B1','grammar/B1/past','drill/A2','drill/B2/change'];
  for(const id of keys)state.quizDrafts[id]=[0,null,'se las',''];
  state.quizDrafts['review/B1']=[0,null,'se las',''];
  state.quizDrafts['grammar/C1']=[{}];
  state.quizDrafts['grammar/B2']=['x'.repeat(101)];
  state.quizDrafts['grammar/A2']=Array(101).fill(0);
  state.quizDrafts['drill/C1']=[10];
  state.quizDrafts['review/C1']=[-1];
  state.quizDrafts['review/B2']=new Array(3);
  state.quizDrafts['review/C2']=[0];
  state.quizDrafts['../notes']=[0];
  const clean=restore(state);
  assert.deepEqual(Object.keys(clean.quizDrafts),keys);
  for(const id of keys)assert.deepEqual(clean.quizDrafts[id],[0,null,'se las','']);
  state.quizDrafts[lesson.id][0]=2;
  assert.equal(clean.quizDrafts[lesson.id][0],0);
  for(const minutes of [10,15,25])assert.equal(restore({...state,sessionMinutes:minutes}).sessionMinutes,minutes);
  for(const minutes of [0,-5,999,'10',null])assert.equal(restore({...state,sessionMinutes:minutes}).sessionMinutes,15);
});

test('Personal text remains literal, bounded and safely escaped for HTML rendering',()=>{
  const payload='<img src=x onerror="alert(1)"> & \'quoted\'';
  const state=freshState();
  state.notes=payload;
  state.drafts[lesson.id]=payload;
  state.examResults.B1={model:payload,notes:payload};
  const clean=restore(JSON.parse(JSON.stringify(state)));
  for(const value of [clean.notes,clean.drafts[lesson.id],clean.examResults.B1.model,clean.examResults.B1.notes]){
    assert.equal(value,payload);
    assert.ok(!escapeHtml(value).includes('<img'));
    assert.ok(escapeHtml(value).includes('&quot;'));
    assert.ok(escapeHtml(value).includes('&#39;'));
  }
  state.notes='x'.repeat(100001);
  state.drafts[lesson.id]='x'.repeat(100001);
  state.examResults.B1={notes:'x'.repeat(10001),model:'x'.repeat(301)};
  const bounded=restore(state);
  assert.equal(bounded.notes.length,100000);
  assert.equal(bounded.drafts[lesson.id].length,100000);
  assert.equal(bounded.examResults.B1.notes.length,10000);
  assert.equal(bounded.examResults.B1.model.length,300);
});
