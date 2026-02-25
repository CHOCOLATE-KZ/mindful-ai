// src/components/TelegramLoginButton.jsx
// Кнопка входа через Telegram Login Widget

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TelegramLoginButton({ 
  size = 'large', // small, medium, large
  redirectUrl = '/profile',
  className = '',
}) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Загружаем Telegram Widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'IITUpsychologyAIbot');
    script.setAttribute('data-size', size);
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    // Добавляем глобальную функцию обработки
    window.onTelegramAuth = async (user) => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }

        // Перенаправляем пользователя
        if (data.redirectUrl) {
          // Если есть action_link от Supabase, используем его для установки сессии
          window.location.href = data.redirectUrl;
        } else {
          router.push(redirectUrl);
        }
      } catch (err) {
        console.error('Telegram login error:', err);
        setError(err.message || 'Failed to login with Telegram');
        setLoading(false);
      }
    };

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      // Cleanup
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [size, router, redirectUrl]);

  return (
    <div className={className}>
      <div ref={containerRef} className="flex items-center justify-center">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-black/60">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Logging in...
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 text-sm text-rose-600">
          {error}
        </div>
      )}
    </div>
  );
}
