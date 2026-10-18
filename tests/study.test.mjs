import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,validateState} from '../dist/core.js';
import {lessons} from '../dist/content.js';
import {grammarBank,grammarItems} from '../dist/grammar.js';
import {questionIndex,searchCatalog,searchText,studyPlan,scheduleAnswers,reviewEntries,seedReview,afterDays} from '../dist/study.js';
import {searchResults,reviewPage} from '../dist/study-view.js';

test('Search finds Spanish without accents and English across the four content types',()=>{
 assert.equal(searchText('PRETÉRITO'),'preterito');assert.notEqual(searchText('año'),searchText('ano'));
 assert.ok(searchCatalog('pronouns').some(r=>r.type==='lesson'));
 assert.ok(searchCatalog('gustar',{type:'visual'}).length);
 assert.ok(searchCatalog('pretérito').length);
 assert.ok(searchCatalog('',{level:'A2',type:'reading'}).length===4);
 assert.equal(searchCatalog('nothingmatchesxyza').length,0);
 assert.equal(searchResults('<img onerror=alert(1)>',{}).html.includes('<img'),false);
});
test('All 440 review entries have distinct stable keys and a valid question',()=>{
 assert.equal(questionIndex.size,440);
 for(const [key,item] of questionIndex){assert.equal(item.key,key);assert.ok(item.question.prompt);assert.ok(item.href.startsWith('#'));}
});
test('Daily plans resume the current route and fit the selected duration',()=>{
 const state=freshState(),route=lessons.filter(l=>l.level==='B1');state.lastLesson=route[3].id;
 for(const minutes of [10,15,25]){state.sessionMinutes=minutes;const plan=studyPlan(state);assert.equal(plan.lesson.id,route[3].id);assert.equal(plan.steps.reduce((n,s)=>n+s.minutes,0),minutes);assert.equal(plan.reading.level,'B1');}
 state.results[route[3].id]={percent:100};assert.notEqual(studyPlan(state).lesson.id,route[3].id);
 state.level='A2';assert.equal(studyPlan(state).lesson.level,'A2');
});
test('Review tracks mistakes, spaces correct recalls and does not reward same-day repetition',()=>{
 const q=grammarBank.B1[0],key=q.id,wrong=(q.answer+1)%q.options.length;
 let review=scheduleAnswers({},[key],[q],[wrong],'2026-10-24');assert.deepEqual(review[key],{due:'2026-10-24',stage:0});
 review=scheduleAnswers(review,[key],[q],[q.answer],'2026-10-24');assert.deepEqual(review[key],{due:'2026-10-25',stage:1});
 review=scheduleAnswers(review,[key],[q],[q.answer],'2026-10-24');assert.equal(review[key].stage,1);
 review=scheduleAnswers(review,[key],[q],[q.answer],'2026-10-25');assert.deepEqual(review[key],{due:'2026-10-28',stage:2});
 review=scheduleAnswers(review,[key],[q],[wrong],'2026-10-28');assert.equal(review[key].stage,0);
 assert.equal(afterDays('2026-10-25',1),'2026-10-26');assert.equal(afterDays('2026-12-31',1),'2027-01-01');
 assert.deepEqual(scheduleAnswers({},[key],[q],[q.answer]),{});
});
test('Old grammar errors seed the queue once and imported schedules survive reload',()=>{
 const state=freshState(),items=grammarBank.B1,answers=items.map(q=>q.options?q.answer:q.accepted[0]);answers[0]=(answers[0]+1)%3;
 state.grammarResults.B1=[{answers,date:'2026-10-18'}];state.review=seedReview(state,'2026-10-18');assert.equal(Object.keys(state.review).length,1);
 state.review=scheduleAnswers(state.review,[items[0].id],[items[0]],[items[0].answer],'2026-10-18');
 const clean=validateState(state,lessons.map(l=>l.id));assert.equal(seedReview(clean,'2026-10-18')[items[0].id].due,'2026-10-19');
 assert.equal(reviewEntries(clean,'B1','2026-10-18')[0].dueNow,false);
 clean.review.unknown={due:'2026-10-18',stage:0};assert.equal(reviewEntries(clean).length,1);
});
test('Empty review explains how to begin without generating an empty quiz',()=>{
 const html=reviewPage(freshState(),()=>'',()=>{throw Error('Unexpected empty quiz');});assert.ok(html.includes('Aquí aparecerán tus errores'));
 assert.deepEqual(grammarItems('grammar/toString'),[]);assert.deepEqual(grammarItems('grammar/__proto__'),[]);
});
test('Review rotates past seen errors and preserves reading context',()=>{
 const state=freshState(),keys=[...questionIndex.values()].filter(q=>q.level==='B1').slice(0,12).map(q=>q.key);
 keys.forEach(key=>state.review[key]={due:'2020-01-01',stage:0});
 let first,second;
 reviewPage(state,()=>'',(_,items,selected)=>{first=selected;return '';});
 reviewPage(state,()=>'',(_,items,selected)=>{second=selected;return '';},new Set(first));
 assert.equal(first.length,8);assert.equal(second.slice(0,4).filter(key=>!first.includes(key)).length,4);
 const reading=[...questionIndex.values()].find(q=>q.key.startsWith('text/lib-b1-'));
 assert.ok(reading.question.referenceText.length>100);assert.ok(reading.question.referenceHref.startsWith('#text/'));
});
