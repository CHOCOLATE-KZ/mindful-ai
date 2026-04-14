import Footer from "../../../components/landing/Footer";
import { CheckCircle2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#5d9088] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h100v100H0z%22 fill=%22none%22/%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22white%22 opacity=%220.1%22/%3E%3C/svg%3E')] bg-repeat"></div>
        </div>
        
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <h1 className="text-5xl font-extrabold leading-tight">Политика приватности</h1>
          <p className="mt-4 max-w-2xl text-xl text-blue-100">Мы серьезно относимся к вашей приватности и безопасности данных</p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-20 space-y-12">
        {/* Introduction */}
        <section>
          <p className="text-lg text-gray-700 mb-4">
            Политика приватности описывает, как MindfulAI собирает, использует, хранит и защищает вашу личную информацию. Пожалуйста, прочитайте эту политику внимательно.
          </p>
          <p className="text-lg text-gray-600">
            Используя наше приложение, вы соглашаетесь с условиями данной политики.
          </p>
        </section>

        {/* Section 1 */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Информация, которую мы собираем</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Информация учетной записи:</strong> Когда вы создаете учетную запись, мы собираем ваше имя, адрес электронной почты, номер телефона и другую информацию для удостоверения личности.
            </p>
            <p>
              <strong>Содержимое сообщений:</strong> Чаты, заметки и другой контент, который вы создаете в приложении, хранятся на наших защищенных серверах.
            </p>
            <p>
              <strong>Метаданные:</strong> Дата, время, тип действия и другая техническая информация автоматически собирается для улучшения сервиса.
            </p>
            <p>
              <strong>Информация о устройстве:</strong> Тип устройства, операционная система, браузер и IP-адрес.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Как мы используем вашу информацию</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="mt-0.5 text-blue-600" />
              <span>Предоставления доступа к функциям приложения</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="mt-0.5 text-blue-600" />
              <span>Улучшения качества сервиса и пользовательского опыта</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="mt-0.5 text-blue-600" />
              <span>Отправки важных уведомлений и обновлений</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="mt-0.5 text-blue-600" />
              <span>Проведения анализа использования приложения</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={18} className="mt-0.5 text-blue-600" />
              <span>Обеспечения безопасности и предотвращения мошенничества</span>
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Безопасность данных</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Мы используем современные методы шифрования (SSL/TLS) для защиты ваших данных при передаче. Все данные на серверах хранятся в зашифрованном виде.
            </p>
            <p>
              Доступ к вашей информации ограничен авторизованным персоналом, который принял на себя обязательство по конфиденциальности.
            </p>
            <p>
              Несмотря на наши усилия, ни одна система безопасности не полностью неуязвима. Мы постоянно обновляем наши системы защиты.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Передача данных третьим лицам</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Мы не продаем, не обмениваем и не передаем вашу личную информацию третьим лицам без вашего явного согласия, за исключением следующих случаев:
            </p>
            <ul className="space-y-2 ml-4">
              <li>• По требованию закона или судебных органов</li>
              <li>• Для защиты наших прав и безопасности пользователей</li>
              <li>• Надежным партнерам, которые помогают нам предоставлять услуги (с соблюдением конфиденциальности)</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Ваши права</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Вы имеете право:
            </p>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Доступ:</strong> Получить копию ваших персональных данных</li>
              <li>• <strong>Исправление:</strong> Исправить неправильную информацию</li>
              <li>• <strong>Удаление:</strong> Запросить удаление ваших данных (право быть забытым)</li>
              <li>• <strong>Возражение:</strong> Возразить против обработки ваших данных</li>
              <li>• <strong>Переносимость:</strong> Получить ваши данные в структурированном формате</li>
            </ul>
            <p className="mt-4">
              Для осуществления этих прав свяжитесь с нами по адресу support@mindfulai.app
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Cookies и подобные технологии</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Мы используем cookies для улучшения пользовательского опыта, аутентификации и анализа использования приложения.
            </p>
            <p>
              Вы можете управлять настройками cookies в вашем браузере или запросить отключение некоторых типов cookies.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Изменения в политике</h2>
          <p className="text-gray-700">
            Мы оставляем за собой право обновлять эту политику приватности в любое время. При существенных изменениях мы уведомим вас по электронной почте или выведем уведомление в приложении.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Вопросы о приватности?</h2>
          <p className="text-gray-700 mb-4">
            Если у вас есть вопросы или опасения по поводу нашей политики приватности, свяжитесь с нами:
          </p>
          <p className="text-lg">
            <strong>Email:</strong> <a href="mailto:support@mindfulai.app" className="text-blue-600 hover:underline">support@mindfulai.app</a>
          </p>
          <p className="text-sm text-gray-600 mt-4">
            Последнее обновление: февраль 2026
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
