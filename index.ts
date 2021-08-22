import express, { Application, Request, Response } from "express";
import fetch from "node-fetch";
require("dotenv").config();

const app: Application = express();
const port = 3000;

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: "Hello World!",
    streetViewUrl: process.env.GOOGLE_STREETVIEW_API,
    openweather: process.env.OPENWEATHER_API,
    query: req.query,
  });
});

// GET '/streetview?lat=<latitude>&long=<longitude>'
app.get("/streetview", async (req: Request, res: Response): Promise<any> => {
  const angle = Math.floor(Math.random() * 8) * 45;
  const coords = { lat: req.query.lat, long: req.query.long };
  const location = coords.lat + "," + coords.long;
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
