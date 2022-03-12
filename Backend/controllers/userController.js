const express = require("express");
const mysql = require("mysql");
var connection = require("../database");
const bcrypt = require("bcrypt");
const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
//const sendToken = require("../utils/sendToken");
// const ErrorHandler = require("../utils/errorHandler");
// const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

// Register User
exports.registerUser = asyncErrorHandler(async (req, res) => {
  console.log("inside Register");

  try {
    // const salt = await bcrypt.genSalt();
    // const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // console.log(salt);
    // console.log(hashedPassword);

    const { email, firstName, password } = req.body;

    // validate, if user already exists (409 http)

    var createSql =
      "insert into etsy.users (email,first_name,password) values (" +
      mysql.escape(email) +
      " ," +
      mysql.escape(firstName) +
      " ," +
      mysql.escape(password) +
      " ) ";

    connection.query(createSql, (err, result) => {
      console.log(err);
      if (err) {
        res.writeHead(400, {
          "Content-Type": "text/plain",
        });
        res.end("Error while creating user");
        console.log(err);
      } else {
        res.cookie("cookie", req.body.email, {
          maxAge: 900000,
          httpOnly: false,
          path: "/",
        });
        console.log(result);
        const token = jwt.sign(
          { user_id: result.insertId, email },
          "secret123",
          {
            expiresIn: "1hr",
          }
        );
        const user = {
          token: token,
          user_id: result.insertId,
          email: email,
        };
        res.user = user;
        console.log(res);
        res.send(user);
        //res.end("User Registered Succesfully");
      }
    });
    console.log(req.body);
  } catch {
    console.log("error in catch");
    res.status(500).end();
  }
});

//login user
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
  console.log("inside login");

  // var passQuery =
  //   "select password from etsy.users where email=" +
  //   mysql.escape(req.body.email);

  // connection.query(passQuery, (err, result) => {
  //   if (err) {
  //     res.writeHead(503, {
  //       "Content-Type": "text/plain",
  //     });
  //     console.log("cannot connect to database");
  //   } else {
  //     console.log(result[0]);
  //     console.log(result[0].password);
  //   }
  // });

  // if (
  //   bcrypt.compare(
  //     req.body.password,
  //     "$2b$10$JsfxJv/WE9.cbh307k9XzebZttuaAeXpjmYJIOny6qUX2OeRBgcNC"
  //   )
  // ) {

  var loginSql =
    "select * from etsy.users where email=" +
    mysql.escape(req.body.email) +
    "and password = " +
    mysql.escape(req.body.password);

  connection.query(loginSql, (err, result) => {
    if (err) {
      res.writeHead(503, {
        "Content-Type": "text/plain",
      });
      res.end("Error while connecting with database");
      console.log(err);
    } else {
      if (result.length == 1) {
        console.log("Result", result[0]);
        console.log("user ", req.session);
        req.session.user = req.body.email;

        const email = result[0].email;
        const user_id = result[0].user_id;
        const user = {
          user_id: result[0].user_id,
          email: result[0].email,
          password: result[0].password,
        };
        jwt.sign(
          { user_id: email, user_id },
          "secret123",
          { expiresIn: "1h" },
          (err, token) => {
            if (err) {
              console.log(err);
            }
            console.log("I am in token");
            console.log(token);
            user.token = token;

            const data = {
              email: req.body.email,
              user_id: result[0].user_id,
              first_name: result[0].first_name,
              token: token,
            };
            console.log(data);
            res.cookie("cookie", data, {
              maxAge: 9000000,
              httpOnly: false,
              path: "/",
            });
            res.send(user);
          }
        );
        // res.end("Succesfully logged in");
      } else {
        res.status(403).json("Incorrect email or password");
        res.end();
      }
    }
  });
  console.log(req.body);
});

// Get User Details
exports.getUserDetails = asyncErrorHandler(async (req, res, next) => {
  var getUserSql =
    "select * from etsy.users where user_id=" + mysql.escape(req.user.user_id);

  console.log(getUserSql);
  connection.query(getUserSql, (err, result) => {
    if (err) {
      res.send("Error while connecting database");
    } else {
      console.log(result);
      res.send({
        first_name: result[0].first_name,
        email: result[0].email,
        user_id: result[0].user_id,
        country: result[0].country,
        about: result[0].about,
        phone_no: result[0].phone_no,
        gender: result[0].gender,
        city: result[0].city,
        address: result[0].address,
        date: result[0].date,
      });
    }
  });
});

//check Token
exports.checkToken = asyncErrorHandler(async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.json(false);
    }

    const verified = jwt.verify(token, "secret123");
    if (!verified) {
      return res.send(false);
    }

    console.log(req.user);
    var getUserId =
      "select * from etsy.users where user_id=" +
      mysql.escape(req.user.user_id);

    connection.query(getUserId, (err, result) => {
      if (!result) {
        return res.send(false);
      }
      return res.send(true);
    });
  } catch (err) {
    res.status(500).send({ msg: "Hi", err });
  }
});

// Logout User
exports.logoutUser = asyncErrorHandler(async (req, res, next) => {
  res.cookie("auth-token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

exports.getUserDetails;
// Update User Profile ( should also show user profile)
exports.updateProfile = asyncErrorHandler(async (req, res, next) => {
  // console.log("hi");
  // const getDetailsSql =
  //   "select first_name,gender,city,phone_no,address,country from etsy.users where user_id=" +
  //   mysql.escape(req.user.user_id);
  // console.log(getDetailsSql);
  // connection.query(getDetailsSql, (err, result) => {
  //   if (err) {
  //     res.send("Error while connecting database");
  //   } else {
  //     console.log(result);
  //     //console.log("hi");
  //   }
  // });
  console.log("hi user");
  console.log(req.body);
  const name = req.body.name;
  const gender = req.body.gender;
  const city = req.body.city;
  const phone_no = req.body.phone_no;
  const address = req.body.address;
  const country = req.body.country;
  const email = req.body.email;
  const DOB = req.body.date;
  const about = req.body.about;

  var UpdateUserSql =
    "update etsy.users set first_name = " +
    mysql.escape(name) +
    ", city = " +
    mysql.escape(city) +
    ", gender = " +
    mysql.escape(gender) +
    ", phone_no = " +
    mysql.escape(phone_no) +
    ", address = " +
    mysql.escape(address) +
    ", country=" +
    mysql.escape(country) +
    ", email = " +
    mysql.escape(email) +
    ", DOB  = " +
    mysql.escape(DOB) +
    ", about = " +
    mysql.escape(about) +
    " where user_id = " +
    mysql.escape(req.user.user_id);

  console.log(UpdateUserSql);
  connection.query(UpdateUserSql, (err, result) => {
    if (err) {
      res.send("Error while connecting database");
    } else {
      console.log(result);
    }
  });
  res.status(200).json({
    success: true,
  });
  // if (req.body.avatar !== "") {
  //   const user = await User.findById(req.user.id);

  //   const imageId = user.avatar.public_id;

  //   await cloudinary.v2.uploader.destroy(imageId);

  //   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: "avatars",
  //     width: 150,
  //     crop: "scale",
  //   });

  //   newUserData.avatar = {
  //     public_id: myCloud.public_id,
  //     url: myCloud.secure_url,
  //   };
  // }

  // await User.findByIdAndUpdate(req.user.id, newUserData, {
  //   new: true,
  //   runValidators: true,
  //   useFindAndModify: true,
  // });
});
