const SUPABASE_URL = "https://yvacvzulhaaehffbhttt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YWN2enVsaGFhZWhmZmJodHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTg1ODUsImV4cCI6MjA4MTQ3NDU4NX0.6tgcZoxClNCn9y5lft_H1XF2pfQGPb6beehSuQLEMD0";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authScreen = document.getElementById("auth-screen");
const appRoot = document.getElementById("app-root");
const emailInput = document.getElementById("auth-email");
const pwInput = document.getElementById("auth-password");
const btnTogglePw = document.getElementById("btn-toggle-pw");
const authError = document.getElementById("auth-error");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const btnAuth = document.getElementById("btn-auth-submit");
const btnLogout = document.getElementById("btn-logout");
let authMode = "login";

function setAuthMode(mode){
  authMode = mode;
  const card = document.querySelector(".auth-card");
  if (card) card.classList.toggle("signup", mode === "signup");
  if (mode === "login"){
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
    btnAuth.textContent = "登入";
    if(pwInput) pwInput.autocomplete = "current-password";
  } else {
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");
    btnAuth.textContent = "註冊";
    if(pwInput) pwInput.autocomplete = "new-password";
  }
  authError.textContent = "";
}

function showApp(){
  if (!appRoot || !authScreen) return;
  authScreen.classList.add("hidden");
  appRoot.classList.remove("hidden");
}

function showLogin(){
  if (!appRoot || !authScreen) return;
  appRoot.classList.add("hidden");
  authScreen.classList.remove("hidden");
}

async function handleAuthSubmit(){
  const email = (emailInput?.value || "").trim();
  const password = pwInput?.value || "";
  authError.textContent = "";
  if (!email || !password){
    authError.textContent = "請輸入 Email 與密碼。";
    return;
  }
  try {
    if (authMode === "login"){
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const ok = await guardRoleOrBlock();
      if (!ok) return;
      
      // 注意：這裡假設 clearLocalDraft 是全局函數或掛在 window 上，否則需在 app.js 初始化
      if(window.clearLocalDraft) window.clearLocalDraft();
      
      showApp();
      await renderUserChip();
      if(window.syncPatientsFromSupabase) await window.syncPatientsFromSupabase();
      if(window.subscribePatientsRealtime) window.subscribePatientsRealtime();
    } else {
      if (document.getElementById("agree-terms") && !document.getElementById("agree-terms").checked) {
        authError.textContent = "請先閱讀並同意註冊須知。";
        return;
      }
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      const user = data.user;
      if (!user) throw new Error("使用者建立失敗");
      const { error: profileError } = await sb.from("profiles").insert({
        user_id: user.id,
        email: user.email,
        name: document.getElementById("auth-name")?.value || "",
        birthday: document.getElementById("auth-birthday")?.value || "",
        job: document.getElementById("auth-job")?.value || "",
        role: "pending",
      });
      if (profileError) throw profileError;
      await sb.auth.signOut();
      alert("註冊成功！請聯絡管理員開通權限。");
      pwInput.value = "";
    }
  } catch(err){
    console.error(err);
    authError.textContent = err.message || "登入 / 註冊失敗。";
  }
}

async function getMyProfile(){
  const { data: userResult } = await sb.auth.getUser();
  const user = userResult?.user;
  if (!user) return null;
  const { data, error } = await sb.from("profiles").select("role, trial_patient_limit").eq("user_id", user.id).maybeSingle();
  if (error) return null;
  return data || null;
}

async function guardRoleOrBlock() {
  const profile = await getMyProfile();
  if (!profile) return false;
  if (!profile.role) {
    alert("此帳號尚未建立權限資料。");
    await sb.auth.signOut();
    showLogin();
    return false;
  }
  if (profile.role === "pending") {
    alert("帳號等待開通中。");
    await sb.auth.signOut();
    showLogin();
    return false;
  }
  window.__role = profile.role;
  window.__profile = profile;
  return true;
}

async function renderUserChip(){
  const chip = document.getElementById("user-chip");
  const text = document.getElementById("user-text");
  if (!chip || !text) return;
  const { data: { user } } = await sb.auth.getUser();
  if (!user){ chip.classList.add("hidden"); return; }
  let label = user.email || "User";
  const { data: prof } = await sb.from("profiles").select("name").eq("user_id", user.id).maybeSingle();
  if (prof?.name) label = prof.name;
  else if (label.includes("@")) label = label.split("@")[0];
  text.textContent = label;
  chip.classList.remove("hidden");
}

// User menu logic
window.toggleUserMenu = () => document.getElementById("user-menu")?.classList.toggle("hidden");
window.openUserMenu = () => document.getElementById("user-menu")?.classList.remove("hidden");
window.closeUserMenu = () => setTimeout(()=>document.getElementById("user-menu")?.classList.add("hidden"), 300);
window.logoutFromMenu = () => { document.getElementById("user-menu")?.classList.add("hidden"); document.getElementById("btn-logout")?.click(); };

window.openProfileDrawer = async () => {
  document.getElementById("user-menu")?.classList.add("hidden");
  document.getElementById("profile-drawer")?.classList.remove("hidden");
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  document.getElementById("profile-email").value = user.email || "";
  const { data } = await sb.from("profiles").select("name, job, trial_patient_limit").eq("user_id", user.id).maybeSingle();
  document.getElementById("profile-name").value = data?.name || "";
  document.getElementById("profile-job").value = data?.job || "";
  document.getElementById("profile-trial_patient_limit").value = data?.trial_patient_limit ?? "-";
};
window.closeProfileDrawer = () => document.getElementById("profile-drawer")?.classList.add("hidden");
window.saveProfile = async () => {
  const name = document.getElementById("profile-name").value.trim();
  const job = document.getElementById("profile-job").value.trim();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  const { error } = await sb.from("profiles").update({ name, job }).eq("user_id", user.id);
  if (error) alert("儲存失敗");
  else {
    alert("個人資料已更新");
    closeProfileDrawer();
    renderUserChip();
  }
};
window.onDrawerMaskClick = (e) => { if(e.target.id === "profile-drawer") closeProfileDrawer(); };

// Bind Auth Events
if (tabLogin) tabLogin.addEventListener("click", () => setAuthMode("login"));
if (tabSignup) tabSignup.addEventListener("click", () => setAuthMode("signup"));
if (btnAuth) btnAuth.addEventListener("click", handleAuthSubmit);
if (pwInput) pwInput.addEventListener("keydown", (e)=>{ if (e.key === "Enter") handleAuthSubmit(); });
if (btnTogglePw) btnTogglePw.addEventListener("click", ()=>{ pwInput.type = (pwInput.type === "password") ? "text" : "password"; });
if (btnLogout) btnLogout.addEventListener("click", async () => {
  if (window.clearLocalDraft) window.clearLocalDraft();
  await sb.auth.signOut();
  showLogin();
});

// Init
document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await sb.auth.getSession();
  if (!data?.session) { showLogin(); return; }
  const ok = await guardRoleOrBlock();
  if (ok) {
    showApp();
    await renderUserChip();
    if(window.syncPatientsFromSupabase) await window.syncPatientsFromSupabase();
    if(window.subscribePatientsRealtime) window.subscribePatientsRealtime();
  }
});