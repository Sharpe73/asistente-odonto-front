import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Slide,
  IconButton,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
  Switch,
  FormControlLabel,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import axios from 'axios';
import Lottie from 'lottie-react';
import botAnimation from '../assets/bot.json';
import voiceWave from '../assets/voice-wave.json'; // 🆕 Animación de onda

// ===============================
// 🔗 Backend API URL
// ===============================
const API_URL = "https://asistente-odonto-production.up.railway.app";

// ================================================
// Conversión números a texto para voz
// ================================================
const numeroATexto = (num) => {
  const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta',
    'setenta', 'ochenta', 'noventa'];
  const centenas = ['', 'cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
    'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  const seccion = (n) => {
    if (n < 20) return unidades[n];
    if (n < 100) return decenas[Math.floor(n / 10)] + (n % 10 ? ' y ' + unidades[n % 10] : '');
    if (n < 1000) return centenas[Math.floor(n / 100)] + (n % 100 ? ' ' + seccion(n % 100) : '');
    if (n < 1000000) {
      const miles = Math.floor(n / 1000);
      const resto = n % 1000;
      return (miles === 1 ? 'mil' : seccion(miles) + ' mil') + (resto ? ' ' + seccion(resto) : '');
    }
    const millones = Math.floor(n / 1000000);
    const resto = n % 1000000;
    return (millones === 1 ? 'un millón' : seccion(millones) + ' millones') + (resto ? ' ' + seccion(resto) : '');
  };

  return seccion(num);
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [vozActiva, setVozActiva] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ===============================
  // Cortar voz inmediatamente al apagar switch
  // ===============================
  useEffect(() => {
    if (!vozActiva) {
      speechSynthesis.cancel();
    }
  }, [vozActiva]);

  // ===============================
  // 🔈 Voz humana
  // ===============================
  const getSpanishVoice = () => {
    const voices = speechSynthesis.getVoices();
    return (
      voices.find(v => v.lang === 'es-CL') ||
      voices.find(v => v.lang === 'es-MX') ||
      voices.find(v => v.lang.startsWith('es')) ||
      voices.find(v => v.lang.startsWith('es-419'))
    );
  };

  const speak = (text) => {
    if (!vozActiva) return;

    let cleaned = text.replace(/<[^>]*>?/gm, '');
    cleaned = cleaned.replace(/\$([\d.]+)/g, (_, raw) => {
      const numeric = parseInt(raw.replace(/\./g, ''));
      return `${numeroATexto(numeric)} pesos`;
    });
    cleaned = cleaned.replace(/Odonto[\s-]?Bot/gi, 'Odonto Bót');

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utteranceRef.current = utterance;

    const voice = getSpanishVoice();
    if (voice) utterance.voice = voice;

    utterance.lang = 'es-CL';
    utterance.rate = 1;

    speechSynthesis.speak(utterance);
  };

  // ===============================
  // Crear sesión
  // ===============================
  useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.post(`${API_URL}/chat/sesion`);
        setSessionId(res.data.session_id);

        const welcome = "¡Hola! Soy Odonto-Bot, tu asistente virtual. ¿En qué puedo ayudarte hoy?";
        setMessages([{ sender: "bot", text: welcome }]);
        speak(welcome);

      } catch (error) {
        console.error("Error creando sesión:", error);
      }
    };
    init();
  }, []);

  // ===============================
  // 📩 Enviar pregunta
  // ===============================
  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const newMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat/preguntar`, {
        session_id: sessionId,
        pregunta: newMsg.text,
      });

      const respuesta = res.data?.respuesta || "No tengo información suficiente en el documento para responder eso.";

      const botMsg = { sender: "bot", text: respuesta };
      setMessages((prev) => [...prev, botMsg]);
      speak(respuesta);

    } catch (error) {
      const errorMsg = "⚠️ Error al conectar con Odonto-Bot.";
      setMessages((prev) => [...prev, { sender: "bot", text: errorMsg }]);
      speak(errorMsg);

    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🎤 Dictado por voz + animación
  // ===============================
  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Tu navegador no soporta reconocimiento de voz");

    if (!recognitionRef.current) {
      const rec = new SpeechRecognition();
      rec.lang = "es-CL";
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        setTimeout(handleSend, 150);
      };

      recognitionRef.current = rec;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    recognitionRef.current.start();
  };

  // ===============================
  // 🧹 Limpiar conversación
  // ===============================
  const handleClear = () => {
    const welcome = "¡Hola! Soy Odonto-Bot, tu asistente virtual. ¿En qué puedo ayudarte hoy?";
    setMessages([{ sender: "bot", text: welcome }]);
    speak(welcome);
  };

  // ===============================
  // UI
  // ===============================
  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(to right, #e0c3fc, #8ec5fc)", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper elevation={10} sx={{ width: "100%", maxWidth: 700, borderRadius: 4, p: 3, backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)" }}>

        {/* HEADER */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 50 }}>
              <Lottie animationData={botAnimation} loop />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#ff5722" }}>
              Odonto-Bot, tu asistente
            </Typography>
          </Stack>

          <Tooltip title="Limpiar conversación">
            <IconButton color="error" onClick={handleClear}>
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* CHAT BOX */}
        <Box sx={{ height: isMobile ? 350 : 450, overflowY: "auto", border: "2px solid #ffe0b2", borderRadius: 3, p: 2, backgroundColor: "#ffffffdd" }}>
          <Stack spacing={2}>
            {messages.map((msg, index) => (
              <Slide key={index} direction="up" in mountOnEnter unmountOnExit timeout={{ enter: 200 }}>
                <Box
                  sx={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    backgroundColor: msg.sender === "user" ? "#ff7043" : "#26c6da",
                    color: "#fff",
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    maxWidth: "85%",
                    boxShadow: 3,
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">
                    {msg.sender === "user" ? "Tú" : "Odonto-Bot"}
                  </Typography>
                  <Typography variant="body2" dangerouslySetInnerHTML={{ __html: msg.text }} />
                </Box>
              </Slide>
            ))}

            {loading && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} />
                <Typography variant="body2" color="textSecondary">
                  Procesando...
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* INPUT */}
        <Stack direction="row" spacing={1} mt={2} alignItems="center">
          <TextField
            fullWidth
            value={input}
            placeholder="Escribe tu pregunta..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            sx={{ backgroundColor: "#fff", borderRadius: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSend}
            sx={{ backgroundColor: "#ff5722", minWidth: 110 }}
          >
            Enviar
          </Button>

          {/* 🎤 BOTÓN DEL MICRÓFONO CON ANIMACIÓN INTEGRADA */}
          <Tooltip title={isListening ? "Escuchando..." : "Hablar"}>
            <IconButton
              onClick={handleVoice}
              sx={{
                width: 55,
                height: 55,
                backgroundColor: isListening ? "#ff7043" : "#ffcc80",
                borderRadius: "50%",
                boxShadow: isListening ? "0 0 12px rgba(255,140,0,0.9)" : "none",
                animation: isListening ? "pulse 1s infinite" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "0.25s",
              }}
            >
              {isListening ? (
                <Lottie animationData={voiceWave} style={{ width: 32, height: 32 }} loop />
              ) : (
                <KeyboardVoiceIcon sx={{ color: "black" }} />
              )}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* 🔊 Indicador adicional opcional */}
        {isListening && (
          <Box sx={{ width: "100%", mt: 1, display: "flex", justifyContent: "center" }}>
            <Lottie animationData={voiceWave} style={{ width: 100, height: 60 }} loop />
          </Box>
        )}

        <FormControlLabel
          control={<Switch checked={vozActiva} onChange={(e) => setVozActiva(e.target.checked)} />}
          label="Voz activa"
          sx={{ mt: 2 }}
        />
      </Paper>
    </Box>
  );
};

export default ChatBot;
