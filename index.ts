import express, { Application, Request, Response } from "express";
import fetch from "node-fetch";
import cors from "cors";
require("dotenv").config();

const app: Application = express();
const port = 3000;

// Body parsing Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
&heading=${angle}&pitch=-1.5`;

  return fetch(streetViewUrl)
    .then((r) => r.buffer())
    .then((r) => {
      res.set("Content-Type", "image/jpeg");
      res.send(r);
    });
});

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error.message}`);
}
