export default function FaqSection() {
  const faqs = [
    {
      q: "Is MindfulAI a real therapist?",
      a: "No. MindfulAI is a supportive assistant, not a licensed therapist. It can help you reflect and build healthy habits, but it doesn’t replace professional care.",
    },
    {
      q: "Is my data private?",
      a: "We store only what’s needed for your account and features. Your notes and chat are protected by user-based access rules in the database.",
    },
    {
      q: "Can I delete my data?",
      a: "Yes. You can delete notes and clear chat history. Export features can be added later if needed.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="text-center text-3xl font-semibold text-black">FAQ</h2>
      <div className="mx-auto mt-8 max-w-3xl space-y-4">
        {faqs.map((f, idx) => (
          <details
            key={idx}
            className="group rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
          >
            <summary className="cursor-pointer list-none text-black font-medium flex items-center justify-between">
              {f.q}
              <span className="text-black/40 group-open:rotate-45 transition">+</span>
            </summary>
            <p className="mt-3 text-black/60">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
