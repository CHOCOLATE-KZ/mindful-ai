"use client";

import { useEffect, useMemo, useState } from "react";

export function useProfileData(supabase, initial = {}) {
  const [loading, setLoading] = useState(!initial?.initialUser);
  const [user, setUser] = useState(initial?.initialUser ?? null);
  const [profile, setProfile] = useState(initial?.initialProfile ?? null);
  const [settings, setSettings] = useState(initial?.initialSettings ?? null);
  const [msg, setMsg] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [nameDraft, setNameDraft] = useState(initial?.initialProfile?.name || "");
  const [passwordDraft, setPasswordDraft] = useState("");

  const [stats, setStats] = useState({
    activeDays: 0,
    dayStreak: 0,
    achievements: 0,
    overallMood: 0,
    avgSleepHours: 0,
    goalsCompletedPct: 0,
  });

  useEffect(() => {
    let mounted = true;

    // если initialUser уже есть — загружаем stats
    (async () => {
      try {
        const res = await fetch("/api/profile/stats");
        if (!mounted) return;
        
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function updateSettings(patch) {
    if (!user) return;
    const prev = settings || {};
    const next = { ...prev, ...patch, user_id: user.id, updated_at: new Date().toISOString() };
    setSettings(next);

    const { error } = await supabase.from("user_settings").upsert(next);
    if (error) {
      setSettings(prev);
      setMsg(error.message || "Failed to update settings");
    }
  }

  async function saveProfile() {
    if (!user) return;
    const name = (nameDraft || "").trim();
    if (!name) {
      setMsg("Введите имя");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({ id: user.id, name });
    if (error) {
      setMsg(error.message);
      return;
    }

    setProfile((p) => ({ ...(p || {}), name }));
    setMsg("Профиль обновлён ");
    setEditOpen(false);
  }

  async function changePassword() {
    const pwd = (passwordDraft || "").trim();
    if (pwd.length < 6) {
      setMsg("Пароль должен быть минимум 6 символов");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) setMsg(error.message);
    else {
      setMsg("Пароль обновлён ");
      setPasswordDraft("");
      setSecurityOpen(false);
    }
  }

  async function deleteAccount() {
    setMsg("");
    try {
      const res = await fetch("/api/profile/delete", { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Delete failed");
      }
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      setMsg(e?.message || "Ошибка при удалении аккаунта");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function exportMyData(format = "json") {
    try {
      setMsg("");
      const res = await fetch("/api/profile/export");

      if (!res.ok) {
        const data = await res.json();
        setMsg(data.error || "Failed to export data");
        return;
      }

      const exportData = await res.json();

      if (format === "pdf") {
        exportAsPdf(exportData);
      } else {
        // JSON download
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `mindfulai_export_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setMsg("Данные экспортированы ✓");
      }
    } catch (err) {
      setMsg(err.message || "Error exporting data");
    }
  }

  function exportAsPdf(data) {
    const profile = data.profile || {};
    const notes = (data.data?.notes || []).slice().reverse(); // oldest first
    const messages = (data.data?.aiMessages || []).slice().reverse();
    const tests = data.data?.tests || [];
    const exportedAt = new Date(data.exportedAt).toLocaleString("ru-RU");
    const stats = data.statistics || {};

    const avgMood = notes.filter(n => n.mood).length
      ? (notes.filter(n => n.mood).reduce((s, n) => s + n.mood, 0) / notes.filter(n => n.mood).length).toFixed(1)
      : "—";
    const avgSleep = notes.filter(n => n.sleep).length
      ? (notes.filter(n => n.sleep).reduce((s, n) => s + n.sleep, 0) / notes.filter(n => n.sleep).length).toFixed(1)
      : "—";

    const moodColor = (m) => {
      if (!m) return "#94a3b8";
      if (m >= 7) return "#10b981";
      if (m >= 4) return "#f59e0b";
      return "#ef4444";
    };

    const notesRows = notes.slice(-30).map(n => `
      <tr>
        <td>${n.date || ""}</td>
        <td style="color:${moodColor(n.mood)};font-weight:600">${n.mood ?? "—"}</td>
        <td>${n.sleep ?? "—"}ч</td>
        <td>${n.stress ?? "—"}</td>
        <td>${n.energy ?? "—"}</td>
        <td style="color:#64748b;font-size:11px">${(n.comment || "").slice(0, 60)}</td>
      </tr>`).join("");

    const testsRows = tests.map(t => `
      <tr>
        <td>${new Date(t.created_at).toLocaleDateString("ru-RU")}</td>
        <td>${t.test_key || "—"}</td>
        <td>${t.result?.score ?? t.result?.level ?? "—"}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<title>MindfulAI — Экспорт данных</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;color:#1e293b;background:#fff;line-height:1.6}
  .page{max-width:800px;margin:0 auto;padding:40px 40px 60px}
  .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:24px;border-bottom:2px solid #e2e8f0;margin-bottom:32px}
  .logo{font-size:22px;font-weight:700;color:#0f172a}.logo span{color:#74AA9C}
  .meta{font-size:12px;color:#94a3b8;text-align:right}
  .section{margin-bottom:36px}
  .section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#74AA9C;margin-bottom:14px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .stat-card{background:#f8fafc;border-radius:12px;padding:16px;text-align:center}
  .stat-value{font-size:26px;font-weight:700;color:#0f172a}
  .stat-label{font-size:11px;color:#94a3b8;margin-top:2px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  thead tr{background:#f1f5f9}
  th{padding:8px 10px;text-align:left;font-weight:600;color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
  td{padding:7px 10px;border-bottom:1px solid #f1f5f9;color:#334155}
  tr:last-child td{border-bottom:none}
  .chat-list{display:flex;flex-direction:column;gap:8px}
  .chat-msg{padding:10px 14px;border-radius:10px;font-size:12px;line-height:1.5}
  .chat-msg.user{background:#eff6ff;border-left:3px solid #3b82f6}
  .chat-msg.assistant{background:#f0fdf4;border-left:3px solid #74AA9C}
  .chat-role{font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;margin-bottom:2px}
  .chat-date{font-size:10px;color:#cbd5e1;float:right}
  .footer{margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
  @media print{
    body{print-color-adjust:exact;-webkit-print-color-adjust:exact}
    .section{page-break-inside:avoid}
    .no-print{display:none}
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">Mindful<span>AI</span></div>
    <div class="meta">Экспорт данных<br/>${exportedAt}</div>
  </div>

  <div class="section">
    <div class="section-title">Профиль</div>
    <table><tbody>
      <tr><td style="width:160px;color:#94a3b8">Имя</td><td>${profile.name || "—"}</td></tr>
      <tr><td style="color:#94a3b8">Язык</td><td>${data.settings?.language?.toUpperCase() || "RU"}</td></tr>
      <tr><td style="color:#94a3b8">Аккаунт создан</td><td>${profile.created_at ? new Date(profile.created_at).toLocaleDateString("ru-RU") : "—"}</td></tr>
    </tbody></table>
  </div>

  <div class="section">
    <div class="section-title">Общая статистика</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">${stats.totalNotes || 0}</div><div class="stat-label">Записей</div></div>
      <div class="stat-card"><div class="stat-value">${avgMood}</div><div class="stat-label">Ср. настроение</div></div>
      <div class="stat-card"><div class="stat-value">${avgSleep}</div><div class="stat-label">Ср. сон (ч)</div></div>
      <div class="stat-card"><div class="stat-value">${stats.totalMessages || 0}</div><div class="stat-label">Сообщений ИИ</div></div>
    </div>
  </div>

  ${notes.length > 0 ? `
  <div class="section">
    <div class="section-title">Дневник (последние 30 записей)</div>
    <table>
      <thead><tr><th>Дата</th><th>Настроение</th><th>Сон</th><th>Стресс</th><th>Энергия</th><th>Комментарий</th></tr></thead>
      <tbody>${notesRows}</tbody>
    </table>
  </div>` : ""}

  ${tests.length > 0 ? `
  <div class="section">
    <div class="section-title">Результаты тестов</div>
    <table>
      <thead><tr><th>Дата</th><th>Тест</th><th>Результат</th></tr></thead>
      <tbody>${testsRows}</tbody>
    </table>
  </div>` : ""}

  ${messages.length > 0 ? `
  <div class="section">
    <div class="section-title">История чата (последние 20 сообщений)</div>
    <div class="chat-list">
      ${messages.slice(-20).map(m => `
        <div class="chat-msg ${m.role}">
          <span class="chat-role">${m.role === "user" ? "Вы" : "MindfulAI"}</span>
          <span class="chat-date">${new Date(m.created_at).toLocaleDateString("ru-RU")}</span>
          <div>${(m.content || "").slice(0, 300)}${(m.content || "").length > 300 ? "…" : ""}</div>
        </div>`).join("")}
    </div>
  </div>` : ""}

  <div class="footer">
    Документ создан приложением MindfulAI • ${exportedAt} • Данные принадлежат только вам
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body></html>`;

    const win = window.open("", "_blank");
    if (!win) {
      setMsg("Разрешите всплывающие окна в браузере для PDF-экспорта");
      return;
    }
    win.document.write(html);
    win.document.close();
  }

  async function onAvatarSelected(file) {
    if (!user || !file) return;

    try {
      setMsg("");

      const ext =
        file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = pub?.publicUrl;

      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id)
        .select("id, name, avatar_url")
        .maybeSingle();

      if (error) throw error;

      setProfile(data || null);
      setMsg("Аватар обновлен");
    } catch (e) {
      setMsg(e?.message || "Не удалось загрузить аватар");
    }
  }

  return {
    loading,
    user,
    profile,
    settings,
    stats,
    msg,
    ui: { editOpen, setEditOpen, privacyOpen, setPrivacyOpen, securityOpen, setSecurityOpen, deleteOpen, setDeleteOpen, nameDraft, setNameDraft, passwordDraft, setPasswordDraft },
    actions: { updateSettings, saveProfile, changePassword, deleteAccount, exportMyData, signOut, onAvatarSelected },
  };
}
