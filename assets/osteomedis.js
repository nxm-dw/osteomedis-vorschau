
(function(){
"use strict";
var RM   = matchMedia("(prefers-reduced-motion: reduce)").matches;
var FINE = matchMedia("(pointer:fine)").matches;
var $  = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
var clamp = function(v,a,b){ return v<a?a:(v>b?b:v); };
var tickFns = [];
(function tick(){ for (var i=0;i<tickFns.length;i++) tickFns[i](); requestAnimationFrame(tick); })();

var PAL = {rgb:"217,179,108", rgb2:"242,220,169", bg:"10,14,20"};
function hexToRgb(x){
x = String(x).trim().replace("#","");
if (x.length === 3) x = x[0]+x[0]+x[1]+x[1]+x[2]+x[2];
var v = parseInt(x,16);
return ((v>>16)&255)+","+((v>>8)&255)+","+(v&255);
}
(function(){
var cs = getComputedStyle(document.documentElement);
var a = cs.getPropertyValue("--inf-rgb").trim(), b = cs.getPropertyValue("--inf-rgb-2").trim();
if (a) PAL.rgb = a;
if (b) PAL.rgb2 = b;
try { PAL.bg = hexToRgb(cs.getPropertyValue("--inf-bg")); } catch(e){}
})();

(function(){
var nav = $(".snav"); if (!nav) return;
var last = 0;
window.addEventListener("scroll", function(){
var y = window.scrollY;
nav.classList.toggle("compact", y > 120);
last = y;
}, {passive:true});
$$(".navlinks").forEach(function(ul){
var hi = $(".navhi", ul); if (!hi) return;
function move(a){
hi.style.width = a.offsetWidth + "px";
hi.style.transform = "translateX(" + a.offsetLeft + "px)";
hi.style.opacity = "1";
}
$$("a", ul).forEach(function(a){
a.addEventListener("pointerenter", function(){ move(a); });
a.addEventListener("focus", function(){ move(a); });
});
ul.addEventListener("pointerleave", function(){ hi.style.opacity = "0"; });
ul.addEventListener("focusout", function(){ hi.style.opacity = "0"; });
var cur = $('a[aria-current="page"]', ul);
if (cur) cur.classList.add("is-current");
});
})();

var io = null;
if ("IntersectionObserver" in window && !RM){
io = new IntersectionObserver(function(en){
en.forEach(function(e){
if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
});
}, {rootMargin:"0px 0px -10% 0px", threshold:0.06});
}
$$(".fade, h1, h2, .quote").forEach(function(el){
if (!io){ el.classList.add("in"); return; }
io.observe(el);
});
setTimeout(function(){
$$(".hero .fade, .hero h1, .pagehero .fade, .pagehero h1").forEach(function(el){
el.classList.add("in");
});
}, 60);

$$(".acc, .faq").forEach(function(group){
var items = $$("details", group);
items.forEach(function(d){
d.addEventListener("toggle", function(){
if (!d.open) return;
items.forEach(function(o){ if (o !== d) o.open = false; });
});
});
});

(function(){
var t = $("#mq1"); if (!t) return;
var M = ["Osteopathie","Chiropraktik","Stoßwellentherapie","Hochenergie-Induktion",
"Dry Needling","Akupunktur","Myofasziale Techniken","Triggerpunkt-Therapie",
"Elektrotherapie","Schröpfen","Kiefer & CMD","Infusionstherapie"];
var html = M.map(function(m){ return "<span>"+m+"</span>"; }).join("");
t.innerHTML = html + html;
var btn = $("#mqPause"); if (!btn) return;
if (RM){ t.classList.add("paused"); btn.setAttribute("aria-pressed","true");
$(".mq-txt", btn).textContent = "Laufband starten"; }
btn.addEventListener("click", function(){
var p = t.classList.toggle("paused");
btn.setAttribute("aria-pressed", String(p));
$(".mq-txt", btn).textContent = p ? "Laufband starten" : "Laufband anhalten";
});
})();

if (FINE && !RM){
var mag = $$("[data-magnetic]").map(function(el){
return {el:el, tx:0, ty:0, cx:0, cy:0, rect:null};
});
if (mag.length){
var stale = true;
function invalidate(){ stale = true; }
window.addEventListener("scroll", invalidate, {passive:true});
window.addEventListener("resize", invalidate);
document.addEventListener("pointermove", function(e){
if (stale){
for (var i=0;i<mag.length;i++) mag[i].rect = mag[i].el.getBoundingClientRect();
stale = false;
}
for (var j=0;j<mag.length;j++){
var m = mag[j], r = m.rect;
if (!r || !r.width || m.el.offsetParent === null){ m.tx=0; m.ty=0; continue; }
var dx = e.clientX - (r.left + r.width/2), dy = e.clientY - (r.top + r.height/2);
if (Math.sqrt(dx*dx + dy*dy) < r.width*0.95 + 60){ m.tx = dx*0.2; m.ty = dy*0.2; }
else { m.tx = 0; m.ty = 0; }
}
}, {passive:true});
tickFns.push(function(){
for (var i=0;i<mag.length;i++){
var m = mag[i];
m.cx += (m.tx-m.cx)*0.11; m.cy += (m.ty-m.cy)*0.11;
if (Math.abs(m.cx) < 0.05 && Math.abs(m.cy) < 0.05 && m.tx === 0 && m.ty === 0){
if (m.el.style.transform) m.el.style.transform = "";
} else {
m.el.style.transform = "translate("+m.cx.toFixed(2)+"px,"+m.cy.toFixed(2)+"px)";
}
}
});
}
}

if (FINE && !RM){
var cur = $("#cursor");
if (cur){
var cx=0, cy=0, mx=0, my=0;
document.addEventListener("pointermove", function(e){
mx=e.clientX; my=e.clientY; cur.classList.add("on");
});
document.addEventListener("pointerleave", function(){ cur.classList.remove("on"); });
tickFns.push(function(){
cx += (mx-cx)*0.18; cy += (my-cy)*0.18;
cur.style.transform = "translate("+cx.toFixed(1)+"px,"+cy.toFixed(1)+"px)";
});
document.addEventListener("pointerover", function(e){
var hit = e.target.closest ? e.target.closest("button,a,summary,[data-cursor],.topic,.mix") : null;
cur.classList.toggle("big", !!hit);
});
}
}

(function(){
var cv = $("#palp"); if (!cv) return;
var cvF = $("#palpFront");                       
var ctx = cv.getContext("2d");
var ctxF = cvF ? cvF.getContext("2d") : null;
var w=0,h=0,dpr=1,t=0;
var px=-9999, py=-9999, tx=-9999, ty=-9999, auto=!FINE;
function size(){
var r = cv.getBoundingClientRect();
dpr = Math.min(devicePixelRatio||1, 2);
w = Math.max(1,Math.round(r.width)); h = Math.max(1,Math.round(r.height));
cv.width = w*dpr; cv.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
if (cvF){ cvF.width = w*dpr; cvF.height = h*dpr; ctxF.setTransform(dpr,0,0,dpr,0,0); }
}
size(); window.addEventListener("resize", size);
cv.parentElement.addEventListener("pointermove", function(e){
var r = cv.getBoundingClientRect(); tx = e.clientX-r.left; ty = e.clientY-r.top; auto=false;
});
cv.parentElement.addEventListener("pointerleave", function(){ auto = true; });
var LINES = 26, STEP = 16, R = 215, AMP = 84;

var SOFT = cv.closest(".pagehero") ? 0.35 : 1;
var figur = cv.parentElement.querySelector(".hero-figur");
tickFns.push(function(){
var r = cv.getBoundingClientRect();
if (r.bottom < 0 || r.top > window.innerHeight) return;
t += RM ? 0 : 0.006;
if (auto){ tx = w*(0.5 + 0.32*Math.cos(t*0.85)); ty = h*(0.52 + 0.26*Math.sin(t*1.25)); }
px += (tx-px)*0.07; py += (ty-py)*0.07;
ctx.clearRect(0,0,w,h);
if (ctxF) ctxF.clearRect(0,0,w,h);

var fx=0, fy=0, frx=0, fry=0, hatFigur=false;
if (figur && figur.offsetParent){
var fr = figur.getBoundingClientRect();
fx = fr.left - r.left + fr.width*0.50;
fy = fr.top  - r.top  + fr.height*0.42;
frx = fr.width*0.46; fry = fr.height*0.50;
hatFigur = frx > 20 && fry > 20;
}
var glow = ctx.createRadialGradient(px,py,0,px,py,R*1.5);
glow.addColorStop(0,"rgba(71,164,198,"+(0.13*SOFT).toFixed(3)+")");
glow.addColorStop(0.55,"rgba(71,164,198,"+(0.05*SOFT).toFixed(3)+")");
glow.addColorStop(1,"rgba(71,164,198,0)");
ctx.fillStyle = glow; ctx.fillRect(0,0,w,h);
var gap = h/(LINES-1);
for (var i=0;i<LINES;i++){
var y0 = i*gap;
var pfad = new Path2D();
for (var x=0;x<=w+STEP;x+=STEP){
var dx = x-px, dy = y0-py, d2 = dx*dx + dy*dy;
var f = Math.exp(-d2/(2*R*R));
var y = y0 + (dy>=0?1:-1)*f*AMP + Math.sin(x*0.0055 + t*1.5 + i*0.42)*7;
if (hatFigur){

var ex = (x-fx)/frx, ey = (y0-fy)/fry;
var g = Math.exp(-(ex*ex + ey*ey)*1.15);
y += (ey>=0?1:-1) * g * 82;
}
if (x===0) pfad.moveTo(x,y); else pfad.lineTo(x,y);
}
var fade = (0.13 + 0.34*Math.sin((i/(LINES-1))*Math.PI)) * SOFT;
ctx.lineWidth = 1;
ctx.strokeStyle = "rgba(15,86,115," + fade.toFixed(3) + ")";
ctx.stroke(pfad);

if (hatFigur && ctxF){

var scan = fy + Math.sin(t*0.5) * fry * 1.02;
var nah = Math.exp(-Math.pow((y0 - scan)/(fry*0.20), 2));
for (var k=0;k<2;k++){
var sk = k ? 0.74 : 1.12;
var el = new Path2D();
el.ellipse(fx, fy, frx*sk, fry*sk, 0, 0, Math.PI*2);
ctxF.save(); ctxF.clip(el);
var a = fade*(k?2.6:1.7) + nah*(k?0.34:0.24);
ctxF.strokeStyle = "rgba(71,164,198," + Math.min(a,0.95).toFixed(3) + ")";
ctxF.lineWidth = (k ? 1.45 : 1.2) + nah*1.1;
ctxF.stroke(pfad);
ctxF.restore();
}

var zw = new Path2D();
for (var x2=0;x2<=w+STEP;x2+=STEP){
var y1 = y0 + gap*0.5;
var dx2 = x2-px, dy2 = y1-py;
var f2 = Math.exp(-(dx2*dx2 + dy2*dy2)/(2*R*R));
var yy = y1 + (dy2>=0?1:-1)*f2*AMP + Math.sin(x2*0.0055 + t*1.5 + i*0.42)*7;
var ex2 = (x2-fx)/frx, ey2 = (y1-fy)/fry;
var g2 = Math.exp(-(ex2*ex2 + ey2*ey2)*1.15);
yy += (ey2>=0?1:-1) * g2 * 82;
if (x2===0) zw.moveTo(x2,yy); else zw.lineTo(x2,yy);
}
var elz = new Path2D();
elz.ellipse(fx, fy, frx*0.86, fry*0.88, 0, 0, Math.PI*2);
ctxF.save(); ctxF.clip(elz);
ctxF.strokeStyle = "rgba(71,164,198," + (fade*1.15).toFixed(3) + ")";
ctxF.lineWidth = 0.8; ctxF.stroke(zw); ctxF.restore();
}
}

if (hatFigur && ctxF){
var sy = fy + Math.sin(t*0.5) * fry * 1.02;
var elS = new Path2D();
elS.ellipse(fx, fy, frx*1.12, fry*1.12, 0, 0, Math.PI*2);
ctxF.save(); ctxF.clip(elS);
var lg = ctxF.createLinearGradient(fx-frx, 0, fx+frx, 0);
lg.addColorStop(0,"rgba(71,164,198,0)");
lg.addColorStop(0.5,"rgba(71,164,198,.55)");
lg.addColorStop(1,"rgba(71,164,198,0)");
ctxF.strokeStyle = lg; ctxF.lineWidth = 1.4;
ctxF.beginPath(); ctxF.moveTo(fx-frx*1.2, sy); ctxF.lineTo(fx+frx*1.2, sy); ctxF.stroke();
ctxF.restore();
}
});
})();

(function(){
var cv = $("#fluid"); if (!cv) return;
var ctx = cv.getContext("2d"), w=0,h=0,dpr=1,t=0;
function size(){
var r = cv.getBoundingClientRect();
dpr = Math.min(devicePixelRatio||1, 2);
w = Math.max(1,Math.round(r.width)); h = Math.max(1,Math.round(r.height));
cv.width = w*dpr; cv.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
}
size(); window.addEventListener("resize", size);
var LAYERS = 5;
tickFns.push(function(){
var rc = cv.getBoundingClientRect();
if (rc.bottom < 0 || rc.top > window.innerHeight) return;
if (!RM) t += 0.0045;
ctx.clearRect(0,0,w,h);
for (var i=0;i<LAYERS;i++){
var k = i/(LAYERS-1);
var base = h*(0.30 + i*0.145) + Math.sin(t*0.6 + i)*10;
var amp = 26 + i*11, ph = t*(0.8 + i*0.15) + i*1.35, depth = 150 + i*26;
function surf(x){
return base + Math.sin(x*0.0016 + ph)*amp + Math.sin(x*0.0044 - ph*1.2)*amp*0.38;
}
ctx.beginPath();
ctx.moveTo(0, surf(0));
for (var x=0;x<=w;x+=10) ctx.lineTo(x, surf(x));
ctx.lineTo(w, surf(w)+depth); ctx.lineTo(0, surf(0)+depth); ctx.closePath();
var g = ctx.createLinearGradient(0, base-amp, 0, base+depth);
g.addColorStop(0, "rgba("+PAL.rgb+","+(0.055 - k*0.022).toFixed(3)+")");
g.addColorStop(0.35,"rgba("+PAL.rgb+","+(0.022 - k*0.009).toFixed(3)+")");
g.addColorStop(1, "rgba("+PAL.rgb+",0)");
ctx.fillStyle = g; ctx.fill();
ctx.beginPath();
for (var x2=0;x2<=w;x2+=10){
var y2 = surf(x2);
if (x2===0) ctx.moveTo(x2,y2); else ctx.lineTo(x2,y2);
}
ctx.strokeStyle = "rgba("+PAL.rgb2+","+(0.040 - k*0.018).toFixed(3)+")";
ctx.lineWidth = 7; ctx.stroke();
ctx.strokeStyle = "rgba("+PAL.rgb2+","+(0.16 - k*0.07).toFixed(3)+")";
ctx.lineWidth = 1.3; ctx.stroke();
}
var gl = ctx.createRadialGradient(w*0.74,h*0.34,0,w*0.74,h*0.34,Math.max(w,h)*0.6);
gl.addColorStop(0,"rgba("+PAL.rgb+",.07)");
gl.addColorStop(1,"rgba("+PAL.rgb+",0)");
ctx.fillStyle = gl; ctx.fillRect(0,0,w,h);
});
})();

function sectionProgress(el){
var r = el.getBoundingClientRect();
var total = r.height - window.innerHeight;
if (total <= 0) return 0;
return clamp(-r.top / total, 0, 1);
}

var rails = [
{sec:$("#leistungen"), track:$("#railTrack"), bar:$("#railBar")},
{sec:$("#mixes"),      track:$("#mixTrack"),  bar:$("#mixBar")}
].filter(function(r){ return r.sec && r.track; });
function autoHeights(){

var swipe = RM || !FINE || window.innerWidth < 900;
rails.forEach(function(r){
r.sec.classList.toggle("is-swipe", swipe);
if (swipe){ r.sec.style.height = ""; r.track.style.transform = ""; r.over = 0; return; }

r.track.style.transform = "none";
var kinder = r.track.children, letzte = kinder[kinder.length - 1];
var padR = parseFloat(getComputedStyle(r.track).paddingRight) || 0;
var breite = letzte ? letzte.getBoundingClientRect().right - r.track.getBoundingClientRect().left
: r.track.scrollWidth;
var over = Math.max(0, breite + padR - window.innerWidth);
r.sec.style.height = (window.innerHeight + over) + "px";
r.over = over;
});
}
if (rails.length){
autoHeights();
window.addEventListener("resize", autoHeights);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(autoHeights);
tickFns.push(function(){
rails.forEach(function(r){
if (r.sec.classList.contains("is-swipe")) return;
var p = sectionProgress(r.sec);
r.track.style.transform = "translate3d(" + (-(r.over||0) * p) + "px,0,0)";
if (r.bar) r.bar.style.setProperty("--rp", (p*100).toFixed(1) + "%");
});
});
}

(function(){
var outer = $(".steps-outer"), steps = $$("#stepsGrid .stp");
if (!outer || !steps.length) return;
if (RM){ steps.forEach(function(s){ s.classList.add("on"); }); return; }
tickFns.push(function(){
var r = outer.getBoundingClientRect();
if (r.bottom < 0 || r.top > window.innerHeight) return;
var p = sectionProgress(outer);
steps.forEach(function(el,i){ el.classList.toggle("on", p >= (i*0.26) + 0.04); });
});
})();

(function(){
var cv = $("#floodC"), outer = $(".flood-outer"), sec = $(".flood");
if (!cv || !outer || !sec) return;
var floodLines = $$(".flood .eyebrow, .flood h2 .ln, .flood p");
var ctx = cv.getContext("2d"), w=0,h=0,dpr=1,t=0;
function size(){
var r = cv.getBoundingClientRect();
dpr = Math.min(devicePixelRatio||1,2);
w = Math.max(1,Math.round(r.width)); h = Math.max(1,Math.round(r.height));
cv.width = w*dpr; cv.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
}
size(); window.addEventListener("resize", size);
tickFns.push(function(){
var r = outer.getBoundingClientRect();
if (r.bottom < 0 || r.top > window.innerHeight) return;
var p = sectionProgress(outer);
var e = clamp((p-0.06)/0.62, 0, 1);
t += 0.02;
var level = h * (1 - e);
ctx.clearRect(0,0,w,h);

var amp = 16*(1-e*0.5), amp2 = 7*(1-e*0.5);
function surfaceY(x){
return level + Math.sin(x*0.010 + t*1.5)*amp + Math.sin(x*0.027 - t*2.2)*amp2;
}
var wave = new Path2D();
wave.moveTo(0,h); wave.lineTo(0,surfaceY(0));
for (var x=0;x<=w;x+=6) wave.lineTo(x, surfaceY(x));
wave.lineTo(w,h); wave.closePath();
ctx.save();
ctx.shadowColor = "rgba("+PAL.rgb+",.55)";
ctx.shadowBlur = 40; ctx.shadowOffsetY = -6;
ctx.fillStyle = "rgb("+PAL.bg+")";
ctx.fill(wave);
ctx.restore();
ctx.save(); ctx.clip(wave);
var g = ctx.createLinearGradient(0,level-amp,0,level+38);
g.addColorStop(0,"rgba("+PAL.rgb2+",.32)");
g.addColorStop(0.30,"rgba("+PAL.rgb+",.14)");
g.addColorStop(1,"rgba("+PAL.rgb+",0)");
ctx.fillStyle = g; ctx.fillRect(0, level-amp-4, w, amp+46);
ctx.globalAlpha = 0.045;
for (var s=0;s<5;s++){
var sx = w*(s+0.5)/5 + Math.sin(t*0.45 + s*1.7)*46;
var gg = ctx.createLinearGradient(sx-44,0,sx+44,0);
gg.addColorStop(0,"rgba("+PAL.rgb2+",0)");
gg.addColorStop(0.5,"rgba("+PAL.rgb2+",1)");
gg.addColorStop(1,"rgba("+PAL.rgb2+",0)");
ctx.fillStyle = gg; ctx.fillRect(sx-44, level, 88, h-level);
}
ctx.globalAlpha = 1; ctx.restore();
ctx.beginPath();
for (var x2=0;x2<=w;x2+=6){
var y2 = surfaceY(x2);
if (x2===0) ctx.moveTo(x2,y2); else ctx.lineTo(x2,y2);
}
ctx.strokeStyle = "rgba("+PAL.rgb2+","+(0.6*(1-e*0.25)).toFixed(3)+")";
ctx.lineWidth = 1.6; ctx.stroke();

var secTop = sec.getBoundingClientRect().top;
for (var li=0; li<floodLines.length; li++){
var el = floodLines[li], lr = el.getBoundingClientRect();
var wet = level < (lr.top - secTop + lr.height * 0.55);
if (el._wet !== wet){ el.classList.toggle("wet", wet); el._wet = wet; }
}
});
})();

(function(){
var out = $("#refundOut"); if (!out) return;
var INS = {
privat: ["In der Regel voll erstattet",
"Private Krankenversicherungen und Beihilfe übernehmen osteopathische Behandlung meist "+
"vollständig oder zum größten Teil. Wie viel genau, hängt von deinem Tarif ab."],
zusatz: ["Meist ein fester Betrag je Sitzung",
"Zusatzversicherungen erstatten häufig einen festen Betrag pro Behandlung oder ein "+
"Jahresbudget. Zusammen mit dem freiwilligen Anteil deiner Kasse bleibt oft nur ein "+
"kleiner Eigenanteil übrig."],
gesetzlich: ["Anteilig, bei den meisten Kassen",
"Viele gesetzliche Kassen beteiligen sich freiwillig an einer bestimmten Zahl von "+
"Sitzungen im Jahr. Paul erfüllt alle Ausbildungsanforderungen, die dafür verlangt werden."]
};
function render(key){
var d = INS[key];
out.innerHTML = '<span class="big"></span><p></p>';
$(".big", out).textContent = d[0];
$("p", out).textContent = d[1];
}
$$(".segbtns button").forEach(function(b){
b.addEventListener("click", function(){
$$(".segbtns button").forEach(function(o){
o.setAttribute("aria-pressed", String(o === b));
});
render(b.dataset.ins);
});
});
render("privat");
})();

var DOW=["So","Mo","Di","Mi","Do","Fr","Sa"],
MON=["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],
DOWL=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],
MONL=["Januar","Februar","März","April","Mai","Juni","Juli","August","September",
"Oktober","November","Dezember"],
TIMES=["08:50","10:20","11:40","13:10","14:30","16:00","17:20","18:20"];
function workdays(n){
var out=[], d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+1);
while(out.length<n){ if(d.getDay()!==0 && d.getDay()!==6) out.push(new Date(d)); d.setDate(d.getDate()+1); }
return out;
}
function slotsFor(d,i){
var seed=(d.getDate()*7 + i*13) % 11;
return TIMES.filter(function(x,j){ return (seed+j*5)%7 !== 0; })
.map(function(x,j){ return {time:x, free:((seed+j*3)%5)!==0}; });
}
var DAYS = workdays(10), firstFree=null;
for (var fi=0; fi<DAYS.length && !firstFree; fi++){
var fs = slotsFor(DAYS[fi],fi).filter(function(s){return s.free;});
if (fs.length) firstFree = {d:DAYS[fi], t:fs[0].time};
}
if (firstFree){
var txt = DOWL[firstFree.d.getDay()]+", "+firstFree.d.getDate()+". "+
MONL[firstFree.d.getMonth()]+" · "+firstFree.t+" Uhr";
["#nextSlot","#nextSlotInf"].forEach(function(s){ if ($(s)) $(s).textContent = txt; });
var kurz = DOW[firstFree.d.getDay()]+", "+String(firstFree.d.getDate()).padStart(2,"0")+"."+
String(firstFree.d.getMonth()+1).padStart(2,"0")+". · "+firstFree.t;
if ($("#nextSlotShort")) $("#nextSlotShort").textContent = kurz;
}
var SERVICES = {
beschwerden:[
{n:"Osteopathie · Erstbehandlung", d:"60 Min", p:"155 €"},
{n:"Osteopathie · Folgebehandlung", d:"50 Min", p:"145 €"},
{n:"Chiropraktik", d:"50 Min", p:"145 €"},
{n:"Kieferbehandlung bei CMD", d:"50 Min", p:"145 €"},
{n:"Kurzbehandlung", d:"30 Min", p:"100 €"}],
performance:[
{n:"Performance-Screening & Behandlung", d:"60 Min", p:"155 €"},
{n:"Stoßwellentherapie", d:"30 Min", p:"100 €"},
{n:"Hochenergie-Induktionstherapie", d:"20 Min", p:"100 €"},
{n:"Dry Needling / Triggerpunkt", d:"30 Min", p:"100 €"},
{n:"Myofasziale Lösetechniken", d:"50 Min", p:"145 €"}],
infusion:[
{n:"Erstberatung & Infusion", d:"55 Min", p:"n. n."},
{n:"Recovery — nach der Belastung", d:"45 Min", p:"n. n."},
{n:"Immun — Vitamin C und Zink", d:"45 Min", p:"n. n."},
{n:"Energie — B-Vitamin-Komplex", d:"45 Min", p:"n. n."},
{n:"Behandlung plus Infusion", d:"90 Min", p:"n. n."}]
};
var LBL = {beschwerden:"Beschwerden", performance:"Performance", infusion:"Infusion"};
var bk = $("#booking");
if (bk){
var st = {step:1,intent:null,svc:null,day:null,time:null}, lastFocus=null;
function setWorld(w){
bk.classList.toggle("w-infusion", w==="infusion");
bk.classList.toggle("w-therapy", w!=="infusion");
$("#bkWorld").textContent = w==="infusion" ? "Infusion · Terminbuchung" : "Terminbuchung";
}
function openBooking(w, intent){
lastFocus = document.activeElement;
bk.classList.add("is-open"); document.body.style.overflow="hidden";
setWorld(w || (intent==="infusion" ? "infusion" : "therapy"));
if (intent){ st.intent = intent; renderSvc(); goStep(2); }
else { goStep(1); }
var f = bk.querySelector(".bstep.on button"); if (f) f.focus();
}
function closeBooking(){
bk.classList.remove("is-open"); document.body.style.overflow="";
if (lastFocus) lastFocus.focus();
}
$$(".js-book").forEach(function(b){
b.addEventListener("click", function(e){
e.preventDefault();
openBooking(b.dataset.world, b.dataset.topic);
});
});
$("#bkClose").addEventListener("click", closeBooking);
bk.addEventListener("click", function(e){ if(e.target===bk) closeBooking(); });
document.addEventListener("keydown", function(e){
if (!bk.classList.contains("is-open")) return;
if (e.key === "Escape"){ closeBooking(); return; }
if (e.key !== "Tab") return;
var f = $$('a[href],button:not(:disabled),input,textarea,select,[tabindex]:not([tabindex="-1"])', bk)
.filter(function(el){ return el.offsetParent !== null; });
if (!f.length) return;
var first=f[0], last=f[f.length-1];
if (e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
else if (!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
});
function goStep(n){
st.step = n;
$$(".bstep", bk).forEach(function(s){ s.classList.toggle("on", Number(s.dataset.step)===n); });
$("#bkFill").style.width = Math.min(n,4)*25 + "%";
var L = $("#bkSteps").children;
for (var i=0;i<L.length;i++) L[i].className = (n>4 || i+1<n) ? "done" : (i+1===n ? "now" : "");
bk.scrollTop = 0;
}
$$("[data-intent]", bk).forEach(function(b){
b.addEventListener("click", function(){
st.intent = b.dataset.intent;
setWorld(st.intent==="infusion" ? "infusion" : "therapy");
renderSvc(); goStep(2);
});
});
function renderSvc(){
var list = $("#bkSvc");
$("#bkHint").textContent = st.intent==="infusion"
? "Beim ersten Mal ist die Erstberatung Pflicht — dabei legen wir deine Zusammenstellung fest."
: "Du bist unsicher? Wähle die Erstbehandlung — wir klären den Rest im Termin.";
list.innerHTML = "";
(SERVICES[st.intent] || SERVICES.beschwerden).forEach(function(s){
var b = document.createElement("button");
b.setAttribute("data-cursor","");
var nb=document.createElement("b"); nb.textContent=s.n;
var du=document.createElement("span"); du.className="du"; du.textContent=s.d;
var pr=document.createElement("span"); pr.className="pr"; pr.textContent=s.p;
b.appendChild(nb); b.appendChild(du); b.appendChild(pr);
b.addEventListener("click", function(){ st.svc=s; renderDays(); goStep(3); });
list.appendChild(b);
});
}
function renderDays(){
var wrap = $("#bkDays"); wrap.innerHTML="";
DAYS.forEach(function(d,i){
var b=document.createElement("button");
b.className="day"; b.type="button";
b.setAttribute("aria-pressed","false"); b.setAttribute("data-cursor","");
b.innerHTML = '<span class="dw">'+DOW[d.getDay()]+'</span><span class="dn">'+
String(d.getDate()).padStart(2,"0")+'</span><span class="mo">'+MON[d.getMonth()]+'</span>';
b.addEventListener("click", function(){
$$(".day",wrap).forEach(function(x){ x.setAttribute("aria-pressed","false"); });
b.setAttribute("aria-pressed","true");
st.day=d; st.time=null; renderSlots(d,i);
});
wrap.appendChild(b);
});
wrap.querySelector(".day").click();
}
function renderSlots(d,i){
var wrap=$("#bkSlots"); wrap.innerHTML="";
slotsFor(d,i).forEach(function(s){
var b=document.createElement("button");
b.className="slot"; b.type="button"; b.textContent=s.time;
b.setAttribute("aria-pressed","false"); b.setAttribute("data-cursor","");
if (!s.free){ b.disabled=true; b.title="belegt"; }
b.addEventListener("click", function(){
$$(".slot",wrap).forEach(function(x){ x.setAttribute("aria-pressed","false"); });
b.setAttribute("aria-pressed","true"); st.time=s.time; renderSum();
setTimeout(function(){ goStep(4); }, RM?0:280);
});
wrap.appendChild(b);
});
}
function renderSum(){
var d=st.day;
var when = DOWL[d.getDay()]+", "+d.getDate()+". "+MONL[d.getMonth()]+" um "+st.time+" Uhr";
var rows=[["Anliegen",LBL[st.intent]],["Leistung",st.svc.n],["Dauer",st.svc.d],
["Termin",when],["Kosten",st.svc.p]];
var html = rows.map(function(r){
return '<div><span class="k">'+r[0]+'</span><span class="v">'+r[1]+'</span></div>'; }).join("");
$("#bkSum").innerHTML = html; $("#bkSum2").innerHTML = html;
}
$("#bkSubmit").addEventListener("click", function(){ goStep(5); });
$("#bkRestart").addEventListener("click", function(){
st={step:1,intent:null,svc:null,day:null,time:null}; setWorld("therapy"); goStep(1);
});
$$(".bback", bk).forEach(function(b){
b.addEventListener("click", function(){ goStep(Math.max(1, st.step-1)); });
});
}
})();

(function(){
var reels = Array.prototype.slice.call(document.querySelectorAll(".js-reel"));
if (!reels.length) return;
var schalter = Array.prototype.slice.call(document.querySelectorAll(".js-reeltoggle"));
var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var angehalten = ruhig;
function quelle(v){
if (!v.getAttribute("src") && v.dataset.src){ v.src = v.dataset.src; }
}
function spiel(v){
if (angehalten) return;
quelle(v);
var p = v.play();
if (p && p.catch) p.catch(function(){});
}
var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function(eintraege){
eintraege.forEach(function(e){
if (e.isIntersecting) spiel(e.target); else e.target.pause();
});
}, {threshold:.35}) : null;
if (io) reels.forEach(function(v){ io.observe(v); });
else reels.forEach(spiel);
function beschriften(){
schalter.forEach(function(b){
var eins = b.hasAttribute("data-einzeln");
b.setAttribute("aria-pressed", angehalten ? "true" : "false");
b.textContent = (angehalten ? (eins ? "Video abspielen" : "Videos abspielen")
: (eins ? "Video anhalten"  : "Videos anhalten"));
});
}
schalter.forEach(function(b){
b.addEventListener("click", function(){
angehalten = !angehalten;
reels.forEach(function(v){ if (angehalten) v.pause(); else spiel(v); });
beschriften();
});
});
beschriften();
})();

(function(){
var leiste = document.querySelector(".entwahl");
if (!leiste) return;
Array.prototype.forEach.call(leiste.querySelectorAll("[data-ent]"), function(el){
el.addEventListener("click", function(){
try { localStorage.setItem("osteomedis-entwurf", el.dataset.ent); } catch(e){}
});
});

(function () {
var start = document.querySelector(".film-start");
if (!start) return;
start.addEventListener("click", function () {
var rahmen = document.createElement("iframe");
rahmen.src = "https://player.vimeo.com/video/" + this.dataset.vimeo + "?autoplay=1&dnt=1";
rahmen.title = "Imagefilm Osteomedis";
rahmen.allow = "autoplay; fullscreen; picture-in-picture";
rahmen.setAttribute("allowfullscreen", "");
this.parentNode.replaceChild(rahmen, this);
rahmen.focus();
});
})();
})();