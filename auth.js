// ... (保留 Supabase Config) ...
const SUPABASE_URL = "https://yvacvzulhaaehffbhttt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YWN2enVsaGFhZWhmZmJodHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTg1ODUsImV4cCI6MjA4MTQ3NDU4NX0.6tgcZoxClNCn9y5lft_H1XF2pfQGPb6beehSuQLEMD0";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authScreen = document.getElementById("auth-screen");
const appRoot = document.getElementById("app-root");
// ... (Auth Logic 沿用) ...

// User Chip Logic (完全重寫以確保下拉選單正常)
window.toggleUserMenu = () => document.getElementById("user-menu")?.classList.toggle("active");
window.openUserMenu = () => document.getElementById("user-menu")?.classList.add("active");
window.closeUserMenu = () => setTimeout(()=>document.getElementById("user-menu")?.classList.remove("active"), 300);

window.logoutFromMenu = async () => {
  await sb.auth.signOut();
  window.location.reload();
};

window.openProfileDrawer = async () => {
  document.getElementById("user-menu")?.classList.remove("active");
  document.getElementById("profile-drawer")?.classList.remove("hidden");
  // ... (Fetch profile logic) ...
};
window.closeProfileDrawer = () => document.getElementById("profile-drawer")?.classList.add("hidden");
window.saveProfile = async () => {
  // ... (Save logic) ...
  closeProfileDrawer();
};
window.onDrawerMaskClick = (e) => { if(e.target.id === "profile-drawer") closeProfileDrawer(); };

// Auth Bindings
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const btnAuth = document.getElementById("btn-auth-submit");
// ... (Bind Auth Buttons) ...

// Init
document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await sb.auth.getSession();
  if (!data?.session) { 
    if(authScreen) authScreen.classList.remove("hidden");
    if(appRoot) appRoot.classList.add("hidden");
    return; 
  }
  // If session exists
  if(authScreen) authScreen.classList.add("hidden");
  if(appRoot) appRoot.classList.remove("hidden");
  // Render user chip
  const chip = document.getElementById("user-chip");
  const text = document.getElementById("user-text");
  if(chip && text) {
    text.textContent = data.session.user.email;
    chip.classList.remove("hidden");
  }
  if(window.syncPatientsFromSupabase) window.syncPatientsFromSupabase();
});
