"use client";

import { useState } from "react";
import Label from "../../../components/ui/Label";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Footer from "../../../components/landing/Footer";

export default function ContactsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // no backend: just show a confirmation
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900">Контакты</h1>
        <p className="mt-2 text-gray-600">Напишите нам — пока форма отправляет данные только локально.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label>Имя</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div>
            <Label>Сообщение</Label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-gray-200 p-3 text-gray-800 focus:ring-2 focus:ring-indigo-200"
              placeholder="Расскажите, чем мы можем помочь"
            />
          </div>

          <div>
            <Button type="submit">Отправить</Button>
          </div>

          {sent && <div className="mt-2 text-sm text-green-600">Спасибо — сообщение сохранено локально.</div>}
        </form>
      </main>

      <Footer />
    </div>
  );
}
