//jshint esversion:6
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/covidDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  name: String,
  age: Number,
  city: String,
  state: String,
  temperature: String,
  count: Number,
  contact: Number,
  content: String,
  requirement: String,
  result: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {

  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/covid",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get("/", function (req, res) {
  User.find({ name: { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("feed", { usersWithSecrets: foundUsers });
      }
    }
  });
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/feed");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/feed");
      });
    }
  });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/feed");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/covid",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/feed");
  }
);

app.get("/feed", function (req, res) {
  User.find({ "name" : { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("feed", { usersWithSecrets: foundUsers });
      }
    }
  });
});


app.get("/post", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("post");
  } else {
    res.redirect("/login");
  }
});


app.post("/post", function (req, res) {  
      const name=req.body.name;
      const age=req.body.age;
      const city= req.body.city;
      const state= req.body.state;
      const temperature= req.body.temperature;
      const count=req.body.count;     
      const contact= req.body.contact;
      const content= req.body.content;
      const requirement= req.body.requirement;
      const result=req.body.result;
    User.findById(req.user.id, function(err,foundUser){
      if(err){
        console.log(err);
      }
      else{
        if(foundUser){
          foundUser.name=name;
          foundUser.age=age;
          foundUser.city=city;
          foundUser.state=state;
          foundUser.temperature=temperature;
          foundUser.count=count;
          foundUser.contact=contact;
          foundUser.content=content;
          foundUser.requirement=requirement;
          foundUser.result=result;
          foundUser.save(function(){
              if(requirement=="Beds without oxygen"){
                  res.redirect("/bwo");
              }
              else if(requirement=="Beds with oxygen"){
                res.redirect("/bo");
            }
            else if(requirement=="Medicine Type"){
                res.redirect("/mt");
            }
            else if(requirement=="Oxygen Concentrator"){
                res.redirect("/oc");
            }
            else if(requirement=="Plasma"){
                res.redirect("/p");
            }
            else{
                res.redirect("/others");
            }
          })
        }
      }
    })
});

app.get("/bwo", function (req, res) {
  User.find({ "name" : { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("bwo", { usersWithSecrets: foundUsers });
      }
    }
  });
});

app.get("/others", function (req, res) {
  User.find({ "name" : { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("others", { usersWithSecrets: foundUsers });
      }
    }
  });
});
app.get("/bo", function (req, res) {
  User.find({ "name" : { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("bo", { usersWithSecrets: foundUsers });
      }
    }
  });
});
app.get("/mt", function (req, res) {
  User.find({ "name" : { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("mt", { usersWithSecrets: foundUsers });
      }
    }
  });
});
app.get("/oc", function (req, res) {
  User.find({ "name" : { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("oc", { usersWithSecrets: foundUsers });
      }
    }
  });
});
app.get("/p", function (req, res) {
  User.find({ "name" : { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("p", { usersWithSecrets: foundUsers });
      }
    }
  });
});




app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/submit", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", function (req, res) {
  const submittedSecret = req.body.name;

  //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
  // console.log(req.user.id);

  Post.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.name = submittedSecret;
        foundUser.save(function () {
          res.redirect("/secrets");
        });
      }
    }
  });
});



app.listen(3000, function () {
  console.log("Server started on port 3000");
});
