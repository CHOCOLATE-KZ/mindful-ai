// src/app/(app)/profile/_components/TelegramLinkCard.jsx
// Карточка для связи Telegram аккаунта

'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function TelegramLinkCard() {
  const supabase = supabaseBrowser();
  const [user, setUser] = useState(null);
  const [isTelegramLinked, setIsTelegramLinked] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState(null);
  const [deepLink, setDeepLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Проверяем связана ли уже учетная запись
        const { data: profile } = await supabase
          .from('profiles')
          .select('telegram_id, telegram_username')
          .eq('id', user.id)
          .single();

        setIsTelegramLinked(!!profile?.telegram_id);
        setTelegramUsername(profile?.telegram_username || null);
      }
    })();
  }, [supabase]);

  const generateDeepLink = async () => {
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/telegram/deep-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при генерации ссылки');
      }

      setDeepLink(data.deepLink);
      setMessage('✅ Ссылка сгенерирована! Нажмите кнопку ниже или скопируйте ссылку.');
    } catch (error) {
      console.error('Ошибка:', error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!deepLink) return;

    try {
      await navigator.clipboard.writeText(deepLink);
      setMessage('✅ Ссылка скопирована в буфер обмена!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('❌ Ошибка при копировании');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-blue-600" />

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/500px-Telegram_logo.svg.png" 
            alt="Telegram" 
            className="h-8 w-8"
          />
        </div>
        <div>
          <h3 className="text-base font-semibold text-black">
            Telegram
          </h3>
          <p className="text-sm text-black/60">
            {isTelegramLinked
              ? '✅ Аккаунт связан'
              : 'Свяжите Telegram для синхронизации данных'}
          </p>
        </div>
      </div>

      {isTelegramLinked && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-700">
              ✅ Ваш Telegram аккаунт связан с профилем
              {telegramUsername && (
                <>
                  :{' '}
                  <span className="font-semibold">@{telegramUsername}</span>
                </>
              )}
              <br />
              Все данные синхронизируются автоматически между сайтом и ботом.
            </p>
          </div>

          <a
            href="https://t.me/IITUpsychologyAIbot"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl bg-blue-600 px-4 py-2.5 text-center text-white font-medium hover:bg-blue-700 transition"
          >
            💬 Открыть бота
          </a>
        </div>
      )}

      {!isTelegramLinked && (
        <>
          <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-700">
              💡 Свяжите Telegram аккаунт, чтобы:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-600">
              <li>Управлять заметками через бота</li>
              <li>Получать уведомления в Telegram</li>
              <li>Синхронизировать все данные</li>
            </ul>
          </div>

          {deepLink ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-black/70">
                Ваша ссылка для связи:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={deepLink}
                  readOnly
                  className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black"
                />
                <button
                  onClick={copyToClipboard}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                >
                  📋 Копировать
                </button>
              </div>

              <a
                href={deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-blue-600 px-4 py-2.5 text-center text-white font-medium hover:bg-blue-700 transition"
              >
                🤖 Перейти к боту
              </a>
            </div>
          ) : (
            <button
              onClick={generateDeepLink}
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? '⏳ Генерируется...' : '🔗 Сгенерировать ссылку'}
            </button>
          )}
        </>
      )}

      {message && (
        <p
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            message.startsWith('✅')
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
