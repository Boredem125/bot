'use client'
import Image from "next/image";
import { useState } from 'react';
import { Box, Stack, TextField,Button } from '@mui/material';

export   default function Home() {
  const [messages, setMessages] = useState([{ // Array of messages
    role: 'assistant',
    content: 'Hi I am the Headstarter Support Agent, how can I assist you today?'
  }]);

  const [message, setMessage] = useState(''); 
  const sendMessage = async () => {
  if (!message.trim()) return;  // Don't send empty messages

  setMessage('')
  setMessages((messages) => [
    ...messages,
    { role: 'user', content: message },
    { role: 'assistant', content: '' },
  ])

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1]
        let otherMessages = messages.slice(0, messages.length - 1)
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ]
      })
    }
  } catch (error) {
    console.error('Error:', error)
    setMessages((messages) => [
      ...messages,
      { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
    ])
  }
}

  return (
    <Box
      width="100vw"
      height="100vw"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack direction="column" width="600px" height="700px" border="1px solid black" p={2} spacing={3}>
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
          {messages.map((message, index) => ( // Map over the messages array
            <Box key={index} display="flex" justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
              <Box
                sx={{
                  backgroundColor: message.role === 'assistant' ? 'primary.main' : 'secondary.main',
                  color: 'white',
                  borderRadius: 16,
                  p: 3,
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}

        </Stack>
        <Stack direction ="row" spacing={2}>
          <TextField
          label="message"
          fullWidth
          value={message}
          onChange={(e)=>setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            
            SEND
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}