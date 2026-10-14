(function(){
var CH='muchamiel',KEY='mm-live2',root=document.documentElement,EN=root.lang==='en';
var URLS={tw:'https://www.twitch.tv/'+CH,kick:'https://kick.com/'+CH},NAMES={tw:'Twitch',kick:'Kick'};
function store(v){try{sessionStorage.setItem(KEY,JSON.stringify({t:Date.now(),v:v}))}catch(e){}}
function cached(){try{var c=JSON.parse(sessionStorage.getItem(KEY));if(c&&Date.now()-c.t<90000)return c.v}catch(e){}return null}
function chips(v){return ['tw','kick'].filter(function(p){return v[p]}).map(function(p){return '<a class="lp '+p+'" href="'+URLS[p]+'" target="_blank" rel="noopener noreferrer">'+NAMES[p]+'</a>'}).join('')}
function apply(v){var on=!!(v.tw||v.kick);root.classList.toggle('is-live',on);
document.querySelectorAll('a.live').forEach(function(a){a.textContent=on?'ONLINE':'OFFLINE';a.href=v.tw?URLS.tw:(v.kick?URLS.kick:URLS.tw);
a.title=on?(EN?'Muchamiel is live':'Muchamiel está en directo'):(EN?'Muchamiel is offline':'Muchamiel ahora no está en directo')});
document.querySelectorAll('.live-on').forEach(function(s){s.innerHTML=chips(v)});
document.querySelectorAll('.live-banner').forEach(function(b){var t=b.querySelector('.t');if(t)t.textContent=v.title||(EN?'Live now':'En directo ahora');var g=b.querySelector('.go');if(g)g.innerHTML=chips(v)})}
function txt(u){return fetch(u,{cache:'no-store'}).then(function(r){return r.ok?r.text():''}).catch(function(){return ''})}
function check(){var c=cached();if(c){apply(c);return}
Promise.all([txt('https://decapi.me/twitch/uptime/'+CH),fetch('https://kick.com/api/v2/channels/'+CH+'/livestream',{cache:'no-store'}).then(function(r){return r.ok?r.json():{}}).catch(function(){return {}})]).then(function(r){
var tw=!!r[0]&&!/offline|error|not found|invalid/i.test(r[0]),k=r[1]&&r[1].data?r[1].data:null,v={tw:tw,kick:!!k,title:k&&k.session_title||''};
if(tw&&!v.title)return txt('https://decapi.me/twitch/title/'+CH).then(function(t){v.title=t;store(v);apply(v)});store(v);apply(v)})}
document.querySelectorAll('.menu-btn').forEach(function(b){var m=b.parentNode;b.addEventListener('click',function(e){e.stopPropagation();var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o);if(!o)b.blur()})});document.addEventListener('click',function(){document.querySelectorAll('.menu.open').forEach(function(m){m.classList.remove('open');m.firstChild.setAttribute('aria-expanded','false');if(document.activeElement&&m.contains(document.activeElement))document.activeElement.blur()})});
check();setInterval(check,120000);
document.querySelectorAll('[data-twitch-followers]').forEach(function(el){txt('https://decapi.me/twitch/followcount/'+CH).then(function(t){var n=parseInt(t,10);if(n>0)el.textContent=n.toLocaleString(EN?'en-US':'es-ES')})});
document.querySelectorAll('[data-countdown]').forEach(function(el){var d=new Date(el.getAttribute('data-countdown')+'T00:00:00'),now=new Date(),days=Math.ceil((d-now)/864e5);
el.textContent=EN?(days>1?days+' days':days===1?'Tomorrow!':days>=-1?'Today!':'Finished'):(days>1?days+' días':days===1?'¡Mañana!':days>=-1?'¡Es hoy!':'Terminado')});
})();