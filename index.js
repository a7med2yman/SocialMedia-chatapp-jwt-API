const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require('./routes/user')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')
const conversationRoute = require('./routes/conversation')
const messageRoute = require('./routes/message')
const path = require('path')

dotenv.config();

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true },
  { useUnifiedTopology: true },
  { useCreateIndex: true },
).then(console.log('connected to mongo DB..')).catch((err)=>console.log(err));

//middleware
app.use(express.json());
app.use(helmet())
app.use(morgan('common'))

app.get('/',(req,res)=>{
    res.send('welcome')
})

app.use('/api/users' , userRoute);
app.use('/api/auth' , authRoute);
app.use('/api/posts' , postRoute);
app.use('/api/conversations' , conversationRoute);
app.use('/api/messages' , messageRoute);

app.listen(8800, () => {
  console.log("backend server is running!");
});
