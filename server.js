require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

