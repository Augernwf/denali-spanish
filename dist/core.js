import {grammarBank,extraDrills,gradeGrammar} from './grammar.js?v=d9b04d29540c';
import {lessons} from './content.js?v=d9b04d29540c';
import {library,exams} from './practice.js?v=d9b04d29540c';

export const STORAGE_KEY='denali-spanish-v1';
export const freshState=()=>({version:1,level:'B1',english:false,results:{},ratings:{},drafts:{},reviewed:{},notes:'',examResults:{},grammarResults:{},drillResults:{},lastLesson:null,review:{},quizDrafts:{},sessionMinutes:15});
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const levels=['A2','B1','B2','C1'];
const forbiddenKeys=new Set(['__proto__','prototype','constructor']);
const isRecord=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const entries=value=>isRecord(value)?Object.entries(value):[];
const quizById=new Map([...lessons.map(item=>[item.id,item.quiz]),...library.map(item=>[item.id,item.questions])]);
const readingIds=new Set(library.map(item=>item.id));
const countWithin=(value,max)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.trunc(value))):0;
const validDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00.000Z'))&&new Date(value+'T00:00:00.000Z').toISOString().slice(0,10)===value;
const safeKey=(key,max)=>typeof key==='string'&&key.length<=max&&!key.split('/').some(part=>forbiddenKeys.has(part));
const boundedAnswers=value=>Array.isArray(value)&&value.length<=100&&Array.from(value).every(answer=>answer===null||(Number.isInteger(answer)&&answer>=0&&answer<=9)||(typeof answer==='string'&&answer.length<=100));

export function grade(items,answers){
  if(!Array.isArray(items)||!items.length||!Array.isArray(answers)||items.length!==answers.length||Array.from(items).some((item,i)=>!Array.isArray(item?.options)||!Number.isInteger(answers[i])||answers[i]<0||answers[i]>=item.options.length))throw new Error('Responde a todas las preguntas.');
  const correct=items.reduce((sum,item,i)=>sum+(answers[i]===item.answer?1:0),0);
  return {correct,total:items.length,percent:Math.round(100*correct/items.length),answers:[...answers]};
}

export function consolidated(state,id){return (state.results[id]?.percent??0)>=80;}

export function validateState(data,ids){
  if(!isRecord(data)||data.version!==1||!levels.includes(data.level))throw new Error('El archivo no es una copia compatible de Denali.');
  const clean=freshState(),lessonIds=new Set(Array.isArray(ids)?ids.filter(id=>safeKey(id,150)):[]);
  clean.level=data.level;
  clean.english=data.english===true;
  clean.lastLesson=lessonIds.has(data.lastLesson)?data.lastLesson:null;
  clean.notes=typeof data.notes==='string'?data.notes.slice(0,100000):'';
  clean.sessionMinutes=[10,15,25].includes(data.sessionMinutes)?data.sessionMinutes:15;

  for(const key of ['drafts','reviewed','ratings','results']){
    for(const [id,value] of entries(data[key])){
      if(!safeKey(id,150)||(!lessonIds.has(id)&&!readingIds.has(id)&&id!=='conversation'))continue;
      if(key==='drafts'&&typeof value==='string')clean.drafts[id]=value.slice(0,100000);
      if(key==='reviewed'&&typeof value==='boolean')clean.reviewed[id]=value;
      if(key==='ratings'&&Array.isArray(value)&&value.length===5&&Array.from(value).every(n=>Number.isInteger(n)&&n>=1&&n<=5))clean.ratings[id]=[...value];
      if(key==='results'&&isRecord(value)){
        const items=quizById.get(id),attempts=Number.isInteger(value.attempts)?Math.max(1,Math.min(10000,value.attempts)):1;
        if(!items)continue;
        // Old v1 backups have counts only. Newer ones can preserve and regrade the answer evidence.
        if(Object.hasOwn(value,'answers')){
          try{clean.results[id]={...grade(items,value.answers),attempts};}catch{}
        }else if(value.total===items.length&&Number.isInteger(value.correct)&&value.correct>=0&&value.correct<=value.total){
          clean.results[id]={correct:value.correct,total:value.total,percent:Math.round(100*value.correct/value.total),attempts};
        }
      }
    }
  }

  for(const level of levels){
    const item=isRecord(data.examResults)?data.examResults[level]:null;
    if(isRecord(item))clean.examResults[level]={reading:countWithin(item.reading,exams[level].reading),listening:countWithin(item.listening,exams[level].listening),notes:typeof item.notes==='string'?item.notes.slice(0,10000):'',model:typeof item.model==='string'?item.model.slice(0,300):''};
    const history=isRecord(data.grammarResults)?data.grammarResults[level]:null;
    if(Array.isArray(history))clean.grammarResults[level]=history.slice(-10).flatMap(attempt=>{
      try{
        if(!isRecord(attempt)||!boundedAnswers(attempt.answers))return [];
        const result=gradeGrammar(grammarBank[level],[...attempt.answers]);
        return [{...result,date:typeof attempt.date==='string'?attempt.date.slice(0,40):''}];
      }catch{return [];}
    });
    const drill=isRecord(data.drillResults)?data.drillResults[level]:null;
    try{if(isRecord(drill)&&boundedAnswers(drill.answers))clean.drillResults[level]=gradeGrammar(extraDrills[level],[...drill.answers]);}catch{}
  }

  for(const [id,item] of entries(data.review).slice(0,1000)){
    if(!safeKey(id,120)||!/^(?:(?:a2|b1|b2|c1)-[a-z0-9-]+|lesson\/[a-z0-9-]+\/\d+|text\/lib-(?:a2|b1|b2|c1)-[1-4]\/\d+)$/.test(id))continue;
    if(isRecord(item)&&validDay(item.due)&&Number.isInteger(item.stage)&&item.stage>=0&&item.stage<=4)clean.review[id]={due:item.due,stage:item.stage};
  }
  for(const [id,answers] of entries(data.quizDrafts).slice(0,1000)){
    if(!safeKey(id,150)||!boundedAnswers(answers))continue;
    if(lessonIds.has(id)||readingIds.has(id)||/^(?:grammar|drill)\/(?:A2|B1|B2|C1)(?:\/[a-z][a-z0-9-]*)?$/.test(id))clean.quizDrafts[id]=[...answers];
  }
  return clean;
}
