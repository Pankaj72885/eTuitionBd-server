import express from "express";

const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World! and changes");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
