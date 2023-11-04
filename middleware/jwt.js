require("dotenv").config();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

exports.signin = async (paylod) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      paylod,
      JWT_SECRET,
      {
        expiresIn: "24h",
      },
      (err, token) => {
        if (err) {
          console.log("ERROR JWT :", err);
          return resolve(null);
        }
        return resolve(token);
      }
    );
  });
};

module.exports.verify = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decode) => {
      if (err) {
        console.log("ERROR JWT VERIFY :", err);
        return resolve(null);
      }
      return resolve(decode);
    });
  });
};
