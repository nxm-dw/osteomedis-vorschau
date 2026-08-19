
(function () {
"use strict";
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) {
return Array.prototype.slice.call((r || document).querySelectorAll(s));
};
var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

$$(".acc, .faq").forEach(function (gruppe) {
$$("details", gruppe).forEach(function (d) {
d.addEventListener("toggle", function () {
if (!d.open) return;
$$("details", gruppe).forEach(function (a) { if (a !== d) a.open = false; });
});
});
});

(function () {
var aus = $("#refundOut");
if (!aus) return;
var texte = {
privat: ["Private Kassen und Beihilfe",
"Osteopathie ist in den meisten privaten Tarifen enthalten. Erstattet werden "
+ "je nach Tarif 70 bis 100 Prozent. Du reichst die Rechnung nach dem Termin ein."],
zusatz: ["Gesetzlich mit Zusatzversicherung",
"Viele Zusatztarife übernehmen einen festen Betrag je Sitzung oder einen Anteil "
+ "bis zu einer Jahresgrenze. Ein Blick in deinen Tarif lohnt sich."],
gesetzlich: ["Gesetzlich versichert",
"Rund zwei Drittel der gesetzlichen Kassen beteiligen sich freiwillig an "
+ "Osteopathie — meist mit einem Zuschuss je Sitzung und einer Höchstzahl im Jahr."]
};
function zeige(art) {
var t = texte[art] || texte.privat;
aus.innerHTML = '<span class="big">' + t[0] + "</span>" + t[1];
$$(".segbtns button").forEach(function (b) {
b.setAttribute("aria-pressed", b.dataset.ins === art ? "true" : "false");
});
}
$$(".segbtns button").forEach(function (b) {
b.addEventListener("click", function () { zeige(b.dataset.ins); });
});
zeige("privat");
})();

(function () {
var reels = $$(".js-reel");
if (!reels.length) return;
var schalter = $$(".js-reeltoggle");
var aus = RM;
function quelle(v) { if (!v.getAttribute("src") && v.dataset.src) v.src = v.dataset.src; }
function spiel(v) {
if (aus) return;
quelle(v);
var p = v.play();
if (p && p.catch) p.catch(function () {});
}
var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (es) {
es.forEach(function (e) { if (e.isIntersecting) spiel(e.target); else e.target.pause(); });
}, { threshold: .35 }) : null;
if (io) reels.forEach(function (v) { io.observe(v); });
else reels.forEach(spiel);
function text() {
schalter.forEach(function (b) {
var eins = b.hasAttribute("data-einzeln");
b.setAttribute("aria-pressed", aus ? "true" : "false");
b.textContent = aus ? (eins ? "Video abspielen" : "Videos abspielen")
: (eins ? "Video anhalten" : "Videos anhalten");
});
}
schalter.forEach(function (b) {
b.addEventListener("click", function () {
aus = !aus;
reels.forEach(function (v) { if (aus) v.pause(); else spiel(v); });
text();
});
});
text();
})();

(function () {
var leiste = $(".entwahl");
if (!leiste) return;
$$("[data-ent]", leiste).forEach(function (el) {
el.addEventListener("click", function () {
try { localStorage.setItem("osteomedis-entwurf", el.dataset.ent); } catch (e) {}
});
});
})();

