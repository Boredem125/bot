import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = [
  "You are an AI-powered customer support assistant for HeadStarter AI, a platform that provides AI-driven interviews for SWE jobs and teaches them AI concepts.",
  "How do I access the AI-driven mock interviews?",
  "I am having trouble logging in to my HeadStarter account.",
  "Can you explain the difference between practice mode and simulated interview mode?",
  "How do I invite a friend to practice with me on the platform?",
  "The video quality is poor during mock interviews.",
  "I am experiencing audio issues on the platform.",
  "The platform is crashing frequently.",
  "How do I change my password?",
  "I forgot my username.",
  "How do I cancel my subscription?",
  "Can you explain machine learning in simple terms?",
  "What is the difference between supervised and unsupervised learning?",
  "How does deep learning work?",
  "How can I apply the concept of backpropagation to improve a neural network?",
  "What are some real-world examples of natural language processing?",
  "How can I use reinforcement learning to solve a problem?",
  "Can you recommend some resources to learn about computer vision?",
  "Where can I find datasets for practicing machine learning algorithms?",
  "Are there any online communities for discussing AI concepts?",
  "How can I prepare for behavioral questions in a technical interview?",
  "What are the most common data structure and algorithm questions?",
  "How can I improve my problem-solving skills for coding challenges?",
  "How can I improve my performance based on the feedback from the mock interview?",
  "What are my strengths and weaknesses according to the AI assessment?",
  "What are the most in-demand tech skills right now?",
  "How can I tailor my resume for a specific job role?",
  "What are the trends in the AI job market?",
  "How satisfied are you with our platform?",
  "What features would you like to see added to HeadStarter?",
  "How can we improve your overall experience?",
  "Would you be interested in upgrading your subscription to access advanced features?",
  "Have you considered our career coaching services?",
  "We offer a discount for referring friends. Would you like to learn more?",
].join("\n"); // Join prompts with newline characters

export async function POST(req) {
  const openai = new OpenAI({
    apiKey: process.env.local.OPENROUTER_API_KEY,
  });

  try {
    const data = await req.json();

    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...data, // Ensure data is in the format [{ role: 'user', content: 'message' }]
      ],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          console.error('Error during streaming:', err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error('Error processing request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
