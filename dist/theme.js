// Apply the preference before styles load; keep it independent of study progress.
(() => {
  const key='denali-appearance-v1', root=document.documentElement;
  const system=window.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try {preference=localStorage.getItem(key);} catch {}
  if(!['light','dark'].includes(preference))preference=null;
  function apply(theme){
    const dark=theme==='dark';
    root.dataset.theme=theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#211a24':'#fff8fa');
    const button=document.getElementById('theme-toggle');
    if(!button)return;
    button.setAttribute('aria-pressed',String(dark));
    const action=dark?'Cambiar a modo día · Switch to light mode':'Cambiar a modo noche · Switch to dark mode';
    button.setAttribute('aria-label',action);button.title=action;
    button.querySelector('.theme-symbol').textContent=dark?'☾':'☀';
    button.querySelector('.theme-label').textContent=dark?'Noche':'Día';
  }
  apply(preference??(system.matches?'dark':'light'));
  document.addEventListener('DOMContentLoaded',()=>{
    apply(root.dataset.theme);
    document.getElementById('theme-toggle').addEventListener('click',()=>{
      preference=root.dataset.theme==='dark'?'light':'dark';
      apply(preference);
      try {localStorage.setItem(key,preference);} catch {}
    });
  });
  system.addEventListener('change',event=>{if(!preference)apply(event.matches?'dark':'light');});
})();
