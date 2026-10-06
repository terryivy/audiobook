/* 球状闪电 · 有声听书 v2.0 — 暗夜雷暴主题 */
(function(){
"use strict";
var $ = function(id){ return document.getElementById(id); };
var BOOKS = window.BOOKS || [];

/* ---------- 本地存储 ---------- */
var KEY = "ab_progress_v2", FKEY = "ab_fav_v2";
var prog = {}, favs = {};
try{ var s = JSON.parse(localStorage.getItem(KEY)); if(s) prog = s; }catch(e){}
try{ var f = JSON.parse(localStorage.getItem(FKEY)); if(f) favs = f; }catch(e){}
function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(prog)); }catch(e){} }
function persistFav(){ try{ localStorage.setItem(FKEY, JSON.stringify(favs)); }catch(e){} }
function chapKey(bid, ci){ return bid + ":" + ci; }
function getPos(bid, ci){ return prog[chapKey(bid, ci)] || 0; }
function setPos(bid, ci, t){ prog[chapKey(bid, ci)] = Math.floor(t); persist(); }
function isFav(bid, ci){ return !!favs[chapKey(bid, ci)]; }
function toggleFav(bid, ci){
  var k = chapKey(bid, ci);
  if(favs[k]) delete favs[k]; else favs[k] = Date.now();
  persistFav(); return !!favs[k];
}

var audio = $("audio");
var curLang = "zh";
var curBook = null, curCh = 0, seeking = false;
var sleepTimer = null, lastTab = "screen-home";

/* ---------- 导航 ---------- */
function show(id){
  document.querySelectorAll(".screen").forEach(function(s){ s.classList.remove("active"); });
  $(id).classList.add("active");
  document.querySelectorAll("#tabbar button").forEach(function(b){
    b.classList.toggle("on", b.getAttribute("data-tab") === id);
  });
  if(id !== "screen-chapters") lastTab = id;
  // 迷你条只在非播放器页显示
  if(curBook) $("mini-player").classList.toggle("hidden", id === "screen-player");
}
document.querySelectorAll("#tabbar button").forEach(function(b){
  b.onclick = function(){
    var t = b.getAttribute("data-tab");
    if(t === "screen-player" && !curBook){ renderShelf(); show("screen-shelf"); return; }
    if(t === "screen-home") renderHome();
    if(t === "screen-shelf") renderShelf();
    if(t === "screen-profile") renderProfile();
    show(t);
  };
});
function fmt(t){
  t = Math.max(0, Math.floor(t||0));
  var m = Math.floor(t/60), s = t%60;
  return (m<10?"0":"")+m + ":" + (s<10?"0":"") + s;
}
function bookById(bid){ return BOOKS.filter(function(b){ return b.id===bid; })[0]; }
function coverStyle(b){
  return 'background:linear-gradient(135deg,'+b.c1+','+b.c2+')';
}

