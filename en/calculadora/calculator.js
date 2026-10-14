'use strict';
const DATA=JSON.parse(document.getElementById('talent-data').textContent);
const $=id=>document.getElementById(id);
const select=$('class-select');
for(const c of DATA.classes){const o=document.createElement('option');o.value=c.key;o.textContent=c.name;select.append(o);}
let cls=DATA.classes.find(c=>c.slug===new URLSearchParams(location.search).get('class'))?.key||'Warrior';
let level=30,legacy=5,useLegacy=true,ranks=[{},{},{}],inspection=null;
const cache={};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const trees=()=>DATA.talents[cls].trees;
const used=(a=ranks)=>a.reduce((sum,tree)=>sum+Object.values(tree).reduce((x,y)=>x+y,0),0);
const extra=()=>useLegacy?legacy:0;
const budget=()=>level-9+extra();
const needed=()=>used()?Math.max(10,used()-extra()+9):null;
function valid(a){
  if(!Array.isArray(a)||a.length!==3)return false;
  return trees().every((tree,i)=>{
    if(!a[i]||typeof a[i]!=='object'||Array.isArray(a[i]))return false;
    return Object.entries(a[i]).every(([name,rank])=>{
      const t=tree.talents.find(t=>t.name===name);
      if(!t||!Number.isInteger(rank)||rank<0||rank>t.max)return false;
      if(!rank)return true;
      const lower=tree.talents.reduce((n,x)=>n+(x.row<t.row?(a[i][x.name]||0):0),0);
      const req=t.req?tree.talents.find(x=>x.name===t.req):null;
      return lower>=(t.row-1)*5&&(!req||(a[i][t.req]||0)>=req.max);
    });
  });
}
function save(){cache[cls]=ranks;try{localStorage.setItem('forever-talents-v1',JSON.stringify({cache,level,legacy,useLegacy}));}catch{}}
function buildUrl(){const u=new URL(location.href);u.search='?class='+DATA.classes.find(c=>c.key===cls).slug;u.hash=encodeURIComponent(JSON.stringify({c:cls,l:level,g:legacy,e:useLegacy,a:ranks}));return u.href;}
function showInfo(t,i){
  inspection={t,i};const rank=ranks[i][t.name]||0;
  $('detail').innerHTML='<h3>'+esc(t.name)+' · '+rank+'/'+t.max+'</h3><p>'+esc(trees()[i].name)+' · row '+t.row+' · requires '+((t.row-1)*5)+' points in previous rows'+(t.req?' y '+esc(t.req)+' maxed out':'')+'.</p>'+t.desc.map((desc,index)=>'<p><strong>Rango '+(index+1)+(rank===index+1?' · current':'')+':</strong> '+esc(desc)+'</p>').join('');
}
function attempt(i,name,delta){
  const t=trees()[i].talents.find(t=>t.name===name);showInfo(t,i);
  const current=ranks[i][name]||0,next=current+delta;
  if(next<0||next>t.max){$('message').textContent=next<0?'This talent has no points.':'Talent maxed out.';return;}
  if(delta>0&&used()>=budget()){$('message').textContent='Limit of '+budget()+' points reached. Increase the maximum level or remove a point.';return;}
  const copy=ranks.map(a=>({...a}));copy[i][name]=next;
  if(!valid(copy)){$('message').textContent=delta>0?'Not enough points in previous rows, or the prerequisite is not maxed out.':'You cannot remove that point: another talent depends on it or its row.';return;}
  ranks=copy;save();render();$('message').textContent=delta>0?'Point added.':'Point removed.';
  const button=document.querySelector('[data-tree="'+i+'"][data-name="'+CSS.escape(name)+'"]');button?.focus({preventScroll:true});
}
function render(){
  select.value=cls;$('max-level').value=level;$('legacy-check').checked=useLegacy;$('legacy-points').value=legacy;$('legacy-points').disabled=!useLegacy;
  const c=DATA.classes.find(c=>c.key===cls);document.body.style.setProperty('--class-color',c.color);
  $('count').textContent=used()+' / '+budget()+' points · remaining '+(budget()-used());
  $('required-level').textContent='Reparto '+ranks.map(a=>Object.values(a).reduce((x,y)=>x+y,0)).join('/')+' · '+(needed()?'Required level: '+needed()+' con '+extra()+' Legacy':'No points assigned');
  $('guide-link').href='../'+c.slug+'/';$('external-calc').href='https://talentsforever.com/'+c.slug;
  $('build-url').value=buildUrl();
  $('trees').innerHTML=trees().map((tree,i)=>'<section class="tree"><h2>'+esc(tree.name)+' · '+Object.values(ranks[i]).reduce((a,b)=>a+b,0)+'</h2><div class="talent-grid">'+tree.talents.map(t=>{
    const rank=ranks[i][t.name]||0,test=ranks.map(a=>({...a}));test[i][t.name]=Math.min(rank+1,t.max);
    const locked=!valid(test)||used()>=budget();
    return '<div class="talent '+(locked?'locked ':'')+(rank===t.max?'maxed':'')+'" style="grid-row:'+t.row+';grid-column:'+t.col+'"><button class="add" data-tree="'+i+'" data-name="'+esc(t.name)+'" title="'+esc(t.name)+' · '+rank+'/'+t.max+(t.req?' · requires '+esc(t.req)+' maxed out':'')+'" aria-label="'+esc(t.name)+', '+rank+' de '+t.max+'; añadir punto"><img loading="lazy" alt="" src="https://wow.zamimg.com/images/wow/icons/large/'+encodeURIComponent(t.icon)+'.jpg"><span>'+esc(t.name)+'</span><span class="rank">'+rank+'/'+t.max+'</span></button><button class="minus" data-tree="'+i+'" data-name="'+esc(t.name)+'" data-minus="1" aria-label="Quitar punto de '+esc(t.name)+'">−</button></div>';
  }).join('')+'</div></section>').join('');
  $('presets').innerHTML=(DATA.presets[cls]||[]).map((b,i)=>'<button type="button" data-preset="'+i+'">Cargar: '+esc(b.name)+'</button>').join('');
  if(inspection)showInfo(inspection.t,inspection.i);
}
function limitsChanged(){
  const nl=Number($('max-level').value),ng=Number($('legacy-points').value),ne=$('legacy-check').checked;
  if(!Number.isInteger(nl)||nl<10||nl>60||!Number.isInteger(ng)||ng<0||ng>5){render();$('message').textContent='Nivel entre 10 y 60; Legacy entre 0 y 5.';return;}
  if(used()>nl-9+(ne?ng:0)){render();$('message').textContent='That limit cannot accommodate the current allocation. Remove points first or choose a higher level.';return;}
  level=nl;legacy=ng;useLegacy=ne;save();render();$('message').textContent='Limit updated: '+budget()+' points available.';
}
$('max-level').addEventListener('change',limitsChanged);$('legacy-points').addEventListener('change',limitsChanged);$('legacy-check').addEventListener('change',limitsChanged);
for(const id of ['max-level','legacy-points'])$(id).addEventListener('input',()=>{const nl=Number($('max-level').value),ng=Number($('legacy-points').value);if(Number.isInteger(nl)&&nl>=10&&nl<=60&&Number.isInteger(ng)&&ng>=0&&ng<=5)limitsChanged();});
$('trees').addEventListener('click',e=>{const b=e.target.closest('button[data-tree]');if(b)attempt(Number(b.dataset.tree),b.dataset.name,b.dataset.minus||e.shiftKey?-1:1);});
$('trees').addEventListener('contextmenu',e=>{const b=e.target.closest('button[data-tree]');if(b){e.preventDefault();attempt(Number(b.dataset.tree),b.dataset.name,-1);}});
select.addEventListener('change',()=>{save();cls=select.value;ranks=cache[cls]||[{},{},{}];if(!valid(ranks)||used()>budget())ranks=[{},{},{}];inspection=null;$('detail').innerHTML='<h3>Inspecciona un talento</h3><p>Pulsa un talento para consultar sus rangos.</p>';$('message').textContent='Clase: '+DATA.classes.find(c=>c.key===cls).name;save();render();});
$('reset').addEventListener('click',()=>{ranks=[{},{},{}];inspection=null;save();render();$('message').textContent='Allocation reset.';});
$('presets').addEventListener('click',e=>{const b=e.target.closest('[data-preset]');if(!b)return;const a=DATA.presets[cls][Number(b.dataset.preset)].allocation;if(!valid(a)){$('message').textContent='La propuesta no coincide con estos datos de beta; contrástala en la guía.';return;}if(used(a)>budget()){$('message').textContent='This suggestion uses 26 points. Increase the maximum level or enable Legacy.';return;}ranks=a.map(t=>({...t}));inspection=null;save();render();$('message').textContent='Propuesta cargada; puedes editarla.';});
$('share').addEventListener('click',async()=>{const input=$('build-url');try{if(navigator.clipboard&&isSecureContext)await navigator.clipboard.writeText(input.value);else{input.select();if(!document.execCommand('copy'))throw Error();}$('message').textContent='Link copied.';}catch{input.focus();input.select();$('message').textContent='Copy the selected link.';}});
try{const saved=JSON.parse(localStorage.getItem('forever-talents-v1')||'null');if(saved){Object.assign(cache,saved.cache||{});level=Math.max(10,Math.min(60,Number(saved.level)||30));legacy=Math.max(0,Math.min(5,Number(saved.legacy)||0));useLegacy=!!saved.useLegacy;ranks=cache[cls]||[{},{},{}];}}catch{}
if(location.hash){try{const b=JSON.parse(decodeURIComponent(location.hash.slice(1)));if(DATA.talents[b.c]&&Number.isInteger(b.l)&&b.l>=10&&b.l<=60&&Number.isInteger(b.g)&&b.g>=0&&b.g<=5){const prev={cls,level,legacy,useLegacy,ranks};cls=b.c;level=b.l;legacy=b.g;useLegacy=!!b.e;ranks=b.a;if(!valid(ranks)||used()>budget())({cls,level,legacy,useLegacy,ranks}=prev);}}catch{$('message').textContent='The link does not contain a valid build.';}}
if(!valid(ranks)||used()>budget())ranks=[{},{},{}];render();
