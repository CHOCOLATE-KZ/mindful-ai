import { useEffect, useRef, useState } from "react";

// Для работы потребуется: npm install face-api.js
import * as faceapi from "face-api.js";

export default function EmotionTracker({ userId, onEmotion }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("init");
  const [currentEmotion, setCurrentEmotion] = useState(null);

  useEffect(() => {
    async function setup() {
      setStatus("loading models");
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      setStatus("starting camera");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStatus("ready");
    }
    setup();
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    let interval;
    async function analyze() {
      if (!videoRef.current) return;
      const result = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      if (result && result.expressions) {
        // Находим эмоцию с максимальным значением
        const entries = Object.entries(result.expressions);
        entries.sort((a, b) => b[1] - a[1]);
        const [dominant, score] = entries[0];
        setCurrentEmotion(dominant);
        if (onEmotion) onEmotion(dominant);
        // Отправляем на backend
        if (userId) {
          fetch("/api/emotion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, emotion: dominant })
          });
        }
      }
    }
    interval = setInterval(analyze, 2000); // анализировать раз в 2 секунды
    return () => clearInterval(interval);
  }, [status, userId, onEmotion]);

  return (
    <div style={{ display: "none" }}>
      <video ref={videoRef} autoPlay muted width={320} height={240} />
      {/* Для отладки можно показать: <div>Эмоция: {currentEmotion}</div> */}
    </div>
  );
}
