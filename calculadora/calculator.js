'use strict';
const DATA=JSON.parse(document.getElementById('talent-data').textContent);
const $=id=>document.getElementById(id);
const select=$('class-select');
for(const c of DATA.classes){const o=document.createElement('option');o.value=c.key;o.textContent=c.name;select.append(o);}
let cls=DATA.classes.find(c=>c.slug===new URLSearchParams(location.search).get('class'))?.key||'Warrior';
let level=60,legacy=0,useLegacy=false,ranks=[{},{},{}],inspection=null;
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
function save(){cache[cls]=ranks;try{localStorage.setItem('forever-talents-v2',JSON.stringify({cache,level,legacy,useLegacy}));}catch{}}
function buildUrl(){const u=new URL(location.href);u.search='?class='+DATA.classes.find(c=>c.key===cls).slug;u.hash=encodeURIComponent(JSON.stringify({c:cls,l:level,g:legacy,e:useLegacy,a:ranks}));return u.href;}
function showInfo(t,i){
  inspection={t,i};const rank=ranks[i][t.name]||0;
  $('detail').innerHTML='<h3>'+esc(t.name)+' · '+rank+'/'+t.max+'</h3><p>'+esc(trees()[i].name)+' · fila '+t.row+' · requiere '+((t.row-1)*5)+' puntos en filas anteriores'+(t.req?' y '+esc(t.req)+' al máximo':'')+'.</p>'+t.desc.map((desc,index)=>'<p><strong>Rango '+(index+1)+(rank===index+1?' · actual':'')+':</strong> '+esc(desc)+'</p>').join('');
}
function attempt(i,name,delta){
  const t=trees()[i].talents.find(t=>t.name===name);showInfo(t,i);
  const current=ranks[i][name]||0,next=current+delta;
  if(next<0||next>t.max){$('message').textContent=next<0?'Este talento no tiene puntos.':'Talento al máximo.';return;}
  if(delta>0&&used()>=budget()){$('message').textContent='Límite de '+budget()+' puntos alcanzado. Aumenta el nivel máximo o retira un punto.';return;}
  const copy=ranks.map(a=>({...a}));copy[i][name]=next;
  if(!valid(copy)){$('message').textContent=delta>0?'Faltan puntos en filas anteriores o el prerrequisito al máximo.':'No puedes quitar ese punto: otro talento depende de él o de su fila.';return;}
  ranks=copy;save();render();$('message').textContent=delta>0?'Punto añadido.':'Punto retirado.';
  const button=document.querySelector('[data-tree="'+i+'"][data-name="'+CSS.escape(name)+'"]');button?.focus({preventScroll:true});
}
function render(){
  select.value=cls;$('max-level').value=level;$('legacy-check').checked=useLegacy;$('legacy-points').value=legacy;$('legacy-points').disabled=!useLegacy;
  const c=DATA.classes.find(c=>c.key===cls);document.body.style.setProperty('--class-color',c.color);
  $('count').textContent=used()+' / '+budget()+' puntos · quedan '+(budget()-used());
  $('required-level').textContent='Reparto '+ranks.map(a=>Object.values(a).reduce((x,y)=>x+y,0)).join('/')+' · '+(needed()?'Nivel necesario: '+needed()+' con '+extra()+' Legacy':'Sin puntos asignados');
  $('guide-link').href='../'+c.slug+'/';$('external-calc').href='https://talentsforever.com/'+c.slug;
  $('build-url').value=buildUrl();
  $('trees').innerHTML=trees().map((tree,i)=>'<section class="tree"><h2>'+esc(tree.name)+' · '+Object.values(ranks[i]).reduce((a,b)=>a+b,0)+'</h2><div class="talent-grid">'+tree.talents.map(t=>{
    const rank=ranks[i][t.name]||0,test=ranks.map(a=>({...a}));test[i][t.name]=Math.min(rank+1,t.max);
    const locked=!valid(test)||used()>=budget();
    return '<div class="talent '+(locked?'locked ':'')+(rank===t.max?'maxed':'')+'" style="grid-row:'+t.row+';grid-column:'+t.col+'"><button class="add" data-tree="'+i+'" data-name="'+esc(t.name)+'" title="'+esc(t.name)+' · '+rank+'/'+t.max+(t.req?' · requiere '+esc(t.req)+' al máximo':'')+'" aria-label="'+esc(t.name)+', '+rank+' de '+t.max+'; añadir punto"><img loading="lazy" alt="" src="https://wow.zamimg.com/images/wow/icons/large/'+encodeURIComponent(t.icon)+'.jpg"><span>'+esc(t.name)+'</span><span class="rank">'+rank+'/'+t.max+'</span></button><button class="minus" data-tree="'+i+'" data-name="'+esc(t.name)+'" data-minus="1" aria-label="Quitar punto de '+esc(t.name)+'">−</button></div>';
  }).join('')+'</div></section>').join('');
  $('presets').innerHTML=(DATA.presets[cls]||[]).map((b,i)=>'<button type="button" data-preset="'+i+'">Cargar: '+esc(b.name)+'</button>').join('');
  if(inspection)showInfo(inspection.t,inspection.i);
}
function limitsChanged(){
  const nl=Number($('max-level').value),ng=Number($('legacy-points').value),ne=$('legacy-check').checked;
  if(!Number.isInteger(nl)||nl<10||nl>60||!Number.isInteger(ng)||ng<0||ng>5){render();$('message').textContent='Nivel entre 10 y 60; Legacy entre 0 y 5.';return;}
  if(used()>nl-9+(ne?ng:0)){render();$('message').textContent='Ese límite no alcanza para el reparto actual. Retira puntos primero o elige un nivel mayor.';return;}
  level=nl;legacy=ng;useLegacy=ne;save();render();$('message').textContent='Límite actualizado: '+budget()+' puntos disponibles.';
}
$('max-level').addEventListener('change',limitsChanged);$('legacy-points').addEventListener('change',limitsChanged);$('legacy-check').addEventListener('change',limitsChanged);
for(const id of ['max-level','legacy-points'])$(id).addEventListener('input',()=>{const nl=Number($('max-level').value),ng=Number($('legacy-points').value);if(Number.isInteger(nl)&&nl>=10&&nl<=60&&Number.isInteger(ng)&&ng>=0&&ng<=5)limitsChanged();});
$('trees').addEventListener('click',e=>{const b=e.target.closest('button[data-tree]');if(b)attempt(Number(b.dataset.tree),b.dataset.name,b.dataset.minus||e.shiftKey?-1:1);});
$('trees').addEventListener('contextmenu',e=>{const b=e.target.closest('button[data-tree]');if(b){e.preventDefault();attempt(Number(b.dataset.tree),b.dataset.name,-1);}});
select.addEventListener('change',()=>{save();cls=select.value;ranks=cache[cls]||[{},{},{}];if(!valid(ranks)||used()>budget())ranks=[{},{},{}];inspection=null;$('detail').innerHTML='<h3>Inspecciona un talento</h3><p>Pulsa un talento para consultar sus rangos.</p>';$('message').textContent='Clase: '+DATA.classes.find(c=>c.key===cls).name;save();render();});
$('reset').addEventListener('click',()=>{ranks=[{},{},{}];inspection=null;save();render();$('message').textContent='Reparto reiniciado.';});
$('presets').addEventListener('click',e=>{const b=e.target.closest('[data-preset]');if(!b)return;const a=DATA.presets[cls][Number(b.dataset.preset)].allocation;if(!valid(a)){$('message').textContent='La propuesta no coincide con estos datos de beta; contrástala en la guía.';return;}if(used(a)>budget()){$('message').textContent='Esta propuesta usa 26 puntos. Aumenta el nivel máximo o activa Legacy.';return;}ranks=a.map(t=>({...t}));inspection=null;save();render();$('message').textContent='Propuesta cargada; puedes editarla.';});
$('share').addEventListener('click',async()=>{const input=$('build-url');try{if(navigator.clipboard&&isSecureContext)await navigator.clipboard.writeText(input.value);else{input.select();if(!document.execCommand('copy'))throw Error();}$('message').textContent='Enlace copiado: pégalo en el chat.';}catch{input.focus();input.select();$('message').textContent='Copia el enlace seleccionado.';}});
try{const v2=JSON.parse(localStorage.getItem('forever-talents-v2')||'null'),saved=v2||JSON.parse(localStorage.getItem('forever-talents-v1')||'null');if(saved){Object.assign(cache,saved.cache||{});if(v2){level=Math.max(10,Math.min(60,Number(saved.level)||60));legacy=Math.max(0,Math.min(5,Number(saved.legacy)||0));useLegacy=!!saved.useLegacy;}ranks=cache[cls]||[{},{},{}];}}catch{}
if(location.hash){try{const b=JSON.parse(decodeURIComponent(location.hash.slice(1)));if(DATA.talents[b.c]&&Number.isInteger(b.l)&&b.l>=10&&b.l<=60&&Number.isInteger(b.g)&&b.g>=0&&b.g<=5){const prev={cls,level,legacy,useLegacy,ranks};cls=b.c;level=b.l;legacy=b.g;useLegacy=!!b.e;ranks=b.a;if(!valid(ranks)||used()>budget())({cls,level,legacy,useLegacy,ranks}=prev);}}catch{$('message').textContent='El enlace no contiene una build válida.';}}
if(!valid(ranks)||used()>budget())ranks=[{},{},{}];render();
