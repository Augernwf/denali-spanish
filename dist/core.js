export const STORAGE_KEY='denali-spanish-v1';
export const freshState=()=>({version:1,level:'B1',english:false,results:{},ratings:{},drafts:{},reviewed:{},notes:'',examResults:{},lastLesson:null});
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function grade(items,answers){
  if(items.length!==answers.length||answers.some((a,i)=>!Number.isInteger(a)||a<0||a>=items[i].options.length)) throw new Error('Responde a todas las preguntas.');
  const correct=items.reduce((sum,item,i)=>sum+(answers[i]===item.answer?1:0),0);
  return {correct,total:items.length,percent:Math.round(100*correct/items.length),answers};
}
export function consolidated(state,id){return (state.results[id]?.percent??0)>=80&&state.ratings[id]?.length===5&&state.ratings[id].every(n=>n>=3)&&state.reviewed[id]===true;}
export function validateState(data,ids){
  if(!data||data.version!==1||!['B1','B2','C1'].includes(data.level))throw new Error('El archivo no es una copia compatible de Denali.');
  const clean=freshState();clean.level=data.level;clean.english=data.english===true;
  clean.lastLesson=ids.includes(data.lastLesson)?data.lastLesson:null;
  clean.notes=typeof data.notes==='string'?data.notes.slice(0,100000):'';
  for(const key of ['drafts','reviewed','ratings','results']){
    for(const [id,value] of Object.entries(data[key]??{})){
      if(!ids.includes(id)&&!/^lib-(b1|b2|c1)-[12]$/.test(id)&&id!=='conversation')continue;
      if(key==='drafts'&&typeof value==='string')clean[key][id]=value.slice(0,100000);
      if(key==='reviewed'&&typeof value==='boolean')clean[key][id]=value;
      if(key==='ratings'&&Array.isArray(value)&&value.length===5&&value.every(n=>Number.isInteger(n)&&n>=1&&n<=5))clean[key][id]=value;
      if(key==='results'&&value&&Number.isInteger(value.total)&&value.total>0&&value.total<=100&&Number.isInteger(value.correct)&&value.correct>=0&&value.correct<=value.total){
        clean[key][id]={correct:value.correct,total:value.total,percent:Math.round(100*value.correct/value.total),attempts:Number.isInteger(value.attempts)?Math.max(1,Math.min(10000,value.attempts)):1};
      }
    }
  }
  for(const level of ['B1','B2','C1']){
    const item=data.examResults?.[level];
    if(item&&typeof item==='object')clean.examResults[level]={reading:typeof item.reading==='number'?Math.max(0,Math.min(40,item.reading)):0,listening:typeof item.listening==='number'?Math.max(0,Math.min(30,item.listening)):0,notes:typeof item.notes==='string'?item.notes.slice(0,10000):'',model:typeof item.model==='string'?item.model.slice(0,300):''};
  }
  return clean;
}