/* ---------- 首页 ---------- */
function renderHome(){
  // 继续播放
  var cc = $("continue-card");
  var found = null;
  for(var i=0;i<BOOKS.length && !found;i++){
    for(var j=0;j<BOOKS[i].chapters.length;j++){
      if(getPos(BOOKS[i].id, j) > 5){ found = {b:BOOKS[i], c:j}; break; }
    }
  }
  if(found){
    cc.classList.remove("hidden");
    $("cc-title").textContent = found.b.title + " · " + found.b.chapters[found.c].title;
    $("cc-sub").textContent = "上次听到 " + fmt(getPos(found.b.id, found.c)) + " — 继续收听";
    $("cc-play").onclick = function(e){ e.stopPropagation(); playChapter(found.b.id, found.c); };
    cc.onclick = function(){ playChapter(found.b.id, found.c); };
  } else cc.classList.add("hidden");
  // 书架横滑
  var row = $("home-books"); row.innerHTML = "";
  BOOKS.filter(function(b){ return b.lang === curLang; }).forEach(function(b){
    var done = b.chapters.filter(function(c, i){ return getPos(b.id, i) > 0; }).length;
    var d = document.createElement("div");
    d.className = "book-card glass-card";
    d.innerHTML = '<div class="book-cover" style="'+coverStyle(b)+'">'+b.cover+'</div>'+
      '<div class="bt">'+b.title+'</div><div class="ba">'+b.author+'</div>'+
      '<div class="bm">'+b.chapters.length+'章'+(done?(' · 已听'+done):'')+'</div>';
    d.onclick = function(){ openChapters(b.id); };
    row.appendChild(d);
  });
  // 全部作品
  var all = $("home-all"); all.innerHTML = "";
  BOOKS.forEach(function(b){
    var d = document.createElement("div");
    d.className = "work-item glass-card";
    d.innerHTML = '<div class="work-cover" style="'+coverStyle(b)+'">'+b.cover+'</div>'+
      '<div class="work-info"><div class="work-title">'+b.title+'</div>'+
      '<div class="work-sub">'+b.author+' · '+b.chapters.length+'章 · '+(b.lang==="zh"?"中文":"English")+'</div></div>'+
      '<div class="work-arrow">›</div>';
    d.onclick = function(){ openChapters(b.id); };
    all.appendChild(d);
  });
}
$("go-shelf").onclick = function(){ renderShelf(); show("screen-shelf"); };
document.querySelectorAll("#langSeg button").forEach(function(b){
  b.onclick = function(){
    curLang = b.getAttribute("data-lang");
    document.querySelectorAll("#langSeg button").forEach(function(x){ x.classList.toggle("on", x===b); });
    renderHome();
  };
});

/* ---------- 书架 ---------- */
function renderShelf(){
  var list = $("shelf-list"); list.innerHTML = "";
  BOOKS.forEach(function(b){
    var done = b.chapters.filter(function(c, i){ return getPos(b.id, i) > 0; }).length;
    var d = document.createElement("div");
    d.className = "work-item glass-card";
    d.innerHTML = '<div class="work-cover" style="'+coverStyle(b)+'">'+b.cover+'</div>'+
      '<div class="work-info"><div class="work-title">'+b.title+'</div>'+
      '<div class="work-sub">'+b.author+' · '+b.chapters.length+'章'+(done?(' · 已听'+done):'')+'</div></div>'+
      '<div class="work-arrow">›</div>';
    d.onclick = function(){ openChapters(b.id); };
    list.appendChild(d);
  });
}

/* ---------- 章节列表 ---------- */
function openChapters(bid){
  curBook = bookById(bid);
  if(!curBook) return;
  $("ch-book-title").textContent = curBook.title;
  $("book-hero").innerHTML =
    '<div class="hero-cover" style="'+coverStyle(curBook)+'">'+curBook.cover+'</div>'+
    '<div class="hero-info"><h3>'+curBook.title+'</h3>'+
    '<div class="en">'+curBook.titleEn+'</div>'+
    '<div class="au">✍️ '+curBook.author+' · '+curBook.chapters.length+'章</div>'+
    '<button class="play-all" id="btn-play-all">▶ 从头播放</button></div>';
  var cl = $("chapter-list"); cl.innerHTML = "";
  var desc = document.createElement("div");
  desc.className = "book-desc"; desc.textContent = curBook.desc;
  cl.appendChild(desc);
  curBook.chapters.forEach(function(c, i){
    var pos = getPos(curBook.id, i);
    var d = document.createElement("div");
    d.className = "chapter";
    d.innerHTML = '<div class="ch-num">'+(i+1)+'</div>'+
      '<div class="ch-info"><div class="ch-title">'+c.title+'</div>'+
      '<div class="ch-sub">'+(pos>0?'<span class="resume">↩ 上次听到 '+fmt(pos)+'</span>':'<span>未播放</span>')+'</div></div>'+
      '<div class="ch-play">▶</div>';
    d.onclick = function(){ playChapter(curBook.id, i); };
    cl.appendChild(d);
  });
  $("btn-play-all").onclick = function(){
    var start = 0;
    for(var i=0;i<curBook.chapters.length;i++){
      if(getPos(curBook.id, i) > 0){ start = i; break; }
    }
    playChapter(curBook.id, start);
  };
  show("screen-chapters");
}
$("btn-ch-back").onclick = function(){ show(lastTab); };

