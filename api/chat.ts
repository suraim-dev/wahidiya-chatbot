import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// --------------------
// Environment Variables
// --------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

// --------------------
// API Handler
// --------------------
export default async function handler(req: any, res: any) {
  try {
    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: "Missing message or userId" });
    }

    const lowerMessage = message.toLowerCase();

    // ==============================
    // STEP 8 — MEMORY (Load History)
    // ==============================
    const { data: history } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(10);

    const formattedHistory =
      history?.map((msg: any) => ({
        role: msg.role,
        content: msg.message,
      })) || [];

    // Save user message
    await supabase.from("conversations").insert({
      user_id: userId,
      message,
      role: "user",
    });

    // ===================================
    // STEP 5 — SMART SEARCH (Books)
    // ===================================
    if (
      lowerMessage.includes("popular") ||
      lowerMessage.includes("new books") ||
      lowerMessage.includes("featured")
    ) {
      const { data: books } = await supabase
        .from("books")
        .select("*")
        .ilike("category", `%${lowerMessage}%`)
        .limit(5);

      if (books && books.length > 0) {
        const result = books
          .map(
            (b: any) =>
              `📖 ${b.title}\nAuthor: ${b.author}\nPrice: ${b.price}৳\n`
          )
          .join("\n");

        return res.status(200).json({ reply: result });
      }
    }

    // ===================================
    // STEP 6 — ORDER TRACKING
    // ===================================
    if (lowerMessage.includes("track")) {
      const orderId = message.match(/\d+/)?.[0];

      if (orderId) {
        const { data: order } = await supabase
          .from("orders")
          .select("*")
          .eq("order_id", orderId)
          .single();

        if (order) {
          return res.status(200).json({
            reply: `📦 Your order #${orderId} status: ${order.status}`,
          });
        } else {
          return res.status(200).json({
            reply: "❌ Order not found.",
          });
        }
      }
    }

    // ===================================
    // LIBRARY INFO SUPPORT
    // ===================================
    if (lowerMessage.includes("library")) {
      const { data: library } = await supabase
        .from("library_info")
        .select("*")
        .limit(1)
        .single();

      if (library) {
        return res.status(200).json({
          reply: `
🏢 ${library.name}
📍 Address: ${library.address}
📞 Phone: ${library.phone}
📧 Email: ${library.email}
🕒 Hours: ${library.opening_hours}
🔁 Return Policy: ${library.return_policy}
🚚 Delivery: ${library.delivery_info}
`,
        });
      }
    }

    // ===================================
    // STEP 7 — ISLAMIC CONTENT SAFETY + AI
    // ===================================
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an Islamic book assistant.

STRICT RULES:
- Provide authentic Islamic information only.
- No political debates.
- No sectarian conflict.
- No extremism.
- No violence.
- Do not issue fatwa without authentic references.
- Use Quran and Sahih Hadith references when possible.
- Help users with books, categories, subjects, orders and library support.
`,
        },
        ...formattedHistory,
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;

    // Save assistant reply
    await supabase.from("conversations").insert({
      user_id: userId,
      message: reply,
      role: "assistant",
    });

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("Chatbot Error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}