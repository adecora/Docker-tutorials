const express = require("express");

const app = express();

let count = 0;

app.get("/", (req, res) => {
  count++;
  res.send(`Hello world 🐋 !!! This has been visited ${count} times.`);
});

app.listen(5000, () => console.log("Server up on http://localhost:5000"));
