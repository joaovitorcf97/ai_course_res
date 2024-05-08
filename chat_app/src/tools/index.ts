import OpenAI from 'openai';

const openAI = new OpenAI();

function getTimeOfDay() {
  return '21:28';
}

function getOrderStatus(orderId: string) {
  console.log(orderId);
  const orderAsNumber = parseInt(orderId);

  if (orderAsNumber % 2 === 0) {
    return 'IN_PROFRESS';
  }

  return 'COMPLETED';
}

async function callOpenAIWithTools() {
  const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        'Você é um assistente útil que fornece informações sobre a hora do dia e o status do pedido',
    },
    {
      role: 'user',
      content: 'Qual é o status do pedido 12345',
    },
  ];

  const response = await openAI.chat.completions.create({
    model: 'gpt-3.5-turbo-0613',
    messages: context,
    tools: [
      {
        type: 'function',
        function: {
          name: 'getTimeOfDay',
          description: 'Obter a hora do dia',
        },
      },
      {
        type: 'function',
        function: {
          name: 'getOrderStatus',
          description: 'Retorna o status do um pedido',
          parameters: {
            type: 'object',
            properties: {
              orderId: {
                type: 'string',
                description: 'o id do pedido para pegar o stratus de',
              },
            },
            required: ['orderId'],
          },
        },
      },
    ],
    tool_choice: 'auto',
  });

  const willInvokeFunction = response.choices[0].finish_reason === 'tool_calls';
  const toolCall = response.choices[0].message.tool_calls![0];

  if (willInvokeFunction) {
    const toolName = toolCall.function.name;

    if (toolName === 'getTimeOfDay') {
      const toolResponse = getTimeOfDay();
      context.push(response.choices[0].message);
      context.push({
        role: 'tool',
        content: toolResponse,
        tool_call_id: toolCall.id,
      });
    }

    if (toolName === 'getOrderStatus') {
      const rawArgument = toolCall.function.arguments;
      const parsedArguments = JSON.parse(rawArgument);
      const toolResponse = getOrderStatus(parsedArguments.orderId);
      context.push(response.choices[0].message);
      context.push({
        role: 'tool',
        content: toolResponse,
        tool_call_id: toolCall.id,
      });
    }
  }

  const secondResponse = await openAI.chat.completions.create({
    model: 'gpt-3.5-turbo-0613',
    messages: context,
  });

  console.log(secondResponse.choices[0].message.content);
}

callOpenAIWithTools();
