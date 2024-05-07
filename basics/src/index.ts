import { OpenAI } from 'openai';
import { encoding_for_model } from 'tiktoken';

const openai = new OpenAI();

async function main() {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: 'Qual é a altura do monte everest?',
      },
    ],
  });

  console.log(response);
}

function encodePrompt() {
  const prompt = 'Como você esta hoje?';
  const encoder = encoding_for_model('gpt-3.5-turbo');
  const words = encoder.encode(prompt);
  console.log(words);
}

encodePrompt();
