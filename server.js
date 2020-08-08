const express = require("express");
const connectDB = require('./db');
const app = express();

connectDB();

app.get("/", (req, res) => res.send("API running..."));
app.use(express.json({extended : false}));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Listening to PORT ${PORT}`));
