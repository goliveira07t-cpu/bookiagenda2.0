import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client as per guidelines using process.env.API_KEY directly.
const apiKey = process.env.API_KEY || process.env.VITE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Uses Gemini to generate executive summaries and recommendations based on SaaS metrics.
 * Uses the gemini-3-flash-preview model for high-speed text analysis.
 */
export const getSystemInsights = async (metrics: any) => {
  if (!ai) {
    console.warn("Gemini API key not configured");
    return "Insights indisponíveis - configure a chave de API do Gemini.";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise as seguintes métricas do SaaS BOOKI e forneça um resumo executivo de 3 frases com recomendações: ${JSON.stringify(metrics)}`,
      config: {
        systemInstruction: "Você é um consultor de negócios sênior especializado em SaaS. Responda em Português do Brasil.",
      },
    });
    // Correctly accessing the text property from GenerateContentResponse as it is a getter.
    return response.text;
  } catch (error) {
    console.error("Erro ao obter insights do Gemini:", error);
    return "Não foi possível gerar insights no momento. Verifique sua conexão ou chave de API.";
  }
};