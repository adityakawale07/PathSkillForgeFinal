import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: 'Say hello in 3 words' }],
    });
    console.log('SUCCESS! Response:', response.choices[0].message.content);
  } catch (err) {
    console.error(err);
  }
}

test();