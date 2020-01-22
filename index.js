const express = require("express");
var fs = require("fs");
var parse = require("csv-parse");

var winston = require("winston");
var expressWinston = require("express-winston");

const app = express();

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function(req, res) {
      return false;
    } // optional: allows to skip some log messages based on request and/or response
  })
);

app.get("/", function(req, res) {
  res.send("Cryptomon Backend");
});

app.use("/cryptomon", express.static("public"));

var inputFile = "pokemons.csv";

var csvData = new Map();
fs.createReadStream(inputFile)
  .pipe(parse({ delimiter: "," }))
  .on("data", function(csvrow) {
    //do something with csvrow
    if (csvrow[0] !== "pokedex_number") {
      csvData.set(parseInt(csvrow[0], 10), {
        atk: parseInt(csvrow[1], 10),
        def: parseInt(csvrow[2], 10),
        hp: parseInt(csvrow[3], 10),
        name: csvrow[4],
        capture_rate: parseInt(csvrow[5], 10)
      });
    }
  })
  .on("end", function() {
    //do something with csvData
  });

app.get("/cryptomon/meta/:pokedex_number", function(req, res) {
  pn = parseInt(req.params.pokedex_number, 10);
  res.json(csvData.get(pn));
});

app.use(
  expressWinston.errorLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    )
  })
);

app.listen(5000, function() {
  console.log("Example app listening on port 3000!");
});
