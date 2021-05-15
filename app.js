//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const textt="What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

const app= express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/covidDB", {useNewUrlParser: true, useUnifiedTopology: true} );

const postSchema = {
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
   };
const Post = mongoose.model("Post", postSchema);

app.get("/",function(req,res){
    Post.find({}, function(err, foundPosts){
        res.render("feed", {
          posts: foundPosts
          });
      });
});
app.get("/feed",function(req,res){
    Post.find({}, function(err, foundPosts){
        res.render("feed", {
          posts: foundPosts
          });
      });
});
app.get("/post",function(req,res){
    res.render("post");
});
app.get("/others",function(req,res){
    Post.find({}, function(err, foundPosts){
        res.render("others", {
          posts: foundPosts
          });
      });
});
app.get("/login",function(req,res){
    res.render("login");
});
app.post("/post",function(req,res){
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

});

app.get("/bwo",function(req,res){
    Post.find({}, function(err, foundPosts){
        res.render("bwo", {
          posts: foundPosts
          });
      });
});
app.get("/bo",function(req,res){
    Post.find({}, function(err, foundPosts){
        res.render("bo", {
          posts: foundPosts
          });
      });
});
app.get("/mt",function(req,res){
    Post.find({}, function(err, foundPosts){
        res.render("mt", {
          posts: foundPosts
          });
      });
});
app.get("/oc",function(req,res){
    Post.find({}, function(err, foundPosts){
        res.render("oc", {
          posts: foundPosts
          });
      });
});
app.get("/p",function(req,res){
    Post.find({}, function(err, foundPosts){
        res.render("p", {
          posts: foundPosts
          });
      });
});





















app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
  