/* ---------- 文字跟读 ---------- */
var qzText = null, qzSync = null, textViewOpen = false, textParas = [], textChars = [], lastParaIdx = -1;
function loadQzText(cb){
  if(qzText){ cb && cb(); return; }
  fetch("data/qz_text.json").then(function(r){ return r.json(); }).then(function(j){
    qzText = j; cb && cb();
  }).catch(function(){ cb && cb(); });
  fetch("data/qz_sync.json").then(function(r){ return r.json(); }).then(function(j){
    qzSync = j;
  }).catch(function(){});
}
function openTextView(){
  if(!curBook || !curBook.hasText) return;
  loadQzText(function(){
    if(!qzText) return;
    var ch = qzText.chapters[curCh];
    if(!ch) return;
    textViewOpen = true;
    $("text-view-title").textContent = "📖 " + ch.title;
    var body = $("text-view-body"); body.innerHTML = "";
    textParas = []; textChars = [];
    var acc = 0;
    ch.paras.forEach(function(p){
      var el = document.createElement("p");
      el.textContent = p;
      body.appendChild(el);
      textParas.push(el); textChars.push(acc);
      acc += p.length;
    });
    textChars.push(acc);
    lastParaIdx = -1;
    $("text-view").classList.remove("hidden");
    highlightTextPara();
  });
}
function closeTextView(){
  textViewOpen = false;
  $("text-view").classList.add("hidden");
}
$("btn-text-view").onclick = function(){
  if(textViewOpen) closeTextView(); else openTextView();
};
$("btn-text-close").onclick = closeTextView;
function estimateCharOffset(){
  if(!audio.duration || !textChars.length) return 0;
  var total = textChars[textChars.length-1];
  if(qzSync && qzSync.chapters && qzSync.chapters[curCh] && qzSync.chapters[curCh].chunks.length){
    var chunks = qzSync.chapters[curCh].chunks;
    var t = audio.currentTime, acc = 0;
    for(var i=0;i<chunks.length;i++){
      var c = chunks[i];
      var cEnd = (i+1<chunks.length) ? chunks[i+1].t : audio.duration;
      if(t < cEnd || i === chunks.length-1){
        var frac = cEnd > c.t ? Math.min(1, Math.max(0, (t - c.t)/(cEnd - c.t))) : 0;
        return acc + Math.floor(c.n * frac);
      }
      acc += c.n;
    }
    return acc;
  }
  return Math.floor(total * audio.currentTime / audio.duration);
}
function highlightTextPara(){
  if(!textViewOpen || !textParas.length) return;
  var off = estimateCharOffset(), idx = 0;
  for(var i=0;i<textChars.length-1;i++){
    if(off >= textChars[i]) idx = i; else break;
  }
  if(idx !== lastParaIdx){
    if(lastParaIdx >= 0 && textParas[lastParaIdx]) textParas[lastParaIdx].classList.remove("active");
    if(textParas[idx]){
      textParas[idx].classList.add("active");
      var body = $("text-view-body"), el = textParas[idx];
      body.scrollTo({top: Math.max(0, el.offsetTop - body.clientHeight/2 + el.clientHeight/2), behavior: "smooth"});
    }
    lastParaIdx = idx;
  }
}

