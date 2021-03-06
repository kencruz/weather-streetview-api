import express, { Application, Request, Response } from "express";
import fetch from "node-fetch";
import cors from "cors";
import rateLimit from "express-rate-limit";
require("dotenv").config();

const app: Application = express();
const port = 3000;
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}
const rateLimitWindow = process.env.RATE_LIMIT_WINDOW || 60;
const rateLimitMax = process.env.RATE_LIMIT_MAX || 10;
const limiter = rateLimit({
  windowMs: Number(rateLimitWindow) * 1000, // In seconds
  max: Number(rateLimitMax), // limit each IP to 100 requests per windowMs
});

// Body parsing Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.get("/", async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: "Hello World!",
    query: req.query,
  });
});

// GET '/weather?lat=<latitude>&lon=<longitude>'
app.get("/weather", async (req: Request, res: Response): Promise<Response> => {
  const [lat, lon] = [req.query.lat, req.query.lon];
  if (!lat || !lon) {
    return res.status(400).send({ error: "need coordinates" });
  }

  const weather = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API}`
  ).then((res) => res.json());
  const forecast = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&appid=${process.env.OPENWEATHER_API}`
  ).then((res) => res.json());

  if (weather.cod != "200") {
    return res.status(400).send({
      weather,
      query: req.query,
    });
  }
  if (forecast.cod != "200") {
    return res.status(400).send({
      forecast,
      query: req.query,
    });
  }

  return res.status(200).send({
    weather,
    forecast,
    query: req.query,
  });
});

// GET '/streetview?lat=<latitude>&lon=<longitude>'
app.get("/streetview", async (req: Request, res: Response): Promise<any> => {
  const [lat, lon] = [req.query.lat, req.query.lon];
  if (!lat || !lon) {
    return res.status(400).send({ error: "need coordinates" });
  }
  const angle = Math.floor(Math.random() * 8) * 45;
  const location = lat + "," + lon;
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?\
size=640x320\
&location=${location}\
&key=${process.env.GOOGLE_STREETVIEW_API}\
&heading=${angle}&pitch=-1.5&return_error_code=true`;

  const response = await fetch(streetViewUrl);
  if (response.status != 200) {
    return res
      .status(400)
      .send({ error: "streetview not found", query: req.query });
  }

  const buffer = await response.buffer();
  res.set("Content-Type", "image/jpeg");
  return res.send(buffer);
});

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error.message}`);
}
