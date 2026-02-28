export const psychologyVideos = [
  {
    id: "video-1",
    title: "How to Make Stress Your Friend",
    category: "Стресс",
    duration: "14 мин",
    whyWatch: "Помогает переосмыслить стресс и снизить страх перед ним",
    embedUrl: "https://www.youtube-nocookie.com/embed/RcGyVTAoXEU",
    channel: "TED",
  },
  {
    id: "video-2",
    title: "Inside the Mind of a Master Procrastinator",
    category: "Продуктивность",
    duration: "14 мин",
    whyWatch: "Показывает психологию прокрастинации и как её замечать",
    embedUrl: "https://www.youtube-nocookie.com/embed/arj7oStGLkU",
    channel: "TED",
  },
  {
    id: "video-3",
    title: "How to Practice Emotional First Aid",
    category: "Эмоции",
    duration: "17 мин",
    whyWatch: "Даёт простые приёмы самопомощи при эмоциональной боли",
    embedUrl: "https://www.youtube-nocookie.com/embed/F2hc2FLOdhI",
    channel: "TED",
  },
  {
    id: "video-4",
    title: "The Gift and Power of Emotional Courage",
    category: "Самооценка",
    duration: "16 мин",
    whyWatch: "Учит экологично работать с трудными чувствами",
    embedUrl: "https://www.youtube-nocookie.com/embed/iCvmsMzlF7o",
    channel: "TED",
  },
];

export const miniPractices = [
  {
    id: "practice-1",
    title: "Дыхание 4-6",
    duration: "2 мин",
    instruction:
      "Вдох на 4 счёта, выдох на 6. Повторите 10 циклов, наблюдая за телом.",
  },
  {
    id: "practice-2",
    title: "Переоценка мысли",
    duration: "3 мин",
    instruction:
      "Запишите тревожную мысль и замените её на более реалистичную и поддерживающую.",
  },
  {
    id: "practice-3",
    title: "Дневник благодарности",
    duration: "5 мин",
    instruction:
      "Отметьте 3 вещи за день, которые дали вам ресурс или спокойствие.",
  },
];

export const videoCategories = [
  "Все",
  ...new Set(psychologyVideos.map((video) => video.category)),
];

export const featuredVideoId = "video-1";