import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lessons,sources} from '../dist/content.js';
import {library,exams,rubric} from '../dist/practice.js';
import {grade,consolidated,freshState,validateState,escapeHtml} from '../dist/core.js';
import {grammarBank,grammarTopics,grammarItems,gradeGrammar,normalizeAnswer,isCorrect,areaNames} from '../dist/grammar.js';
import {extraDrills,extraLibrary} from '../dist/extra.js';
import {lessonEnglish,topicEnglish,examEnglish,questionEnglish} from '../dist/bilingual.js';
test('El curso incluye tres rutas, material completo y preguntas coherentes',()=>{
 assert.equal(lessons.length,26);assert.equal(new Set(lessons.map(l=>l.id)).size,26);
 for(const level of ['B1','B2','C1'])assert.ok(lessons.filter(l=>l.level===level).length>=8);
 for(const lesson of lessons){assert.ok(lesson.goal&&lesson.help&&lesson.speak&&lesson.write&&lesson.model);assert.ok(lesson.sections.length>=3);assert.ok(lesson.sections.every(s=>s.text.length>150&&s.examples.length>=2));assert.equal(lesson.quiz.length,6);assert.equal(lesson.chunks.length,4);}
 for(const item of [...lessons.flatMap(l=>l.quiz),...library.flatMap(l=>l.questions)]){assert.equal(item.options.length,3);assert.equal(new Set(item.options).size,3);assert.ok(item.answer>=0&&item.answer<3);assert.ok(item.why.length>30);}
});
test('La corrección distingue todo correcto, todo incorrecto e incompleto',()=>{
 for(const lesson of lessons){assert.equal(grade(lesson.quiz,lesson.quiz.map(q=>q.answer)).percent,100);assert.equal(grade(lesson.quiz,lesson.quiz.map(q=>(q.answer+1)%3)).percent,0);}
 assert.throws(()=>grade(lessons[0].quiz,[]));assert.throws(()=>grade(lessons[0].quiz,[0,1,2,3,0,1]));
});
test('El avance de ejercicios no exige autoevaluación oral ni redacción',()=>{
 const state=freshState(),id=lessons[0].id;assert.equal(consolidated(state,id),false);
 state.results[id]={percent:100};assert.equal(consolidated(state,id),true);
 state.ratings[id]=[3,3,3,3,2];state.reviewed[id]=true;assert.equal(consolidated(state,id),true);
 state.ratings[id]=[3,3,3,3,3];assert.equal(consolidated(state,id),true);
 state.results[id].percent=79;assert.equal(consolidated(state,id),false);
 state.ratings[id]=[];assert.equal(consolidated(state,id),false);
 state.results[id].percent=80;state.reviewed[id]=false;assert.equal(consolidated(state,id),true);
});
test('Las copias no confían en puntuaciones o campos arbitrarios',()=>{
 const state=freshState(),id=lessons[0].id;state.results[id]={correct:4,total:6,percent:100,attempts:2};state.drafts[id]='<script>alert(1)</script>';state.ratings[id]=[5,5,5,5,5];
 const clean=validateState(state,lessons.map(l=>l.id));assert.equal(clean.results[id].percent,67);assert.equal(clean.drafts[id],state.drafts[id]);assert.throws(()=>validateState({version:99},[]));
 assert.equal(escapeHtml('<img src=x onerror="1">'),'&lt;img src=x onerror=&quot;1&quot;&gt;');
 state.ratings[id]=[99,5,5,5,5];assert.equal(validateState(state,[id]).ratings[id],undefined);
});
test('Referencias, modelos y estructura coinciden con las fuentes consultadas',()=>{
 assert.ok(sources.every(s=>s.url.startsWith('https://')));assert.equal(exams.B1.reading,30);assert.equal(exams.B2.reading,36);assert.equal(exams.C1.reading,40);assert.equal(exams.C1.times[2],80);assert.ok(exams.C1.guide.includes('2024'));assert.equal(rubric.length,5);
 assert.equal(library.length,12);assert.ok(library.every(l=>l.questions.length>=4&&l.text.split(/\s+/).length>=150));
});
test('La aplicación usa rutas y activos relativos compatibles con GitHub Pages',()=>{
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.match(html,/lang="es"/);assert.match(html,/src="\.\/app.js(?:\?v=[\w-]+)?"/);assert.match(html,/href="\.\/style.css(?:\?v=[\w-]+)?"/);
 const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');assert.ok(!app.includes('fetch('));
});
test('Todos los módulos publicados utilizan la misma versión de activos',()=>{
 const root=new URL('../dist/',import.meta.url),html=fs.readFileSync(new URL('index.html',root),'utf8'),version=html.match(/app\.js\?v=([\w-]+)/)?.[1];assert.ok(version);
 assert.ok(html.includes(`style.css?v=${version}`));
 for(const match of html.matchAll(/(?:src|href)="\.\/([\w.-]+\.(?:js|css))(?:\?v=([\w-]+))?"/g)){assert.equal(match[2],version,`index.html loads ${match[1]}`);assert.ok(fs.existsSync(new URL(match[1],root)));}
 for(const file of fs.readdirSync(root).filter(n=>n.endsWith('.js'))){const text=fs.readFileSync(new URL(file,root),'utf8');for(const match of text.matchAll(/from\s+['"]\.\/([\w.-]+\.js)(?:\?v=([\w-]+))?['"]/g)){assert.equal(match[2],version,`${file} imports ${match[1]}`);assert.ok(fs.existsSync(new URL(match[1],root)));}}
});
test('Tres controles originales tienen 24 preguntas, áreas y unidades de repaso válidas',()=>{
 assert.equal(grammarTopics.length,18);const all=Object.values(grammarBank).flat();assert.equal(new Set(all.map(q=>q.id)).size,72);
 for(const [level,items] of Object.entries(grammarBank)){
  assert.equal(items.length,24);assert.equal(items.filter(q=>q.accepted).length,6);
  const answers=items.map(q=>q.options?q.answer:q.accepted[0]);assert.equal(gradeGrammar(items,answers).percent,100);
  for(const q of items){assert.ok(areaNames[q.area]);assert.ok(lessons.some(l=>l.id===q.unit));assert.ok(q.why.length>40);if(q.options)assert.equal(new Set(q.options).size,3);else assert.ok(q.accepted.every(a=>a.trim()));}
  const areas=[...new Set(items.map(q=>q.area))];for(const area of areas){assert.ok(grammarItems(`grammar/${level}/${area}`).every(q=>q.area===area));}
  assert.deepEqual(grammarItems(`grammar/${level}`),items);
 }
 assert.deepEqual(grammarItems('grammar/unknown'),[]);
 for(const t of grammarTopics)assert.ok(t.rule&&t.trap&&t.strategy&&t.examples.length>=3&&lessons.some(l=>l.id===t.unit));
});
test('Ayudas en inglés cubren todas las unidades, fichas y correcciones de gramática',()=>{
 for(const lesson of lessons){const sections=lessonEnglish[lesson.id];assert.equal(sections.length,lesson.sections.length);assert.ok(sections.every(s=>s.length>100));}
 for(const topic of grammarTopics){const en=topic.english??topicEnglish[topic.id];assert.ok(en.rule.length>70&&en.trap&&en.strategy);}
 for(const [level,items] of Object.entries(grammarBank)){assert.equal(examEnglish[level].length,items.length);assert.ok(items.every(q=>questionEnglish(q)?.length>30));}
});
test('El contenido adicional tiene respuestas coherentes y evidencia bilingüe',()=>{
 const ids=new Set();for(const [level,items] of Object.entries(extraDrills)){
  assert.equal(items.length,12);assert.equal(gradeGrammar(items,items.map(q=>q.options?q.answer:q.accepted[0])).percent,100);
  for(const q of items){assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(q.why&&q.whyEn&&areaNames[q.area]);assert.ok(lessons.some(l=>l.id===q.unit));}
  assert.equal(grammarItems(`drill/${level}`).length,12);for(const area of new Set(items.map(q=>q.area)))assert.equal(grammarItems(`drill/${level}/${area}`).length,6);
 }
 assert.equal(extraLibrary.length,6);for(const text of extraLibrary){assert.equal(text.questions.length,6);assert.ok(text.translation.split(/\s+/).length>100&&text.glossary.length>=4&&text.taskEn);assert.ok(text.questions.every(q=>q.whyEn));assert.equal(grade(text.questions,text.questions.map(q=>q.answer)).percent,100);}
 assert.equal(lessons.flatMap(l=>l.quiz).length+library.flatMap(l=>l.questions).length+Object.values(grammarBank).flat().length+Object.values(extraDrills).flat().length,324);
});
test('Las copias conservan nuevas lecturas y recalculan práctica extra sin alterar el examen antiguo',()=>{
 const state=freshState();state.drafts['lib-b2-4']='A source-faithful summary';state.results['lib-b2-4']={correct:5,total:6};state.drillResults.B2={answers:extraDrills.B2.map(q=>q.options?q.answer:q.accepted[0]),percent:0};
 const clean=validateState(state,lessons.map(l=>l.id));assert.equal(clean.drafts['lib-b2-4'],state.drafts['lib-b2-4']);assert.equal(clean.results['lib-b2-4'].percent,83);assert.equal(clean.drillResults.B2.percent,100);
 assert.equal(grammarBank.B1[0].id,'b1-g1');assert.equal(grammarBank.B1.length,24);
 const old=freshState();delete old.drillResults;assert.deepEqual(validateState(old,[]).drillResults,{});
});
test('El corrector escrito respeta tildes y ñ y admite variantes explícitas',()=>{
 const photos=grammarBank.B1.find(q=>q.id==='b1-g18');assert.equal(isCorrect(photos,'las'),true);assert.equal(isCorrect(photos,'se las'),true);assert.equal(isCorrect(photos,'le las'),false);assert.ok(questionEnglish(photos).includes('Both las and se las'));
 assert.equal(normalizeAnswer('  HABÍA. '),'había');assert.notEqual(normalizeAnswer('ano'),normalizeAnswer('año'));
 assert.equal(normalizeAnswer('habi\u0301a'),normalizeAnswer('había'));
 const q=grammarBank.B2.find(q=>q.accepted?.includes('llamase'));assert.equal(isCorrect(q,'LLAMASE.'),true);assert.equal(isCorrect(q,'llamara'),true);
 const accent=grammarBank.B1.find(q=>q.accepted?.includes('viajaría'));assert.equal(isCorrect(accent,'viajaria'),false);
 const items=grammarBank.B1,answers=items.map(q=>q.options?q.answer:q.accepted[0]);answers[0]=(items[0].answer+1)%3;answers[3]='caros';
 const result=gradeGrammar(items,answers);assert.equal(result.correct,22);assert.deepEqual(result.areas.base,{correct:2,total:4});
 assert.throws(()=>gradeGrammar(items,[]));answers[3]=' ';assert.throws(()=>gradeGrammar(items,answers));
});
test('Historial de gramática recalculado y copias antiguas compatibles',()=>{
 const state=freshState(),answers=grammarBank.B1.map(q=>q.options?q.answer:q.accepted[0]);answers[0]=(answers[0]+1)%3;
 state.grammarResults.B1=Array.from({length:12},()=>({answers,correct:24,percent:100,areas:{},date:'2026-10-10'}));
 let clean=validateState(state,lessons.map(l=>l.id));assert.equal(clean.grammarResults.B1.length,10);assert.equal(clean.grammarResults.B1[0].correct,23);assert.equal(clean.grammarResults.B1[0].areas.base.correct,3);
 state.grammarResults.B2=[{answers:[],percent:100}];clean=validateState(state,[]);assert.deepEqual(clean.grammarResults.B2,[]);
 delete state.grammarResults;assert.deepEqual(validateState(state,[]).grammarResults,{});
});
