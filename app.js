//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');



const app= express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  


mongoose.connect("mongodb://localhost:27017/covidDB", {useNewUrlParser: true, useUnifiedTopology: true} );
mongoose.set("useCreateIndex", true);

const postSchema =new mongoose.Schema( {
    email: String,
  password: String,
  googleId: String,
  secret: String,
    name: String,
    age: Number,
    city:String,
    state: String,
    temperature:String,
    count: Number,
    contact:Number,
    content: String,
    requirement: String,
    result: String
   });

   postSchema.plugin(passportLocalMongoose);
   postSchema.plugin(findOrCreate);

const Post = mongoose.model("Post", postSchema);

passport.use(Post.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Post.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/covid",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    Post.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res){
  Post.find({"name": {$ne: null}}, function(err, foundUsers){
     if (err){
       console.log(err);
     } else {
       if (foundUsers) {
         res.render("feed", {usersWithSecrets: foundUsers});
       }
     }
   });
 });

app.get("/post", function(req, res){
  if (req.isAuthenticated()){
    res.render("post");
  } else {
    res.redirect("/login");
  }
});





app.post("/post",function(req,res){
  if (req.isAuthenticated()){
    const x=req.body.requirement;
    const post = new Post ({
        name: req.body.name,
        age: req.body.age,
        city: req.body.city,
        state: req.body.state,
        temperature: req.body.temperature,
        count: req.body.count,
        contact: req.body.contact,
        requirement:req.body.requirement,
        content: req.body.content,
        result:req.body.result
      });

      post.save(function(err){
          if(!err){
              if(x=="Beds without oxygen"){
                  res.redirect("/bwo");
              }
              else if(x=="Beds with oxygen"){
                res.redirect("/bo");
            }
            else if(x=="Medicine Type"){
                res.redirect("/mt");
            }
            else if(x=="Oxygen Concentrator"){
                res.redirect("/oc");
            }
            else if(x=="Plasma"){
                res.redirect("/p");
            }
            else{
                res.redirect("/others");
            }
          }
      });
    }
    else{
      res.redirect("/login");
    }
});

app.get("/bwo", function(req, res){
 
  Post.find({}, function(err, foundPosts){
    res.render("bwo", {
      posts: foundPosts
      });
  });
 
  
});

app.get("/others", function(req, res){
 
  Post.find({}, function(err, foundPosts){
    res.render("others", {
      posts: foundPosts
      });
  });
 
  
});
app.get("/bo", function(req, res){
 
  Post.find({}, function(err, foundPosts){
    res.render("bo", {
      posts: foundPosts
      });
  });
 
  
});
app.get("/mt", function(req, res){
 
  Post.find({}, function(err, foundPosts){
    res.render("mt", {
      posts: foundPosts
      });
  });
 
  
});
app.get("/oc", function(req, res){
 
    Post.find({}, function(err, foundPosts){
      res.render("oc", {
        posts: foundPosts
        });
    });
   
    
});
app.get("/p", function(req, res){
 
  Post.find({}, function(err, foundPosts){
    res.render("oc", {
      posts: foundPosts
      });
  });
 
  
});



















  
  app.get("/auth/google",
    passport.authenticate('google', { scope: ["profile"] })
  );
  
  app.get("/auth/google/covid",
    passport.authenticate('google', { failureRedirect: "/login" }),
    function(req, res) {
      // Successful authentication, redirect to secrets.
      res.redirect("/feed");
    });
  
  app.get("/login", function(req, res){
    res.render("login");
  });
  
  app.get("/register", function(req, res){
    res.render("register");
  });
  
  app.get("/feed", function(req, res){
   Post.find({"name": {$ne: null}}, function(err, foundUsers){
      if (err){
        console.log(err);
      } else {
        if (foundUsers) {
          res.render("feed", {usersWithSecrets: foundUsers});
        }
      }
    });
  });

  
  app.get("/submit", function(req, res){
    if (req.isAuthenticated()){
      res.render("submit");
    } else {
      res.redirect("/login");
    }
  });
  
  app.post("/submit", function(req, res){
    const submittedSecret = req.body.name;
  
  //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
    // console.log(req.user.id);
  
    Post.findById(req.user.id, function(err, foundUser){
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          foundUser.name = submittedSecret;
          foundUser.save(function(){
            res.redirect("/secrets");
          });
        }
      }
    });
  });
  
  app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  });
  
  app.post("/register", function(req, res){
  
    Post.register({username: req.body.username}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/feed");
        });
      }
    });
  
  });
  
  app.post("/login", function(req, res){
  
    const user = new Post({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/feed");
        });
      }
    });
  
  });















app.listen(3000, function() {
    console.log("Server started on port 3000");
  });