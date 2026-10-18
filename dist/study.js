import {lessons} from './content.js?v=d9b04d29540c';
import {library} from './practice.js?v=d9b04d29540c';
import {grammarBank,extraDrills,grammarTopics,isCorrect} from './grammar.js?v=d9b04d29540c';
import {lessonEnglish,topicEnglish} from './bilingual.js?v=d9b04d29540c';
import {visualTopics} from './visuals.js?v=d9b04d29540c';

export const searchText=value=>String(value??'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u0302\u0308]/g,'').normalize('NFC');
export const catalog=[
 ...lessons.map(l=>({id:l.id,type:'lesson',kind:'Unidad',level:l.level,title:l.title,description:l.goal,href:`#lesson/${l.id}`,text:[l.title,l.tag,l.goal,l.help,...l.sections.flatMap(s=>[s.title,s.text,...s.examples]),...(lessonEnglish[l.id]??[])].join(' ')})),
 ...grammarTopics.map(t=>({id:t.id,type:'grammar',kind:'Ficha de gramática',level:t.level,title:t.title,description:t.rule,href:`#topic/${t.id}`,text:[t.title,t.rule,t.trap,...t.examples,...Object.values(t.english??topicEnglish[t.id]??{})].join(' ')})),
 ...library.map(t=>({id:t.id,type:'reading',kind:'Lectura y escucha',level:t.level,title:t.title,description:`${t.text.split(/\s+/).length} palabras · ${t.questions.length} preguntas`,href:`#text/${t.id}`,text:[t.title,t.type,t.text,t.translation??'',t.taskEn??'',...(t.glossary??[]).flat()].join(' ')})),
 ...visualTopics.map(t=>({id:t.id,type:'visual',kind:'Esquema interactivo',level:'A2',title:t.title,description:t.scenes[0].explanation,href:`#visual/${t.id}`,text:[t.title,({pronouns:'pronombres pronouns direct indirect object',gustar:'gustar like likes agreement',time:'pasado past tense imperfect preterite future',identity:'ser estar hay identity location existence',agreement:'singular plural gender agreement',quantity:'muy mucho quantity very much many'})[t.id],...t.scenes.flatMap(s=>[s.sentence,s.explanation,s.english])].join(' ')}))
].map(item=>({...item,search:searchText(item.text)}));

export function searchCatalog(query,{level='all',type='all',currentLevel='B1'}={}){
 const terms=searchText(query).trim().split(/\s+/).filter(Boolean);
 return catalog.filter(item=>(level==='all'||item.level===level)&&(type==='all'||item.type===type)&&terms.every(term=>item.search.includes(term)))
 .sort((a,b)=>{
  const rank=item=>Number(item.level===currentLevel)+terms.reduce((n,t)=>n+(searchText(item.title).includes(t)?5:0),0);
  return rank(b)-rank(a);
 });
}

export const questionIndex=new Map([
 ...lessons.flatMap(l=>l.quiz.map((q,i)=>({key:`lesson/${l.id}/${i}`,level:l.level,title:l.title,href:`#lesson/${l.id}`,question:{...q,unit:l.id,area:'review'}}))),
 ...library.flatMap(t=>t.questions.map((q,i)=>({key:`text/${t.id}/${i}`,level:t.level,title:t.title,href:`#text/${t.id}`,question:{...q,area:'review',referenceText:t.text,referenceTitle:t.title,referenceHref:`#text/${t.id}`}}))),
 ...Object.entries(grammarBank).flatMap(([level,items])=>items.map(q=>({key:q.id,level,title:'Gramática '+level,href:`#lesson/${q.unit}`,question:q}))),
 ...Object.entries(extraDrills).flatMap(([level,items])=>items.map(q=>({key:q.id,level,title:'Práctica extra '+level,href:`#lesson/${q.unit}`,question:q})))
].map(item=>[item.key,item]));

export function dayKey(date=new Date()){
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function afterDays(day,days){const date=new Date(day+'T12:00:00');date.setDate(date.getDate()+days);return dayKey(date);}
export function activityKeys(id,items){
 if(id.startsWith('grammar/')||id.startsWith('drill/'))return items.map(q=>q.id);
 return items.map((_,i)=>`${id.startsWith('lib-')?'text':'lesson'}/${id}/${i}`);
}
export function scheduleAnswers(review,keys,items,answers,today=dayKey()){
 const next={...review};
 keys.forEach((key,i)=>{
  if(!questionIndex.has(key))return;
  if(!isCorrect(items[i],answers[i]))next[key]={due:today,stage:0};
  else if(next[key]&&next[key].due<=today){
   const stage=Math.min(4,next[key].stage+1);
   next[key]={due:afterDays(today,[0,1,3,7,14][stage]),stage};
  }
 });
 return next;
}
export function reviewEntries(state,level=state.level,today=dayKey()){
 return Object.entries(state.review??{}).flatMap(([key,schedule])=>{
  const item=questionIndex.get(key);
  return item&&item.level===level?[{...item,...schedule,dueNow:schedule.due<=today}]:[];
 }).sort((a,b)=>a.due.localeCompare(b.due)||a.key.localeCompare(b.key));
}
export function seedReview(state,today=dayKey()){
 const next={...state.review};
 const add=(keys,items,answers)=>{
  if(!Array.isArray(answers)||answers.length!==items.length)return;
  items.forEach((q,i)=>{if(!Object.hasOwn(next,keys[i])&&!isCorrect(q,answers[i]))next[keys[i]]={due:today,stage:0};});
 };
 for(const [level,items] of Object.entries(grammarBank))add(items.map(q=>q.id),items,state.grammarResults[level]?.at(-1)?.answers);
 for(const [level,items] of Object.entries(extraDrills))add(items.map(q=>q.id),items,state.drillResults[level]?.answers);
 for(const [id,result] of Object.entries(state.results)){
  const items=lessons.find(l=>l.id===id)?.quiz??library.find(t=>t.id===id)?.questions;
  if(items)add(activityKeys(id,items),items,result.answers);
 }
 return next;
}
export function studyPlan(state){
 const route=lessons.filter(l=>l.level===state.level),passed=id=>(state.results[id]?.percent??0)>=80;
 const resume=route.find(l=>l.id===state.lastLesson&&!passed(l.id));
 const lesson=resume??route.find(l=>!passed(l.id))??route[0];
 const reading=library.find(t=>t.level===state.level&&!passed(t.id))??library.find(t=>t.level===state.level);
 const due=reviewEntries(state).filter(q=>q.dueNow).length;
 const minutes=[10,15,25].includes(state.sessionMinutes)?state.sessionMinutes:15;
 const splits={10:[2,5,3],15:[3,7,5],25:[5,12,8]}[minutes];
 return {lesson,reading,due,minutes,steps:[
  {title:due?'Recupera tus errores':'Activa lo que ya sabes',description:due?`${due} preguntas pendientes en ${state.level}. Intenta recordarlas antes de abrir la explicación.`:'Elige una frase del esquema y cámbiala para hablar de tu vida.',href:due?'#review':'#visual',minutes:splits[0]},
  {title:lesson.title,description:'Estudia un contraste y compruébalo. Puedes repartir una unidad entre varias sesiones.',href:`#lesson/${lesson.id}`,minutes:splits[1]},
  {title:reading.title,description:'Lee o escucha un fragmento. Al cerrar el texto, resume una idea sin mirar.',href:`#text/${reading.id}`,minutes:splits[2]}
 ]};
}
