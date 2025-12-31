// === Toast Utility ===
function showToast(msg, type="info") {
  const container = document.getElementById("toast-container");
  if(!container) return;
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type==="success"?"✅":"ℹ️"}</span><span>${msg}</span>`;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

const STORAGE = {
  client: "pt_eval_client_v1",
  therapist: "pt_eval_therapist_v1",
  library: "pt_eval_case_library_v1",
  visit: "pt_eval_visit_v1",
  currentCaseId: "pt_eval_current_case_id_v1",
  recordIdx: "pt_eval_current_record_idx_v1" // 統一命名
};

const ROM_DATA = {
  "Cervical": [{name:"Flexion",min:0,max:45},{name:"Extension",min:0,max:45},{name:"Lat.Flex",min:0,max:45},{name:"Rotation",min:0,max:60}],
  "Lumbar": [{name:"Flexion",min:0,max:60},{name:"Extension",min:0,max:25},{name:"Lat.Flex",min:0,max:25}],
  "Shoulder": [{name:"Flexion",min:0,max:180},{name:"Abd",min:0,max:180},{name:"Ext.Rot",min:0,max:90},{name:"Int.Rot",min:0,max:70}],
  "Elbow": [{name:"Flexion",min:0,max:150},{name:"Ext",min:0,max:0}],
  "Wrist": [{name:"Flexion",min:0,max:80},{name:"Ext",min:0,max:70}],
  "Hip": [{name:"Flexion",min:0,max:120},{name:"Ext",min:0,max:30},{name:"Abd",min:0,max:45},{name:"Add",min:0,max:30}],
  "Knee": [{name:"Flexion",min:0,max:135},{name:"Ext",min:0,max:0}],
  "Ankle": [{name:"Dorsi",min:0,max:20},{name:"Plantar",min:0,max:50}]
};

const $ = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);
const parse = (s,f)=>{try{return JSON.parse(s??"")??f}catch{return f}};
const now = ()=>Date.now();

// Data Loading (沿用舊版邏輯)
const loadClient = ()=>parse(localStorage.getItem(STORAGE.client),{});
const saveClient = (d)=>localStorage.setItem(STORAGE.client, JSON.stringify(d||{}));
const loadTherapist = ()=>parse(localStorage.getItem(STORAGE.therapist),{});
const saveTherapist = (d)=>localStorage.setItem(STORAGE.therapist, JSON.stringify(d||{}));
const loadVisit = ()=>parse(localStorage.getItem(STORAGE.visit),{ vasNow:null, vasMax:null });
const saveVisit = (d)=>localStorage.setItem(STORAGE.visit, JSON.stringify(d||{}));
const resetVisit = ()=>saveVisit({ vasNow:null, vasMax:null });
const loadLib = ()=>parse(localStorage.getItem(STORAGE.library),{});
const saveLib = (d)=>localStorage.setItem(STORAGE.library,JSON.stringify(d||{}));

// Globals
window.loadLib = loadLib;
window.getCurrentCaseId = ()=>localStorage.getItem(STORAGE.currentCaseId);
const setCurrentCaseId = (id)=> id ? localStorage.setItem(STORAGE.currentCaseId,id) : localStorage.removeItem(STORAGE.currentCaseId);
const getCurrentRecordIndex = ()=>{
  const v = localStorage.getItem(STORAGE.recordIdx);
  return v==null ? 0 : Math.max(0, parseInt(v,10) || 0);
};
const setCurrentRecordIndex = (i)=> localStorage.setItem(STORAGE.recordIdx, String(Math.max(0, i|0)));

window.ensureCaseShape = (item)=>{
  if(!item) return null;
  if(item.records) return item;
  return {
    client: item.client||{},
    records: [{
      therapist: item.therapist||{},
      status: "draft",
      createdAt: now(),
      updatedAt: now(),
      visit: { vasNow:null, vasMax:null }
    }]
  };
};

const pages = { client: ()=>$("#page-client"), therapist: ()=>$("#page-therapist"), cases: ()=>$("#page-cases") };

// Collect Data
const collectClient = ()=>{
  const r = pages.client(), d = {};
  $$("[data-field]", r).forEach(el=>{
    if(el.type==="checkbox"){ d[el.getAttribute("data-field")] = el.checked; return; } // 新增：Checkbox 支援
    if(el.type==="range") return; 
    const k = el.name || el.id || el.getAttribute("data-field"); if(!k) return;
    d[k] = (el.type==="number" ? (el.value===""?null:Number(el.value)) : (el.value??"").toString());
  });
  $$(".pill-toggle-group[data-field]", r).forEach(g=>{
    const k = g.getAttribute("data-field");
    const a = g.querySelector(".pill-toggle.active");
    d[k] = a ? a.getAttribute("data-value") : null;
  });
  $$(".chips[data-field]", r).forEach(w=>{
    const k = w.getAttribute("data-field");
    d[k] = $$(".chip.selected", w).map(c=>c.getAttribute("data-value"));
  });
  d.name = (d.name||"").trim();
  return d;
};

const collectTherapist = ()=>{
  const d = {};
  $$("[data-field-pt]").forEach(el=>{
    if(el.closest(".chips")) return;
    const k = el.getAttribute("data-field-pt"); if(!k) return;
    d[k] = (el.type==="number" ? (el.value===""?null:Number(el.value)) : (el.value??"").toString());
  });
  $$(".chips[data-field-pt]").forEach(w=>{
    const k = w.getAttribute("data-field-pt");
    d[k] = $$(".chip.selected", w).map(c=>c.getAttribute("data-value"));
  });
  // 新增：收集 ROM 輸入
  $$(".rom-input").forEach(el => {
    const key = el.dataset.romKey;
    if(key && el.value) d[key] = el.value;
  });
  // 新增：收集 Pain List
  const t = loadTherapist();
  if(t.painParts) d.painParts = t.painParts;
  return d;
};

const collectVisitFromSliders = ()=>{
  const vn = $("#pain-now")?.value;
  const vm = $("#pain-max")?.value;
  const v = loadVisit();
  if(vn !== undefined) v.vasNow = vn === "" ? null : Number(vn);
  if(vm !== undefined) v.vasMax = vm === "" ? null : Number(vm);
  return v;
};

// Render UI
const renderClientUI = (d)=>{
  d=d||{};
  const r = pages.client();
  $$("input,textarea", r).forEach(el=>{
    if(el.type==="checkbox") el.checked = false; else if(el.type!=="date") el.value="";
  });
  $$(".pill-toggle.active", r).forEach(el=>el.classList.remove("active"));
  $$(".chip.selected", r).forEach(el=>el.classList.remove("selected"));

  $$("[data-field]", r).forEach(el=>{
    const k = el.name || el.id || el.getAttribute("data-field"); if(!k) return;
    if(el.type==="checkbox"){ el.checked = !!d[k]; } // 新增：Checkbox 支援
    else if(el.type!=="range") el.value = (d[k]==null ? "" : String(d[k]));
  });
  $$(".pill-toggle-group[data-field]", r).forEach(g=>{
    const k = g.getAttribute("data-field");
    const v = d[k];
    $$(".pill-toggle", g).forEach(b=>b.classList.toggle("active", b.getAttribute("data-value")===v));
  });
  $$(".chips[data-field]", r).forEach(w=>{
    const k = w.getAttribute("data-field");
    const set = new Set(d[k]||[]);
    $$(".chip", w).forEach(c=>c.classList.toggle("selected", set.has(c.getAttribute("data-value"))));
  });
  const visit = loadVisit();
  if($("#pain-now")) $("#pain-now").value = visit.vasNow ?? "";
  if($("#pain-max")) $("#pain-max").value = visit.vasMax ?? "";
};

const renderTherapistUI = (d)=>{
  d=d||{};
  const r = pages.therapist();
  $$("[data-field-pt]", r).forEach(el=>{
    if(el.closest(".chips")) return;
    const k = el.getAttribute("data-field-pt"); if(!k) return;
    el.value = (d[k]==null ? "" : String(d[k]));
  });
  $$(".chips[data-field-pt]", r).forEach(w=>{
    const k = w.getAttribute("data-field-pt");
    const set = new Set(d[k]||[]);
    $$(".chip", w).forEach(c=>c.classList.toggle("selected", set.has(c.getAttribute("data-value"))));
  });
  // 新增：重置動態區塊
  $("#rom-dynamic-container").innerHTML = `<div class="hint">請選擇關節以檢視數據。</div>`;
  $("#rom-joint-select").value = "";
  renderPainList(d.painParts || []);
  const visit = loadVisit();
  if($("#pain-now")) $("#pain-now").value = visit.vasNow ?? "";
  if($("#pain-max")) $("#pain-max").value = visit.vasMax ?? "";
};

// 新功能邏輯
function addPainPart() {
  const partSelect = $("#pain-part-select");
  const vasInput = $("#pain-part-vas");
  const part = partSelect.value;
  const vas = vasInput.value;
  if(!part || !vas) { alert("請選擇部位並填寫 VAS"); return; }
  const t = loadTherapist();
  const list = t.painParts || [];
  list.push({ part, vas });
  t.painParts = list;
  saveTherapist(t);
  renderPainList(list);
  partSelect.value = ""; vasInput.value = "";
}
function deletePainPart(idx) {
  const t = loadTherapist();
  const list = t.painParts || [];
  list.splice(idx, 1);
  t.painParts = list;
  saveTherapist(t);
  renderPainList(list);
}
function renderPainList(list) {
  const container = $("#pain-part-list");
  if(!container) return;
  container.innerHTML = "";
  list.forEach((item, idx) => {
    const div = document.createElement("div"); div.className = "pain-item";
    div.innerHTML = `<div><span>${item.part}</span>: VAS ${item.vas}</div>`;
    const btn = document.createElement("button"); btn.className = "btn-del-pain"; btn.textContent = "✕";
    btn.onclick = () => deletePainPart(idx);
    div.appendChild(btn);
    container.appendChild(div);
  });
}
function renderRomInputs(joint) {
  const container = $("#rom-dynamic-container");
  container.innerHTML = "";
  const motions = ROM_DATA[joint];
  if(!motions) return;
  const d = loadTherapist();
  motions.forEach(m => {
    const key = `${joint}_${m.name}`;
    const val = d[key] || "";
    const row = document.createElement("div"); row.className = "rom-row";
    row.innerHTML = `<div class="rom-label">${m.name} <span style="font-size:0.7em;color:#94a3b8">(${m.max})</span></div>
      <input type="number" class="rom-input" data-rom-key="${key}" data-min="${m.min}" data-max="${m.max}" placeholder="-">
      <input type="text" class="rom-note" placeholder="備註" style="font-size:0.8rem">`;
    const input = row.querySelector(".rom-input");
    input.value = val;
    checkRomValue(input);
    input.addEventListener("input", (e) => { checkRomValue(e.target); triggerAutoSave(); });
    container.appendChild(row);
  });
}
function checkRomValue(input) {
  const val = parseFloat(input.value);
  const max = parseFloat(input.dataset.max);
  input.classList.remove("high", "low", "normal");
  if(isNaN(val)) return;
  if (val > max * 1.05) input.classList.add("high");
  else if (val < max * 0.85) input.classList.add("low");
  else input.classList.add("normal");
}

const renderSummary = ()=>{
  const c = loadClient();
  const visit = loadVisit();
  $("#s-name").textContent = c.name || "—";
  $("#s-age-gender").textContent = `${c.age||"?"}歲 / ${c.gender||"-"}`;
  $("#s-main").textContent = $("#main-complaint").value || c.mainComplaint || "—";
  $("#s-pain-scale").textContent = `${visit.vasNow??"-"} / ${visit.vasMax??"-"}`;
};

// Case Management
const deleteCase = (caseId) => {
  if(!confirm("確定要刪除此個案？此動作無法復原。")) return;
  const lib = loadLib();
  delete lib[caseId];
  saveLib(lib);
  if(window.getCurrentCaseId() === caseId) {
    setCurrentCaseId(null);
    window.location.reload();
  } else {
    renderCaseList();
    showToast("已刪除個案");
  }
};

const renderCaseList = ()=>{
  const list = $("#case-list");
  if(!list) return;
  const lib = loadLib();
  const kw = ($("#case-search")?.value||"").trim().toLowerCase();
  const keys = Object.keys(lib).sort((a,b) => lib[b].records[lib[b].records.length-1].updatedAt - lib[a].records[lib[a].records.length-1].updatedAt);
  list.innerHTML = "";
  let count = 0;
  keys.forEach(id=>{
    const it = window.ensureCaseShape(lib[id]);
    const c = it.client || {};
    const lastRec = it.records[it.records.length-1] || {};
    const vas = lastRec.visit?.vasNow;
    if(kw && !(c.name + (c.mainComplaint||"")).toLowerCase().includes(kw)) return;
    count++;
    const card = document.createElement("div"); card.className = "case-card";
    const vasHtml = vas != null ? `<span class="vas-badge">VAS ${vas}</span>` : `<span style="color:#cbd5e1;font-size:0.75rem">No VAS</span>`;
    card.innerHTML = `
      <div class="cc-header"><div class="cc-name">${c.name || "未命名"}</div>${vasHtml}</div>
      <div class="cc-sub">${c.gender||""} ${c.age||"?"}歲</div>
      <div class="cc-body">${c.mainComplaint || "無主訴紀錄"}</div>
      <div class="cc-footer">
        <span>評估: ${it.records.length} 次</span>
        <span>${new Date(lastRec.updatedAt).toLocaleDateString()}</span>
        <button class="btn-icon btn-danger" title="刪除" style="margin-left:auto;z-index:2;">🗑</button>
      </div>`;
    card.onclick = (e) => {
      if(e.target.closest(".btn-danger")) { e.stopPropagation(); deleteCase(id); }
      else { openCase(id); }
    };
    list.appendChild(card);
  });
  $("#case-count").textContent = `${count} 位個案`;
};

function openCase(caseId){
  const lib = loadLib();
  const item = window.ensureCaseShape(lib[caseId]);
  if(!item) return;
  setCurrentCaseId(caseId);
  const idx = item.records.length-1;
  setCurrentRecordIndex(idx);
  saveClient(item.client);
  saveTherapist(item.records[idx].therapist);
  saveVisit(item.records[idx].visit);
  renderClientUI(loadClient());
  renderTherapistUI(loadTherapist());
  renderTimeline(item);
  renderSummary();
  if(window.renderVasChart) window.renderVasChart();
  // 強制跳轉
  switchTab("client");
  switchSubTab("client", "overview");
}

const upsertCurrentCaseAndRecord = ({markDone=false}={})=>{
  const caseId = window.getCurrentCaseId();
  const lib = loadLib();
  const cData = collectClient();
  const tData = collectTherapist();
  const vData = collectVisitFromSliders();
  if(!cData.name) { showToast("請填寫個案姓名", "error"); return null; }
  if(!caseId || !lib[caseId]){
    const id = `case_${now()}`;
    const item = { client: cData, records: [{ therapist: tData, visit: vData, status: markDone?"done":"draft", createdAt: now(), updatedAt: now() }] };
    lib[id] = item;
    saveLib(lib);
    setCurrentCaseId(id);
    setCurrentRecordIndex(0);
    return { item, caseId: id };
  }
  const item = window.ensureCaseShape(lib[caseId]);
  item.client = cData;
  const idx = getCurrentRecordIndex();
  item.records[idx] = { ...item.records[idx], therapist: tData, visit: vData, updatedAt: now(), status: markDone ? "done" : item.records[idx].status };
  lib[caseId] = item;
  saveLib(lib);
  return { item, caseId };
};

const renderTimeline = (item)=>{
  const wrap = $("#pt-timeline");
  if(!wrap) return;
  wrap.innerHTML = "";
  const recs = item.records || [];
  const idx = getCurrentRecordIndex();
  recs.forEach((r,i)=>{
    const chip = document.createElement("div");
    chip.className = "t-chip" + (i===idx ? " active" : "");
    chip.textContent = `第 ${i+1} 次`;
    chip.onclick = ()=>{
      setCurrentRecordIndex(i);
      saveTherapist(r.therapist||{});
      saveVisit(r.visit||{ vasNow:null, vasMax:null });
      renderTherapistUI(loadTherapist());
      renderClientUI(loadClient());
      renderTimeline(item);
      renderSummary();
      if(window.renderVasChart) window.renderVasChart();
    };
    wrap.appendChild(chip);
  });
};

function switchTab(key){
  $$(".tab-btn").forEach(b=>b.classList.toggle("active", b.dataset.target===`page-${key}`));
  $$(".page").forEach(p=>p.classList.remove("active"));
  pages[key]().classList.add("active");
  if(key==="cases") renderCaseList();
  if(key==="therapist") { 
    renderSummary(); 
    if(window.renderVasChart) window.renderVasChart();
    switchSubTab("therapist", "subjective");
    const t = loadTherapist();
    const key = Object.keys(t).find(k=>k.includes("_"));
    if(key) { const joint = key.split("_")[0]; $("#rom-joint-select").value = joint; renderRomInputs(joint); }
  }
}
function switchSubTab(scope, subKey) {
  $$(`#${scope}-subtabs .subtab-btn`).forEach(b=>b.classList.toggle("active", b.dataset.sub===subKey));
  $$(`.${scope}-subpage`).forEach(p=>p.classList.toggle("active", p.dataset.sub===subKey));
}

