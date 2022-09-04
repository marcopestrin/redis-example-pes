import express from "express"
import mongoose from "mongoose";
import morgan from "morgan";
import { config } from "dotenv";

import User from "./models/user.js";
import tokenGenerator from "./utils/tokenGenerator.js";
import { setCache, getCache, deleteCache } from  "./utils/cacheHandler.js";
import { getMockData } from './utils/httpCall.js';

config({ path: "./env/.env" });
const app = express();
app.use(morgan("combined"));
app.use(express.json());
app.use((req, res, next) => {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE,  OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
next();
});


app.get("/data/mockData", async (req, res) => {
  try {
    const response = await getMockData();
    res.status(200).json({
      status: 'sucess',
      response
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "Fail",
      message: err.message
    });
  }
});

app.get("/userss", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "Success",
      users,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "Fail",
      message: "Failed to fetch users",
    });
  }
});

app.post("/users/getToken", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({
    status: "Fail",
    message: "Email required",
  });
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({
      status: "Fail",
      message: "Email already in use",
    });
    
    const token = tokenGenerator();
    await setCache(token, { email, token }, 60 * 60 * 24); // 24 hours
    res.status(200).json({
      status: "Success",
      message: "Token generated",
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "Fail",
      message: "Something went terribly wrong",
    });
  }
});

app.post("/users/signup", async (req, res) => {
  const { email, name, password } = req.body;
  const { token } = req.query;
  const userExists = await User.findOne({ email });

  if (userExists) return res.status(400).json({
    status: "Fail",
    message: "Email already in use",
  });

  if (!token) return res.status(400).json({
    status: "Fail",
    message: "Token required",
  });

  if (!email || !name || !password) return res.status(400).json({
    status: "Fail",
    message: "Invalid request",
  });

  const data = await getCache(token);
  if (!data || data.email !== email) return res.status(403).json({
    status: "Fail",
    message: "Access denied",
  });

  try {
    const user = await User.create({ name, email, password });
    await deleteCache(email);
    res.status(201).json({
      status: "Success",
      message: "User saved",
      user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "Fail",
      message: "Failed to save user",
    });
  }
});


mongoose.connect(
 `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@mongodb:27017/redix-example-pes?authSource=admin`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.error("Failed to connect to MongoDb");
      console.error(err);
    } else {
      console.log("Connected to MongoDb");
      app.listen(4000, () => console.log(`App listening on port 4000 in ${process.env.NODE_ENV} mode.`));
    }
  }
);