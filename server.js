import { Configuration, OpenAIApi } from "openai";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

const configuration = new Configuration({
  organization: process.env.ORG,
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from Luciano Bot.",
  });
});

app.post("/", async (req, res) => {
  const { messages } = req.body;

  console.log(messages);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "Pretend you are a human named Luciano that is web3 specialist who is here just to help people start or integrate their project with web3, specifically blockchain. Pretend you work for Wisefy, a company that specializes in integrating existing or new companies to web3, specifically blockchain. Please introduce yourself the first time speaking. Act extremely professional, helpful and polite.",
      },
      ...messages,
    ],
  });

  res.json({
    completion: completion.data.choices[0].message,
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