(function () {
var bk = $("#booking");
if (!bk) return;
var DOW = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
var MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
"August", "September", "Oktober", "November", "Dezember"];
var SERVICES = {
beschwerden: [["Osteopathie · Erstbehandlung", "60 Min", "155 €"],
["Osteopathie · Folgetermin", "50 Min", "145 €"],
["Chiropraktik", "50 Min", "145 €"],
["Stoßwellentherapie", "30 Min", "100 €"],
["Kurzbehandlung", "30 Min", "100 €"]],
performance: [["Leistungsdiagnostik", "60 Min", "155 €"],
["Regeneration", "50 Min", "145 €"],
["Hochenergie-Induktion", "30 Min", "100 €"],
["Aufbau nach Verletzung", "50 Min", "145 €"]],
infusion:    [["Recovery", "45 Min", "auf Anfrage"],
["Immun", "45 Min", "auf Anfrage"],
["Energie", "45 Min", "auf Anfrage"],
["Basis", "45 Min", "auf Anfrage"],
["Behandlung und Infusion", "90 Min", "auf Anfrage"]]
};
var st = { step: 1, intent: null, svc: null, day: null, time: null };
function werktage(n) {
var raus = [], d = new Date(), i = 0;
d.setHours(0, 0, 0, 0);
while (raus.length < n && i < 40) {
d.setDate(d.getDate() + 1); i++;
if (d.getDay() !== 0 && d.getDay() !== 6) raus.push(new Date(d));
}
return raus;
}
function slots(d) {
var basis = ["08:50", "09:40", "10:20", "11:10", "13:30", "14:20", "15:10", "16:00"];
return basis.map(function (z, i) {
return { zeit: z, frei: (d.getDate() + i) % 3 !== 0 };
});
}
function zeigeSchritt(n) {
st.step = n;
$$(".bstep", bk).forEach(function (s) {
s.classList.toggle("on", parseInt(s.dataset.step, 10) === n);
});
var f = $("#bkFill"); if (f) f.style.width = Math.min(n, 4) * 25 + "%";
$$("#bkSteps span").forEach(function (s, i) {
s.classList.toggle("now", i === Math.min(n, 4) - 1);
});
}
function zeigeServices() {
var w = $("#bkSvc"); if (!w) return;
w.innerHTML = (SERVICES[st.intent] || SERVICES.beschwerden).map(function (s) {
return '<button type="button" data-svc="' + s[0] + '" data-dauer="' + s[1] + '">'
+ "<span>" + s[0] + "</span>"
+ '<span class="pr">' + s[1] + " · " + s[2] + "</span></button>";
}).join("");
$$("#bkSvc button").forEach(function (b) {
b.addEventListener("click", function () {
st.svc = { name: b.dataset.svc, dauer: b.dataset.dauer };
zeigeTage(); zeigeSchritt(3);
});
});
}
function zeigeTage() {
var w = $("#bkDays"); if (!w) return;
w.innerHTML = werktage(10).map(function (d, i) {
return '<button type="button" data-i="' + i + '" aria-pressed="false">'
+ DOW[d.getDay()].slice(0, 2) + ", " + d.getDate() + ". " + MON[d.getMonth()].slice(0, 3)
+ "</button>";
}).join("");
var tage = werktage(10);
$$("#bkDays button").forEach(function (b) {
b.addEventListener("click", function () {
$$("#bkDays button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
b.setAttribute("aria-pressed", "true");
st.day = tage[parseInt(b.dataset.i, 10)];
zeigeSlots();
});
});
if (tage.length) { $("#bkDays button").click(); }
}
function zeigeSlots() {
var w = $("#bkSlots"); if (!w || !st.day) return;
w.innerHTML = slots(st.day).map(function (s) {
return '<button type="button" class="slot" aria-pressed="false"'
+ (s.frei ? "" : ' disabled title="belegt"') + ">" + s.zeit + "</button>";
}).join("");
$$("#bkSlots button").forEach(function (b) {
b.addEventListener("click", function () {
if (b.disabled) return;
$$("#bkSlots button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
b.setAttribute("aria-pressed", "true");
st.time = b.textContent.trim();
fasseZusammen(); zeigeSchritt(4);
});
});
}
function fasseZusammen() {
var d = st.day;
var html = '<div><span class="k">Anliegen</span><b>'
+ ({ beschwerden: "Beschwerden", performance: "Performance", infusion: "Infusion" }[st.intent] || "Beschwerden")
+ "</b></div>"
+ '<div><span class="k">Leistung</span><b>' + (st.svc ? st.svc.name : "—") + "</b></div>"
+ '<div><span class="k">Dauer</span><b>' + (st.svc ? st.svc.dauer : "—") + "</b></div>"
+ '<div><span class="k">Termin</span><b>'
+ (d ? DOW[d.getDay()] + ", " + d.getDate() + ". " + MON[d.getMonth()] : "—")
+ (st.time ? " · " + st.time : "") + "</b></div>";
var a = $("#bkSum"), b = $("#bkSum2");
if (a) a.innerHTML = html;
if (b) b.innerHTML = html;
}
function oeffne(intent) {
st.intent = intent || "beschwerden";
zeigeServices();
bk.classList.add("is-open");
document.body.style.overflow = "hidden";
var z = $(".bclose", bk); if (z) z.focus();
zeigeSchritt(1);
}
function schliesse() {
bk.classList.remove("is-open");
document.body.style.overflow = "";
}
$$(".js-book").forEach(function (b) {
b.addEventListener("click", function (e) {
e.preventDefault();
oeffne(b.dataset.topic || b.dataset.world || "beschwerden");
});
});
var zu = $("#bkClose"); if (zu) zu.addEventListener("click", schliesse);
bk.addEventListener("click", function (e) { if (e.target === bk) schliesse(); });
document.addEventListener("keydown", function (e) {
if (e.key === "Escape" && bk.classList.contains("is-open")) schliesse();
});
$$(".choice button", bk).forEach(function (b) {
b.addEventListener("click", function () {
st.intent = b.dataset.intent; zeigeServices(); zeigeSchritt(2);
});
});
$$(".bback", bk).forEach(function (b) {
b.addEventListener("click", function () { zeigeSchritt(Math.max(1, st.step - 1)); });
});
var senden = $("#bkSubmit");
if (senden) senden.addEventListener("click", function () { fasseZusammen(); zeigeSchritt(5); });
var neu = $("#bkRestart");
if (neu) neu.addEventListener("click", function () {
st = { step: 1, intent: null, svc: null, day: null, time: null };
oeffne("beschwerden");
});

var tage = werktage(3);
if (tage.length) {
var d = tage[0], frei = slots(d).filter(function (s) { return s.frei; })[0];
var txt = DOW[d.getDay()] + ", " + d.getDate() + ". " + MON[d.getMonth()]
+ (frei ? " · " + frei.zeit + " Uhr" : "");
["#nextSlot", "#nextSlotInf"].forEach(function (s) {
var el = $(s); if (el) el.textContent = txt;
});
var n2 = $("#nextSlotShort");
if (n2) n2.textContent = DOW[d.getDay()].slice(0, 2) + ", " + d.getDate() + "."
+ (d.getMonth() + 1) + ". · " + (frei ? frei.zeit : "");
}
})();

var filmStart = $(".film-start");
if (filmStart) {
filmStart.addEventListener("click", function () {
var id = this.dataset.vimeo;
var rahmen = document.createElement("iframe");
rahmen.src = "https://player.vimeo.com/video/" + id + "?autoplay=1&dnt=1";
rahmen.title = "Imagefilm Osteomedis";
rahmen.allow = "autoplay; fullscreen; picture-in-picture";
rahmen.setAttribute("allowfullscreen", "");
this.parentNode.replaceChild(rahmen, this);
rahmen.focus();
});
}
})();