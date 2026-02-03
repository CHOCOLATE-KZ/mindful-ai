import Footer from "../../../components/landing/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h100v100H0z%22 fill=%22none%22/%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22white%22 opacity=%220.1%22/%3E%3C/svg%3E')] bg-repeat"></div>
        </div>
        
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <h1 className="text-5xl font-extrabold leading-tight">О Mindful AI</h1>
          <p className="mt-4 max-w-2xl text-xl text-blue-100">Платформа, которая помогает вам найти спокойствие и разобраться в себе с помощью искусственного интеллекта и простых практик</p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-20">
        {/* Mission Section */}
        <section className="mb-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Наша миссия</h2>
              <p className="text-lg text-gray-700 mb-4">
                <span className="font-semibold text-blue-600">Mindful AI</span> создана с целью сделать поддержку психического здоровья доступной и персональной для каждого человека.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Мы верим, что простые практики осознанности, регулярная рефлексия и поддерживающие диалоги могут значительно улучшить качество жизни.
              </p>
              <p className="text-lg text-gray-600">
                Наша платформа объединяет мудрость древних практик с современными технологиями, создавая уникальный опыт личного роста.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-8 text-white shadow-xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-2xl">🧘</div>
                  <div>
                    <h3 className="font-semibold text-lg">Осознанность</h3>
                    <p className="text-blue-100 mt-1">Практики для развития самосознания</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-2xl">💬</div>
                  <div>
                    <h3 className="font-semibold text-lg">Диалоги</h3>
                    <p className="text-blue-100 mt-1">Спокойные беседы с ИИ-помощником</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-2xl">📊</div>
                  <div>
                    <h3 className="font-semibold text-lg">Аналитика</h3>
                    <p className="text-blue-100 mt-1">Отследите свой эмоциональный прогресс</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Что мы предлагаем</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-3xl mb-4">🌬️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Дыхательные практики</h3>
              <p className="text-gray-600">Простые и эффективные техники для снижения стресса и улучшения концентрации</p>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center text-3xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Дневник настроения</h3>
              <p className="text-gray-600">Записывайте свои мысли и чувства, отслеживайте эмоциональные паттерны</p>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 border border-gray-100">
              <div className="w-14 h-14 bg-pink-100 rounded-lg flex items-center justify-center text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Умный ассистент</h3>
              <p className="text-gray-600">Персональный ИИ-помощник, который понимает ваши потребности и поддерживает вас</p>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 border border-gray-100">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center text-3xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Статистика и прогресс</h3>
              <p className="text-gray-600">Визуализируйте свой прогресс и видите, как вы развиваетесь со временем</p>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 border border-gray-100">
              <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center text-3xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Упражнения</h3>
              <p className="text-gray-600">Интерактивные упражнения для развития эмоционального интеллекта</p>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 border border-gray-100">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Приватность</h3>
              <p className="text-gray-600">Ваши данные принадлежат только вам, полная конфиденциальность</p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-12 text-center">Наши ценности</h2>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">❤️</span> Забота
              </h3>
              <p className="text-slate-300">Мы заботимся о благополучии каждого пользователя и развиваем платформу с их потребностями в первую очередь</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🔐</span> Приватность
              </h3>
              <p className="text-slate-300">Конфиденциальность ваших данных — это наш приоритет. Мы не продаем и не передаем информацию третьим лицам</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">♿</span> Доступность
              </h3>
              <p className="text-slate-300">Mindful AI должна быть доступна для всех, независимо от возраста, способностей или финансового положения</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🌱</span> Персонализация
              </h3>
              <p className="text-slate-300">Каждый путь уникален. Мы адаптируем опыт под ваши индивидуальные потребности и предпочтения</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🤝</span> Поддержка
              </h3>
              <p className="text-slate-300">Мы создали дружественное сообщество, где каждый может найти поддержку и вдохновение</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">📚</span> Образование
              </h3>
              <p className="text-slate-300">Мы верим в важность обучения и предоставляем ресурсы для развития знаний о психическом здоровье</p>
            </div>
          </div>
        </section>

        {/* Team & Vision */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Наша команда и видение</h2>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">👥 Команда</h3>
              <p className="text-gray-700 mb-4">
                Мы — небольшая, но преданная команда разработчиков, дизайнеров и исследователей, увлеченных созданием инструментов для улучшения психического здоровья.
              </p>
              <p className="text-gray-700">
                Каждый член нашей команды привносит уникальный опыт и перспективу, что позволяет нам создавать действительно инновационные решения.
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-8 border border-purple-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Видение</h3>
              <p className="text-gray-700 mb-4">
                Мы видим будущее, где каждый человек имеет доступ к инструментам и поддержке для развития эмоционального благополучия.
              </p>
              <p className="text-gray-700">
                Наша цель — быть надежным спутником на пути к более осознанной и полноценной жизни.
              </p>
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="mt-20 bg-amber-50 border-l-4 border-amber-500 p-8 rounded-lg">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">⚠️ Важное примечание</h3>
          <p className="text-amber-800">
            Mindful AI — это инструмент для поддержки и самопознания, но он <strong>не заменяет профессиональную психологическую помощь</strong>. Если у вас есть серьезные проблемы с психическим здоровьем, пожалуйста, обратитесь к квалифицированному специалисту.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
