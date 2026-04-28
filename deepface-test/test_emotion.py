# Тестовый скрипт для анализа эмоций с помощью DeepFace
# Перед запуском: pip install deepface

from deepface import DeepFace
import sys

if len(sys.argv) < 2:
    print("Usage: python test_emotion.py <image_path>")
    sys.exit(1)

img_path = sys.argv[1]

try:
    result = DeepFace.analyze(img_path=img_path, actions=['emotion'], enforce_detection=False)
    print("Эмоции:")
    if isinstance(result, list):
        result = result[0]
    for emotion, score in result['emotion'].items():
        print(f"{emotion}: {score:.2f}%")
    print("Основная эмоция:", result['dominant_emotion'])
except Exception as e:
    print("Ошибка при анализе:", e)
