import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { marked } from 'marked';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

dotenv.config();

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/ask', async (req, res) => {
  console.log(req.body);
  try {
    const { prompt } = req.body;
    
    const response = await fetch('http://127.0.0.1:11434/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-r1",
        messages: [{ role: "user", content: "Give me 5 wedding proposal ideas for someone with the following traits and do not show your thinking:  " + prompt }]
      })
    });

    const data = await response.json();
    const markdown = data.choices[0].message.content;
    // Convert markdown to HTML and sanitize
    const htmlContent = DOMPurify.sanitize(marked(markdown));
    res.send(`<div class="response-text">${htmlContent}</div>`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`<div class="response-text">Sorry, there was an error processing your request.</div>`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