/* ---------- 播放 ---------- */
var SPEEDS = [0.75, 1, 1.25, 1.5], speedIdx = 1;
function playChapter(bid, ci){
  curBook = bookById(bid);
  curCh = ci;
  var c = curBook.chapters[ci];
  audio.src = c.file;
  audio.playbackRate = SPEEDS[speedIdx];
  $("btn-speed").textContent = SPEEDS[speedIdx].toFixed(2).replace(/0$/, "") + "x";
  $("player-cover").textContent = curBook.cover;
  $("player-book").textContent = curBook.title + " · " + curBook.author;
  $("player-title").textContent = c.title;
  $("mini-cover").textContent = curBook.cover;
  $("mini-title").textContent = c.title;
  $("mini-sub").textContent = curBook.title;
  $("mini-player").classList.remove("hidden");
  $("btn-text-view").style.display = curBook.hasText ? "" : "none";
  updateFavBtn();
  closeTextView(); lastParaIdx = -1;
  if(curBook.hasText) loadQzText();
  show("screen-player");
  audio.play().catch(function(){});
  var pos = getPos(bid, ci);
  if(pos > 5){
    var onMeta = function(){
      try{ audio.currentTime = Math.min(pos, (audio.duration||pos+1) - 3); }catch(e){}
      audio.removeEventListener("loadedmetadata", onMeta);
    };
    audio.addEventListener("loadedmetadata", onMeta);
  }
  updatePlayBtn();
}
function updatePlayBtn(){
  var playing = !audio.paused;
  $("btn-play").textContent = playing ? "⏸" : "▶";
  $("mini-play").textContent = playing ? "⏸" : "▶";
}
function updateFavBtn(){
  var loved = curBook && isFav(curBook.id, curCh);
  $("btn-fav").textContent = loved ? "♥" : "♡";
  $("btn-fav").classList.toggle("loved", !!loved);
}
$("btn-play").onclick = function(){ togglePlay(); };
$("mini-play").onclick = function(e){ e.stopPropagation(); togglePlay(); };
function togglePlay(){
  if(!curBook) return;
  if(audio.paused) audio.play().catch(function(){});
  else audio.pause();
  updatePlayBtn();
}
$("mini-player").onclick = function(){ if(curBook) show("screen-player"); };
$("btn-player-back").onclick = function(){ show(lastTab === "screen-player" ? "screen-home" : lastTab); };
$("btn-back15").onclick = function(){ audio.currentTime = Math.max(0, audio.currentTime - 15); };
$("btn-fwd15").onclick = function(){ audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15); };
$("btn-prev-ch").onclick = function(){ if(curBook && curCh > 0) playChapter(curBook.id, curCh - 1); };
$("btn-next-ch").onclick = function(){ if(curBook && curCh < curBook.chapters.length - 1) playChapter(curBook.id, curCh + 1); };
$("btn-fav").onclick = function(){
  if(!curBook) return;
  toggleFav(curBook.id, curCh);
  updateFavBtn();
};
$("btn-speed").onclick = function(){
  speedIdx = (speedIdx + 1) % SPEEDS.length;
  audio.playbackRate = SPEEDS[speedIdx];
  $("btn-speed").textContent = SPEEDS[speedIdx].toFixed(2).replace(/0$/, "") + "x";
};

