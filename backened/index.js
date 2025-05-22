const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/api/todos', async (req, res) => {
  const result = await pool.query('SELECT * FROM todos ORDER BY id');
  res.json(result.rows);
});

app.post('/api/todos', async (req, res) => {
  const { text } = req.body;
  await pool.query('INSERT INTO todos (text) VALUES ($1)', [text]);
  res.status(201).send();
});

// app.post('/api/summarize', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT text FROM todos');
//     const todos = result.rows.map(row => row.text).join('\\n');

//     console.log("Fetched todos:", todos);

//     const summaryRes = await axios.post('https://api.openai.com/v1/chat/completions', {
//       model: 'gpt-3.5-turbo',
//       messages: [{ role: 'user', content: `Summarize the following todos:\\n${todos}` }]
//     }, {
//       headers: {
//         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     const summary = summaryRes.data.choices[0].message.content;
//     console.log("Generated summary:", summary);

//     await axios.post(process.env.SLACK_WEBHOOK_URL, { text: summary });

//     res.json({ message: 'Summary sent to Slack!' });
//   } catch (error) {
//     console.error("❌ Backend error:", error.response?.data || error.message);
//     res.status(500).json({ message: 'Error sending summary to Slack or OpenAI failed' });
//   }
// });


app.delete('/api/todos/:id', async (req, res) => {
  await pool.query('DELETE FROM todos WHERE id = $1', [req.params.id]);
  res.status(204).send();
});

app.post('/api/summarize', async (req, res) => {
  const result = await pool.query('SELECT text FROM todos');
  const todos = result.rows.map(row => row.text).join('\n');

  try {
    const summaryRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Summarize the following todos:\n${todos}` }]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const summary = summaryRes.data.choices[0].message.content;

    await axios.post(process.env.SLACK_WEBHOOK_URL, { text: summary });
    res.json({ message: 'Summary sent to Slack!' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending summary to Slack' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