let autoSaveTimer = null;
const triggerAutoSave = () => { clearTimeout(autoSaveTimer); autoSaveTimer = setTimeout(() => {
  const active = $(".page.active").id;
  if(active==="page-client") saveClient(collectClient());
  if(active==="page-therapist") saveTherapist(collectTherapist());
}, 800); };

document.addEventListener("DOMContentLoaded", ()=>{
  $$(".tab-btn").forEach(b=>b.addEventListener("click", ()=>switchTab(b.dataset.target.replace("page-",""))));
  $$("#client-subtabs .subtab-btn").forEach(b=>b.addEventListener("click", ()=>switchSubTab("client", b.dataset.sub)));
  $$("#therapist-subtabs .subtab-btn").forEach(b=> { b.addEventListener("click", ()=> { switchSubTab("therapist", b.dataset.sub); }); });
  
  $("#btn-add-pain-part")?.addEventListener("click", addPainPart);
  $("#rom-joint-select")?.addEventListener("change", (e)=>{ renderRomInputs(e.target.value); });
  
  document.addEventListener("click", (e)=>{
    if(e.target.closest(".pill-toggle")){ const btn = e.target.closest(".pill-toggle"); const group = btn.closest(".pill-toggle-group"); $$(".pill-toggle", group).forEach(x=>x.classList.remove("active")); btn.classList.add("active"); triggerAutoSave(); renderSummary(); }
    if(e.target.closest(".chip")){ const chip = e.target.closest(".chip"); if(chip.classList.contains("insert-btn")) return; chip.classList.toggle("selected"); triggerAutoSave(); renderSummary(); }
    if(e.target.closest(".insert-btn")){ const btn = e.target.closest(".insert-btn"); const el = document.getElementById(btn.dataset.target); if(el) { el.value = el.value + " " + btn.dataset.insert; triggerAutoSave(); } }
    
    // 按鈕邏輯
    if(e.target.id === "btn-clear") { if(confirm("清除暫存？")) { localStorage.clear(); location.reload(); } }
    if(e.target.id === "btn-goto-therapist") { const res = upsertCurrentCaseAndRecord({ markDone:false }); if(res) switchTab("therapist"); }
    if(e.target.id === "btn-mark-done") { 
      const res = upsertCurrentCaseAndRecord({ markDone:true }); 
      if(res) { 
        showToast("同步中...", "info"); 
        window.syncCaseToSupabase().then(() => showToast("✅ 評估已完成並同步！", "success")); 
      } 
    }
    if(e.target.id === "btn-back-client") { switchTab("client"); }
  });
  
  $("input,textarea").forEach(el=>el.addEventListener("input", triggerAutoSave));
  $("#case-search")?.addEventListener("input", renderCaseList);

  renderClientUI(loadClient());
  renderTherapistUI(loadTherapist());
  renderSummary();
  renderCaseList();
  if(window.syncPatientsFromSupabase) window.syncPatientsFromSupabase();
});
