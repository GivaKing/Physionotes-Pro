// === HiDPI Canvas Helper ===
function setupHiDpiCanvas(canvas, w, h) {
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return ctx;
}

function clearVasChart(){
  const sec = document.getElementById("vas-chart-section");
  const hint = document.getElementById("vas-empty-hint");
  if(sec) sec.style.display = "none";
  if(hint) hint.style.display = "none";
  const cvs = document.getElementById("vas-chart");
  if(cvs) {
    const ctx = cvs.getContext("2d");
    ctx.clearRect(0,0,cvs.width,cvs.height);
  }
}

function renderVasChart() {
  const cvs = document.getElementById("vas-chart");
  if (!cvs) return;
  const sec = document.getElementById("vas-chart-section");
  const hint = document.getElementById("vas-empty-hint");
  if(sec) sec.style.display = "none";
  if(hint) hint.style.display = "none";

  // 依賴 window.getCurrentCaseId 等全域函數
  if(!window.getCurrentCaseId || !window.loadLib || !window.ensureCaseShape) return;
  
  const caseId = window.getCurrentCaseId();
  if (!caseId) { clearVasChart(); return; }

  const lib = window.loadLib();
  const item = window.ensureCaseShape(lib[caseId]);
  if (!item || !item.records) { clearVasChart(); return; }

  const N = item.records.length;
  const points = item.records.map((r, i) => ({
      idx: i + 1,
      vasNow: (r.visit?.vasNow ?? null),
      vasMax: (r.visit?.vasMax ?? null),
  })).filter(p => p.vasNow != null || p.vasMax != null);

  if (points.length < 1) { clearVasChart(); return; }

  if(sec) sec.style.display = "block";
  
  const cssW = (cvs.clientWidth || 320);
  const cssH = 180;
  const ctx = setupHiDpiCanvas(cvs, cssW, cssH);
  ctx.clearRect(0, 0, cssW, cssH);

  const W = cssW, H = cssH;
  const padL = 36, padR = 14, padT = 14, padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  if (plotW <= 0 || plotH <= 0) return;

  // Grid
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  [0, 5, 10].forEach(v => {
    const y = (H - padB) - plotH * (v / 10);
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
  });
  ctx.stroke();

  // Y Axis Text
  ctx.fillStyle = "#64748b";
  ctx.font = "11px system-ui";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  [0, 5, 10].forEach(v => {
    const y = (H - padB) - plotH * (v / 10);
    ctx.fillText(String(v), padL - 6, y);
  });

  // X Axis Text
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  let step = N > 20 ? 5 : (N > 10 ? 2 : 1);
  for (let i = 1; i <= N; i += step) {
    const x = padL + plotW * ((i - 1) / Math.max(1, N - 1));
    ctx.fillText(String(i), x, H - padB + 6);
  }

  const xOf = (visitIdx) => padL + plotW * ((visitIdx - 1) / Math.max(1, N - 1));
  const yOf = (vas) => (H - padB) - plotH * (Number(vas) / 10);

  const drawLine = (pts, key, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    let started = false;
    pts.forEach(p => {
      if (p[key] == null) return;
      const x = xOf(p.idx), y = yOf(p[key]);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  drawLine(points, "vasNow", "#2563eb");
  drawLine(points, "vasMax", "#dc2626");

  const drawDot = (pts, key, color) => {
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    pts.forEach(p => {
      if (p[key] == null) return;
      const x = xOf(p.idx), y = yOf(p[key]);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  };

  drawDot(points, "vasNow", "#2563eb");
  drawDot(points, "vasMax", "#dc2626");
}