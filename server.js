const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'OM.HTML')));

const openaiKey = process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    if (openai) {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly portfolio assistant for Omkar. When the user asks about Omkar, provide a concise but complete summary of his education, skills, projects, achievements, certifications, and contact information. If the user asks about "yourself" or "about me", explain that you are the assistant for Omkar\'s portfolio and then summarize Omkar\'s profile clearly.'
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 250
      });

      const reply = response.choices?.[0]?.message?.content?.trim() ||
        'Sorry, I could not generate a response right now.';
      return res.json({ reply });
    }

    const lower = message.toLowerCase();
    let reply = 'This portfolio chatbot is ready. Please install OPENAI_API_KEY in the server environment to enable live responses.';

    const fullProfile = 'Omkar is a Computer Engineering student graduating in 2026 with strengths in Java development, SQL, web development, and software engineering. He has built projects like Student Management System, Employee Management System, Portfolio Website, Library Management System, Weather App, and E-Commerce Website. His skills include Java, SQL, HTML, CSS, JavaScript, DSA, Git & GitHub, and Spring Boot. He has certifications in Java Programming, SQL, Data Structures & Algorithms, and Web Development, and has participated in technical workshops, solved coding problems on HackerRank, and contributed to GitHub. You can reach him at omkar@gmail.com and through his LinkedIn and GitHub profiles.';

    if (lower.includes('yourself') || lower.includes('about') || lower.includes('who are you') || lower.includes('tell me about')) {
      reply = fullProfile;
    } else if (lower.includes('skills')) {
      reply = 'Your skills include Java, SQL, HTML, CSS, JavaScript, DSA, Git & GitHub, and Spring Boot.';
    } else if (lower.includes('project')) {
      reply = 'Omkar has built projects like Student Management System, Employee Management System, Portfolio Website, Library Management System, Weather App, and E-Commerce Website.';
    } else if (lower.includes('resume')) {
      reply = 'The resume is available for download from the home section. Click the Download Resume button.';
    } else if (lower.includes('contact')) {
      reply = 'You can contact Omkar at omkar@gmail.com or through LinkedIn and GitHub links in the hero section.';
    } else if (lower.includes('education')) {
      reply = 'Omkar is pursuing B.E. Computer Engineering from 2022 to 2026, with strong academic credentials in HSC and SSC.';
    }

    return res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Chat request failed.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
