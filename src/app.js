const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");
const nodeCron = require("node-cron");
require('dotenv').config();

const port = process.env.PORT || 5005;

const user = process.env.USER;
const password = process.env.APP_PASSWORD;
const fromAddress = process.env.FROM;
const toAddress = process.env.TO;
const senderName = process.env.SENDER_NAME;

const flip = () => {
  axios
    .get(
      "https://www.flipkart.com/search?q=redmi%20note%2010%20pro&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off"
    )
    .then((response) => {
      const $ = cheerio.load(response.data);
      const productDiv = $('div[data-id="MOBGF47C6ZKDEBSF"]');
      if (productDiv.length === 0) {
        console.log("Product not found on page");
        return;
      }
      const isAvailable = productDiv.find("div._2QcLo- div._3G6awp").length > 0;
      if (isAvailable) {
        console.log("Currently unavailable or Comming soon or anything else");
        return false;
      }
      Mail();
    })
    .catch((error) => {
      console.log(error);
    });
};

const Mail = () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: user,
      pass: password,
    },
  });

  const mailOptions = {
    from: `${senderName} <${fromAddress}>`,
    to: toAddress,
    subject: "Flipkart Alert",
    text: "It's Time to buy the REDMI Note 10 Pro (Dark Night, 64 GB)",
    html: "<h1><b>It's Time to buy the REDMI Note 10 Pro (Dark Night, 64 GB)</b></h1>",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

nodeCron.schedule("*/30 * * * *", flip, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});

app.listen(port, () => console.log(`Server running on port ${port}`));
