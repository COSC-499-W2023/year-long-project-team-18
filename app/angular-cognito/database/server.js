const express = require('express');
const { app } = require('./database');

app.get('/api/users', (req, res) => {
  require('./database').query('SELECT * FROM users', (error, results) => {
    if (error) {
      return res.status(500).send('Error on the server.');
    }
    res.json({ users: results });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
