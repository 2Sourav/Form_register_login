if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

//create basic structure of server

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("/sandbox/project/passport-config");

initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);
//telling the app that it has to
//render an ejs file
const users = [];
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
//creating an arrrow function
app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: "Sourav" });
});
//now we create the different routes our
//app will have
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);
app.get("/register", (req, res) => {
  res.render("register.ejs");
});
//create a post method for register ejs file
//here we will also do hashing of the password
//so that it remains secure
//if hashing is successful, code inside try will
//be executed and if it fails, code inside
//catch will be executed
app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    //push the info of users into the list upon
    //successful hashing
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
  console.log(users);
});
// without logging in the person should not be able
//to access anything
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
app.listen(3000);
