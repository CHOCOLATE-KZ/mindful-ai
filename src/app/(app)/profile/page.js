import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in?next=/profile");

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("id, name, avatar_url, telegram_id, telegram_username").eq("id", user.id).maybeSingle(),
    supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <ProfileClient
      initialUser={user}
      initialProfile={profile}
      initialSettings={settings}
    />
  );
}
