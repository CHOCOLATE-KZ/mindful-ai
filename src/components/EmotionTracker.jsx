import { useEffect, useRef, useState } from "react";

export default function EmotionTracker({ userId, onEmotion }) {
  const videoRef = useRef(null);
  const faceapiRef = useRef(null);
  const [status, setStatus] = useState("init");
  const [currentEmotion, setCurrentEmotion] = useState(null);

  useEffect(() => {
    let stream;
    let cancelled = false;

    async function setup() {
      try {
        setStatus("loading models");
        const faceapi = await import("face-api.js");
        if (cancelled) return;

        faceapiRef.current = faceapi;
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");

        setStatus("starting camera");
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("ready");
      } catch (e) {
        console.warn("EmotionTracker init failed:", e);
        setStatus("error");
      }
    }

    setup();

    return () => {
      cancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    let interval;

    async function analyze() {
      const faceapi = faceapiRef.current;
      if (!faceapi) return;
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