audio.addEventListener("timeupdate", function(){
  if(!curBook) return;
  if(!seeking && audio.duration){
    $("seek").value = Math.floor(audio.currentTime / audio.duration * 1000);
  }
  $("t-cur").textContent = fmt(audio.currentTime);
  if(Math.floor(audio.currentTime) % 5 === 0) setPos(curBook.id, curCh, audio.currentTime);
  highlightTextPara();
  // 首页继续播放卡片实时更新
  if($("screen-home").classList.contains("active") && !$("continue-card").classList.contains("hidden")){
    $("cc-sub").textContent = "已播放 " + fmt(audio.currentTime) + " — 继续收听";
  }
});
audio.addEventListener("loadedmetadata", function(){
  $("t-dur").textContent = fmt(audio.duration);
});
audio.addEventListener("play", updatePlayBtn);
audio.addEventListener("pause", function(){
  updatePlayBtn();
  if(curBook) setPos(curBook.id, curCh, audio.currentTime);
});
audio.addEventListener("ended", function(){
  if(curBook && curCh < curBook.chapters.length - 1){
    playChapter(curBook.id, curCh + 1);
  } else updatePlayBtn();
});
$("seek").addEventListener("input", function(){ seeking = true; });
$("seek").addEventListener("change", function(){
  if(audio.duration) audio.currentTime = $("seek").value / 1000 * audio.duration;
  seeking = false;
});
/* 睡眠定时 */
document.querySelectorAll("#sleepSeg button").forEach(function(b){
  b.onclick = function(){
    document.querySelectorAll("#sleepSeg button").forEach(function(x){ x.classList.toggle("on", x===b); });
    if(sleepTimer){ clearTimeout(sleepTimer); sleepTimer = null; }
    var m = parseInt(b.getAttribute("data-m"), 10);
    if(m > 0){
      sleepTimer = setTimeout(function(){
        audio.pause(); updatePlayBtn();
        document.querySelectorAll("#sleepSeg button").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-m")==="0"); });
      }, m * 60 * 1000);
    }
  };
});

/* ---------- 我的 ---------- */
function renderProfile(){
  var total = Object.keys(prog).filter(function(k){ return prog[k] > 0; }).length;
  $("user-stats").textContent = "已收听 " + total + " 章 · 收藏 " + Object.keys(favs).length;
  $("profile-detail").innerHTML = "";
}
function profileList(title, items, emptyText){
  var box = $("profile-detail"); box.innerHTML = "";
  var h = document.createElement("div");
  h.className = "sec-head"; h.innerHTML = "<h2>" + title + "</h2>";
  box.appendChild(h);
  if(!items.length){
    var e = document.createElement("div");
    e.className = "pd-empty"; e.textContent = emptyText;
    box.appendChild(e); return;
  }
  items.forEach(function(it){
    var d = document.createElement("div");
    d.className = "pd-item";
    d.innerHTML = '<div>' + it.title + '</div><div class="sub">' + it.sub + '</div>';
    d.onclick = function(){ playChapter(it.bid, it.ci); };
    box.appendChild(d);
  });
}
$("menu-fav").onclick = function(){
  var items = [];
  Object.keys(favs).forEach(function(k){
    var p = k.split(":"), b = bookById(p[0]);
    if(b && b.chapters[+p[1]]) items.push({bid:p[0], ci:+p[1],
      title:"♥ " + b.title + " · " + b.chapters[+p[1]].title, sub:b.author});
  });
  profileList("我的收藏", items, "还没有收藏，去播放器点 ♡ 吧");
};
$("menu-hist").onclick = function(){
  var items = [];
  Object.keys(prog).forEach(function(k){
    if(!(prog[k] > 0)) return;
    var p = k.split(":"), b = bookById(p[0]);
    if(b && b.chapters[+p[1]]) items.push({bid:p[0], ci:+p[1],
      title:b.title + " · " + b.chapters[+p[1]].title, sub:"听到 " + fmt(prog[k])});
  });
  profileList("播放历史", items, "还没有播放记录");
};
$("menu-about").onclick = function(){
  var box = $("profile-detail"); box.innerHTML = "";
  var h = document.createElement("div");
  h.className = "sec-head"; h.innerHTML = "<h2>关于</h2>";
  box.appendChild(h);
  var d = document.createElement("div");
  d.className = "pd-item";
  d.innerHTML = '<div>球状闪电 · 有声听书</div><div class="sub">沉浸式科幻听书 · 离线播放 · v2.0</div>';
  box.appendChild(d);
};

/* ---------- 启动 ---------- */
renderHome();
renderProfile();
})();
