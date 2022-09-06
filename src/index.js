require("dotenv").config();

const express = require("express");
const configServer = require("./server/server");
const http = require('http')
const reload = require('reload')

const app = configServer(express());


app.listen(app.get("port"), () =>
  console.log(`Server run on port ${app.get("port")}`)
);
