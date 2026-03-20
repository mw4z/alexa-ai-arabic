import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const SYSTEM_PROMPT = `أنت مساعد صوتي عربي يعمل عبر Alexa. 
أجب بالعربية الفصحى المبسطة أو الخليجية الخفيفة عند مناسبة السؤال.
اجعل الرد قصيراً وواضحاً ومناسباً للنطق الصوتي.
تجنب القوائم الطويلة والرموز والروابط.
إذا كان السؤال غير واضح، اطلب توضيحاً قصيراً.
إذا كان الطلب خطيراً أو غير قانوني، ارفض باختصار وقدم بديلًا آمناً.
افهم الأسئلة حتى لو كانت قصيرة أو ناقصة.

إذا جاءك سؤال مختصر مثل:
"القهوة وش"
"السعودية وين"

فسره كالتالي:
"ما هي القهوة"
"أين تقع السعودية"

وأجب بإجابة قصيرة وواضحة ومناسبة للنطق الصوتي.`;

function alexaResponse(text, shouldEndSession = false) {
  const safeText = String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  return {
    version: "1.0",
    response: {
      outputSpeech: {
        type: "SSML",
        ssml: `<speak><lang xml:lang="ar-SA">${safeText}</lang></speak>`
      },
      reprompt: {
        outputSpeech: {
          type: "SSML",
          ssml: `<speak><lang xml:lang="ar-SA">تفضل، قل سؤالك التالي.</lang></speak>`
        }
      },
      shouldEndSession
    }
  };
}

function getSlotValue(req, slotName) {
  return req?.body?.request?.intent?.slots?.[slotName]?.value?.trim() || "";
}

function verifyBasicAlexaShape(req) {
  return Boolean(req?.body?.request?.type && req?.body?.version);
}

async function askOpenAI(userText) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userText }
      ],
      max_output_tokens: 180
    })
  });

  const data = await response.json();

if (!response.ok) {
  console.log("OpenAI status =", response.status);
  console.log("OpenAI raw error =", JSON.stringify(data, null, 2));

  const message = data?.error?.message || "OpenAI request failed";
  throw new Error(message);
}

  const text = data?.output?.flatMap(item => item.content || [])?.find(c => c.type === "output_text")?.text?.trim();

  if (!text) {
    throw new Error("No text returned from OpenAI");
  }

  return text;
}

app.get("/", (_req, res) => {
  res.send("Alexa AI Arabic endpoint is running.");
});

app.post("/alexa", async (req, res) => {
  try {
    if (!verifyBasicAlexaShape(req)) {
      return res.status(400).json({ error: "Invalid Alexa request shape" });
    }

    const requestType = req.body.request.type;

    if (requestType === "LaunchRequest") {
      return res.json(alexaResponse("تم تشغيل المساعد. قل: اسأل ثم سؤالك.", false));
    }

    if (requestType === "IntentRequest") {
      const intentName = req.body.request.intent?.name;

      if (intentName === "AMAZON.HelpIntent") {
        return res.json(alexaResponse("قل: اسأل ثم سؤالك، مثل: اسأل ما أفضل قهوة مقطرة للمبتدئ؟", false));
      }

      if (intentName === "AMAZON.StopIntent" || intentName === "AMAZON.CancelIntent") {
        return res.json(alexaResponse("تم الإنهاء.", true));
      }

      if (intentName === "AskAIIntent") {
        const userText = getSlotValue(req, "query");

        if (!userText) {
          return res.json(alexaResponse("لم أسمع السؤال بوضوح. قل: اسأل ثم سؤالك.", false));
        }

        const aiReply = await askOpenAI(userText);
        return res.json(alexaResponse(aiReply, false));
      }
    }

    return res.json(alexaResponse("هذا الطلب غير مدعوم حالياً.", false));
  } catch (error) {
  console.log("====== /alexa error ======");
  console.log("message =", error?.message);
  console.log("stack =", error?.stack);
  console.log("full error =", error);

  return res.json(alexaResponse("حدث خطأ مؤقت في الاتصال بالمساعد الذكي.", false));
}
});

console.log("OPENAI_MODEL =", OPENAI_MODEL);
console.log("API KEY EXISTS =", !!OPENAI_API_KEY);
console.log("NODE VERSION =", process.version);
console.log("FETCH TYPE =", typeof fetch);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});