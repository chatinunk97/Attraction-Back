// Get the client
const mysql = require("mysql2");
var express = require("express");
var cors = require("cors");
var app = express();

// Create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "travel",
});

app.use(cors());

app.get("/api/attractions", function (req, res, next) {
  //Pagination
  const page = parseInt(req.query.page);
  const per_page = parseInt(req.query.per_page);
  const start_index = (page - 1) * per_page;

  //An Array that holds params
  var params = [];

  //Sort
  const sort_column = req.query.sort_column;
  const sort_direction = req.query.sort_direction;

  //Search
  const search = req.query.search;

  //Condition to join the query statement
  var sql = "SELECT * FROM attractions";
  if (search) {
    sql += " WHERE name LIKE ? ";
    params.push(`%${search}%`);
  }
  if (sort_column) {
    sql += " ORDER BY " + sort_column + " " + sort_direction;
  }
  sql += " LIMIT ?, ? ";
  params.push(start_index);
  params.push(per_page);
  console.log(sql)
  connection.query(sql, params, function (err, results) {
    connection.query(
      "SELECT COUNT(id) as total FROM attractions",
      function (err, counts, fields) {
        const total = counts[0]["total"];
        const total_pages = Math.ceil(total / per_page);
        res.json({
          page: page,
          per_page: per_page,
          total: total,
          total_pages: total_pages,
          data: results,
        });
      }
    );
  });
});

app.listen(5000, function () {
  console.log("CORS-enabled web server listening on port 5000");
});
