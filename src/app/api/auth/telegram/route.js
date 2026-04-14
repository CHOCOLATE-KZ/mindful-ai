// src/app/api/auth/telegram/route.js
// Аутентификация через Telegram Login Widget

import { NextResponse } from "next/server";
import { createHash, createHmac } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Обработка входа по коду от бота
 */
async function handleCodeLogin(code) {
  try {
    const now = new Date().toISOString();

    // Атомарно помечаем токен как использованный, если он еще валиден.
    const { data: token, error: tokenError } = await supabaseAdmin
      .from('telegram_login_tokens')
      .update({ used: true })
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', now)
      .select('id, telegram_id')
      .maybeSingle();

    if (tokenError || !token) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 401 }
      );
    }

    const telegramId = token.telegram_id;

    // Ищем или создаем пользователя
    const result = await findOrCreateUserByTelegramId(telegramId);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      userId: result.userId,
      isNewUser: result.isNewUser,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    console.error('Code login error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Найти или создать пользователя по telegram_id
 */
async function findOrCreateUserByTelegramId(telegramId) {
  // Ищем существующий профиль
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, telegram_username")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (existingProfile) {
    // Получаем email пользователя из auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(existingProfile.id);
    
    if (userError || !userData?.user?.email) {
      return { error: "Failed to get user data" };
    }

    // Генерируем токены для существующего пользователя
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
    });

    if (linkError || !linkData?.properties?.email_otp) {
      console.error('generateLink error:', linkError);
      return { error: "Failed to generate auth tokens" };
    }

    // Верифицируем OTP для получения сессии
    const { data: sessionData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      email: userData.user.email,
      token: linkData.properties.email_otp,
      type: 'email'
    });

    if (verifyError || !sessionData?.session) {
      console.error('verifyOtp error:', verifyError);
      return { error: "Failed to create session" };
    }

    return {
      userId: existingProfile.id,
      isNewUser: false,
      accessToken: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
    };
  }

  // Создаем нового пользователя
  const tempEmail = `telegram_${telegramId}@temp.iitu.local`;
  const randomPassword = createHash("sha256")
    .update(`${telegramId}_${Date.now()}_${Math.random()}`)
    .digest("hex")
    .substring(0, 32);

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: tempEmail,
    password: randomPassword,
    email_confirm: true,
    user_metadata: {
      name: `User ${telegramId}`,
      telegram_id: telegramId,
      auth_provider: "telegram",
    },
  });

  if (authError) {
    return { error: "Failed to create user account" };
  }

  const userId = authData.user.id;

  // Обновляем профиль
  await supabaseAdmin
    .from("profiles")
    .update({
      telegram_id: telegramId,
      name: `User ${telegramId}`,
    })
    .eq("id", userId);

  // Создаем настройки
  await supabaseAdmin.from("user_settings").insert({
    user_id: userId,
    theme: "light",
    language: "ru",
    push_enabled: false,
    data_sharing_ai: true,
  });

  // Генерируем сессию
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: tempEmail,
  });

  if (linkError || !linkData?.properties?.email_otp) {
    console.error('generateLink error (new user):', linkError);
    return { error: "Failed to generate auth tokens" };
  }

  // Верифицируем OTP для получения сессии
  const { data: sessionData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
    email: tempEmail,
    token: linkData.properties.email_otp,
    type: 'email'
  });

  if (verifyError || !sessionData?.session) {
    console.error('verifyOtp error (new user):', verifyError);
    return { error: "Failed to create session" };
  }

  return {
    userId,
    isNewUser: true,
    accessToken: sessionData.session.access_token,
    refreshToken: sessionData.session.refresh_token,
  };
}

/**
 * Проверка подлинности данных от Telegram
 * https://core.telegram.org/widgets/login#checking-authorization
 */
function verifyTelegramAuth(data, botToken) {
  const { hash, ...authData } = data;

  // Создаем строку data-check-string
  const checkString = Object.keys(authData)
    .sort()
    .map((key) => `${key}=${authData[key]}`)
    .join("\n");

  // Создаем secret key из bot token
  const secretKey = createHash("sha256").update(botToken).digest();

  // Вычисляем hash
  const calculatedHash = createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  // Проверяем совпадение
  if (calculatedHash !== hash) {
    return false;
  }

  // Проверяем срок действия (не старше 1 дня)
  const authDate = parseInt(authData.auth_date);
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime - authDate > 86400) {
    // 24 hours
    return false;
  }

  return true;
}

/**
 * POST /api/auth/telegram
 * Обрабатывает вход через Telegram
 * Принимает либо данные от виджета (с hash), либо код от бота
 */
export async function POST(request) {
  try {
    const data = await request.json();

    // Метод 1: Вход по коду от бота
    if (data.code && !data.hash) {
      return await handleCodeLogin(data.code);
    }

    // Метод 2: Вход через виджет (оригинальный)
    // Проверяем наличие необходимых полей
    if (!data.id || !data.hash || !data.auth_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Проверяем подлинность данных
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: "Telegram bot token not configured" },
        { status: 500 }
      );
    }

    const isValid = verifyTelegramAuth(data, botToken);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Telegram authentication data" },
        { status: 401 }
      );
    }

    const telegramId = data.id;
    const firstName = data.first_name || "";
    const lastName = data.last_name || "";
    const username = data.username || null;
    const photoUrl = data.photo_url || null;

    // Ищем существующий профиль с этим telegram_id
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, user_id")
      .eq("telegram_id", telegramId)
      .maybeSingle();

    let userId;
    let isNewUser = false;

    if (existingProfile) {
      // Пользователь с таким telegram_id уже существует
      userId = existingProfile.id;
    } else {
      // Создаем нового пользователя
      // Генерируем временный email вида: telegram_{telegram_id}@temp.iitu.local
      const tempEmail = `telegram_${telegramId}@temp.iitu.local`;
      
      // Генерируем случайный пароль (пользователь не будет его знать)
      const randomPassword = createHash("sha256")
        .update(`${telegramId}_${Date.now()}_${Math.random()}`)
        .digest("hex")
        .substring(0, 32);

      // Создаем пользователя в Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: tempEmail,
        password: randomPassword,
        email_confirm: true, // Автоматически подтверждаем email
        user_metadata: {
          name: `${firstName} ${lastName}`.trim() || username || `User ${telegramId}`,
          telegram_id: telegramId,
          telegram_username: username,
          auth_provider: "telegram",
        },
      });

      if (authError) {
        console.error("Error creating user:", authError);
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 }
        );
      }

      userId = authData.user.id;
      isNewUser = true;

      // Обновляем профиль с telegram данными
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          telegram_id: telegramId,
          telegram_username: username,
          name: `${firstName} ${lastName}`.trim() || username || `User ${telegramId}`,
          avatar_url: photoUrl,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating profile:", updateError);
      }

      // Создаем дефолтные настройки
      await supabaseAdmin.from("user_settings").insert({
        user_id: userId,
        theme: "light",
        language: "ru",
        notifications_enabled: true,
        data_sharing_with_ai: true,
      });
    }

    // Генерируем access token для пользователя
    // ВАЖНО: В production используйте более безопасный метод
    const { data: sessionData, error: sessionError } = 
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: existingProfile 
          ? `telegram_${telegramId}@temp.iitu.local`
          : `telegram_${telegramId}@temp.iitu.local`,
      });

    if (sessionError) {
      console.error("Error generating session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      isNewUser,
      redirectUrl: sessionData?.properties?.action_link || "/profile",
      message: isNewUser 
        ? "Account created successfully" 
        : "Login successful",
    });
  } catch (error) {
    console.error("Telegram auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
