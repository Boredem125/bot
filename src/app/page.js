'use client'
import { useState, useRef } from 'react';
import { Stack, TextField, Button, Typography, Paper, Avatar } from '@mui/material';
import Picker from 'emoji-mart'; // Corrected import

export default function Home() {
  const [messages, setMessages] = useState([{ // Array of messages
    role: 'assistant',
    content: "Can't even do this on your own? Fine incapable human, I am your savior 😂",
    backgroundColor: 'white', // Navy blue for assistant
    color: '#000', // White text for assistant
    avatar: 'https://robohash.org/example?set=set4', // Path to bot's avatar image
  }]);

  const [message, setMessage] = useState('');
  const messageRef = useRef(null); // Reference to the TextField element

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false); // State for emoji picker

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message, backgroundColor: '#75bbfd', color: '#000', avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Jane' }, // Random user avatar
      { role: 'assistant', content: '', avatar: 'https://api.dicebear.com/9.x/bottts/png' }, // Add bot avatar here
    ]);
    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later.", backgroundColor: '#1976D2', color: '#fff', avatar: 'https://robohash.org/example?set=set4' }, // Set error message color
      ]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      sendMessage();
    } else if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
      // Open emoji picker on slash key press (optional)
      setIsEmojiPickerOpen(true);
    }
  };

  const endChat = () => {
    setMessages([{ role: 'assistant', content: 'This conversation is over. Farewell, simpleton. 😂', backgroundColor: '#1976D2', color: '#fff', avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Jane' }]); // Set end chat message color
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(message + emoji.native); // Add selected emoji to message
    setIsEmojiPickerOpen(false); // Close emoji picker on selection
  };

  return (
    <Stack
      width="100vw"
      height="100vh"
      spacing={2}
      sx={{ backgroundColor: '#000', color: 'red', padding: 2 }}
    >
      <Stack direction="column" width="100%" height="calc(100% - 64px)" border="1px solid #fff" p={2} spacing={3} sx={{ borderRadius: 16, boxShadow: 2, overflow: 'auto' }}>
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, color: 'red', fontSize: '2rem' }}>RudeAI</Typography>
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
          {messages.map((message, index) => (
            <Stack key={index} direction={message.role === 'assistant' ? 'row' : 'row-reverse'} spacing={2} alignItems="flex-end">
              {message.role === 'assistant' && (
                <Avatar src={message.avatar} alt="Bot Avatar" sx={{ width: 56, height: 56 }} />
              )}
              <Paper
                elevation={3}
                sx={{
                  backgroundColor: message.backgroundColor,
                  color: message.color,
                  borderRadius: message.role === 'assistant' ? 8 : 16, // Rounded corners for assistant, speech bubble for user
                  p: 3,
                  display: 'inline-block',
                  maxWidth: '70%',
                  boxShadow: 1,
                }}
              >
                {message.content}
              </Paper>
              {message.role === 'user' && (
                <Avatar src="https://api.dicebear.com/9.x/pixel-art/svg?seed=Jane" alt="User Avatar" sx={{ width: 56, height: 56 }} />
              )}
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center" p={2} sx={{ position: 'relative' }}>
        <TextField
          label="Your Message"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          inputRef={messageRef}
          sx={{ borderRadius: 8, color: '#000', backgroundColor: '#fff', flexGrow: 1 }} // Set message box background to white
        />
        <Button variant="contained" onClick={sendMessage}>
          SEND
        </Button>
        <Button variant="contained" color="error" onClick={endChat}>
          END CHAT
        </Button>
        {isEmojiPickerOpen && (
          <Picker
            onSelect={handleEmojiSelect}
            set='native'
            title='Pick your emoji'
            theme='dark'
            style={{ position: 'absolute', bottom: '100%', right: 0, zIndex: 2 }} // Position the emoji picker
          />
        )}
      </Stack>
    </Stack>
  );
}
