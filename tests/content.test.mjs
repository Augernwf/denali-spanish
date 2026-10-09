import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lessons,sources} from '../dist/content.js';
import {library,exams,rubric} from '../dist/practice.js';
import {grade,consolidated,freshState,validateState,escapeHtml} from '../dist/core.js';
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
test('La consolidación exige comprensión, cinco dimensiones orales y escritura revisada',()=>{
 const state=freshState(),id=lessons[0].id;assert.equal(consolidated(state,id),false);
 state.results[id]={percent:100};assert.equal(consolidated(state,id),false);
 state.ratings[id]=[3,3,3,3,2];state.reviewed[id]=true;assert.equal(consolidated(state,id),false);
 state.ratings[id]=[3,3,3,3,3];assert.equal(consolidated(state,id),true);
 state.results[id].percent=79;assert.equal(consolidated(state,id),false);
 state.ratings[id]=[];assert.equal(consolidated(state,id),false);
});
test('Las copias no confían en puntuaciones o campos arbitrarios',()=>{
 const state=freshState(),id=lessons[0].id;state.results[id]={correct:4,total:6,percent:100,attempts:2};state.drafts[id]='<script>alert(1)</script>';state.ratings[id]=[5,5,5,5,5];
 const clean=validateState(state,lessons.map(l=>l.id));assert.equal(clean.results[id].percent,67);assert.equal(clean.drafts[id],state.drafts[id]);assert.throws(()=>validateState({version:99},[]));
 assert.equal(escapeHtml('<img src=x onerror="1">'),'&lt;img src=x onerror=&quot;1&quot;&gt;');
 state.ratings[id]=[99,5,5,5,5];assert.equal(validateState(state,[id]).ratings[id],undefined);
});
test('Referencias, modelos y estructura coinciden con las fuentes consultadas',()=>{
 assert.ok(sources.every(s=>s.url.startsWith('https://')));assert.equal(exams.B1.reading,30);assert.equal(exams.B2.reading,36);assert.equal(exams.C1.reading,40);assert.equal(exams.C1.times[2],80);assert.ok(exams.C1.guide.includes('2024'));assert.equal(rubric.length,5);
 assert.equal(library.length,6);assert.ok(library.every(l=>l.questions.length===4&&l.text.split(/\s+/).length>=150));
});
test('La aplicación usa rutas y activos relativos compatibles con GitHub Pages',()=>{
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.match(html,/lang="es"/);assert.match(html,/src="\.\/app.js"/);assert.match(html,/href="\.\/style.css"/);
 const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');assert.ok(!app.includes('fetch('));
});
