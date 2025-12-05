"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthFrame from "@/components/AuthFrame";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setLoading(false);
        return;
      }

      // загрузка профиля из таблицы profiles
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setName(data?.name || "");
      setLoading(false);
    }

    loadProfile();
  }, []);

  async function updateProfile(e) {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", profile.id);
    setLoading(false);
    if (error) alert(error.message);
    else alert("Профиль обновлён!");
  }

  if (loading) return <p className="text-center py-10">Загрузка...</p>;

  if (!profile)
    return (
      <p className="text-center py-10 text-gray-600">
        Не удалось загрузить профиль.
      </p>
    );

  return (
    <AuthFrame>
      <LiquidGlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Мой профиль</h1>
        <p className="text-gray-600 text-sm mb-6">{profile.email}</p>

        <form onSubmit={updateProfile} className="space-y-4">
          <div className="grid gap-1">
            <Label>Имя</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
            />
          </div>

          <Button className="w-full">Сохранить изменения</Button>
        </form>
      </LiquidGlassCard>
    </AuthFrame>
  );
}
