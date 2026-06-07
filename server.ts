import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("La variable de entorno GEMINI_API_KEY no está configurada.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. AI-Powered Financial Insights & Forecasts Endpoint
app.post("/api/ai/forecast", async (req, res) => {
  try {
    const { records, locations, machines } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `Eres un experto consultor financiero e ingeniero de operaciones de máquinas tragamonedas (slots). 
Analizas datos históricos de recaudación y entregas predicciones, resúmenes de rendimiento y recomendaciones concretas en español.`;

    const userPrompt = `Datos actuales del negocio:
Puestos disponibles: ${JSON.stringify(locations)}
Máquinas contratadas: ${JSON.stringify(machines)}
Historial de recaudaciones de ingresos (últimas transacciones): ${JSON.stringify(records)}

Analiza las tendencias de recolección por puesto/máquina, detecta anomalías, caídas o picos llamativos e inusuales, y estima ingresos futuros. 
Si no hay registros suficientes, genera consejos ingeniosos aplicables a la industria de slots local. 
Devuelve una respuesta estructurada con predicciones y alertas específicas.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            forecastScore: { 
              type: Type.INTEGER, 
              description: "Puntuación de salud y rendimiento general del 0 al 100" 
            },
            summary: { 
              type: Type.STRING, 
              description: "Resumen ejecutivo del desempeño general" 
            },
            alerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de alarmas, bajas de ingresos en puestos particulares, o alertas de mantenimiento"
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recomendaciones estratégicas en español para optimizar la rentabilidad de las máquinas y prevenir desgaste"
            },
            forecastNextMonth: { 
              type: Type.STRING, 
              description: "Breve proyección o estimación numérica para las próximas semanas" 
            }
          },
          required: ["forecastScore", "summary", "alerts", "recommendations", "forecastNextMonth"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/ai/forecast:", error);
    res.status(500).json({ error: error.message || "Error al procesar predicciones financieras con IA" });
  }
});

// 2. AI Code-Generator & Smart Notes Suggester Endpoint
app.post("/api/ai/suggest-notes", async (req, res) => {
  try {
    const { locationName, machineName, coinCount, coinValue, total, currentNotes } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = "Eres un redactor de reportes técnicos de alta calidad para salas de juegos y slots. Escribes en español de manera clara, objetiva y profesional.";

    const prompt = `Genera un comentario u observación ejecutiva formal automatizada para un conteo en el puesto "${locationName}"${machineName ? `, máquina "${machineName}"` : ""}.
Detalles del conteo:
- Monedas recolectadas: ${coinCount} (valor de la moneda: L ${coinValue})
- Recaudación total de este conteo: L ${total} (Reparto: 65% dueño, 35% encargado)
- Notas tentativas previas del operador: "${currentNotes || "Ninguno"}"

Tu tarea es expandir este texto en un registro de auditoría profesional corto (máximo 2 líneas de texto) en castellano que hable sobre la estabilidad, actividad del conteo o recomendaciones de retiro si procede. Evita saludos; entrega de forma directa.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedNote: {
              type: Type.STRING,
              description: "Comentario profesional expandido y editado por IA"
            }
          },
          required: ["suggestedNote"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/ai/suggest-notes:", error);
    res.status(500).json({ error: error.message || "Error al generar observaciones con IA" });
  }
});

// 3. AI Machine Diagnostic & Troubleshooting Assistant Endpoint
app.post("/api/ai/diagnostic", async (req, res) => {
  try {
    const { machineName, lastMaintenanceDate, symptom } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = "Eres un asistente experto técnico de mantenimiento y calibración de hardware de máquinas electrónicas tragamonedas (slots). Te comunicas en español.";

    const prompt = `Un usuario reporta un problema técnico con la máquina slot "${machineName || "Tragamonedas General"}".
Último mantenimiento registrado: ${lastMaintenanceDate || "Ninguno"}
Semanas/Meses sin mantenimiento aproximado o descripción del síntoma: "${symptom}"

Proporciona un diagnóstico automatizado presuntivo, pasos secuenciales ordenados paso a paso para la solución del problema, acciones preventivas para evitar que se repita, y una advertencia de seguridad crítica obligatoria para el operador (ej. desconectar energía, manejo de sensores ópticos o tolvas).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { 
              type: Type.STRING, 
              description: "Explicación breve del origen probable del problema técnico" 
            },
            troubleshootingSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista ordenada de pasos para inspección, limpieza o calibración del mueble de slot"
            },
            preventativeActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Consejos preventivos para agendar en la próxima visita"
            },
            safetyWarning: { 
              type: Type.STRING, 
              description: "Advertencia crítica de seguridad eléctrica o de protección de sensores" 
            }
          },
          required: ["diagnosis", "troubleshootingSteps", "preventativeActions", "safetyWarning"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/ai/diagnostic:", error);
    res.status(500).json({ error: error.message || "Error al generar diagnóstico con IA" });
  }
});

// Serve frontend application
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fullstack Server] Running on http://localhost:${PORT} under NODE_ENV=${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
