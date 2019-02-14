const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
//id generator 
//stackoverflow:https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 6; i++){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

// check if email
function checkEmail(email, res){
    for (var id in users){
        if( email === users[id].email){ 
            res.send("status 404 code")
        }
    }

}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
  }

app.get("/urls", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let templateVars = { user_id: req.cookies["username"]}
    res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { username: req.cookies["username"],shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });

  app.get("/register", (req, res) => { 
    let templateVars = { user_id: req.cookies["user_id"] }
    res.render("urls_registration",templateVars);
   });

   
app.post("/urls", (req, res) => { 
   var shorturl = generateRandomString();
    urlDatabase[shorturl]= req.body.longURL
    res.redirect(`/urls/${shorturl}`);       
  });
  
  app.post("/urls/:shortURL/delete", (req, res) => { 
    var shortURL= req.params.shortURL; 
    delete urlDatabase[shortURL];
     res.redirect("/urls");       
   });
   app.post("/urls/:shortURL/update", (req, res) => { 
    var longURL= req.body.longURL; 
    var shortURL= req.params.shortURL;
    urlDatabase[shortURL]= longURL;
     res.redirect(`/urls/${shortURL}`);       
   })

   app.post("/login", (req, res) => { 
    res.cookie("user_id",req.body.user_id);
     res.redirect("/urls");       
   });

   app.post("/logout", (req, res) => { 
    res.clearCookie("user_id")
    res.redirect("/urls");
   });


   app.post("/register", (req, res) => { 
    
    
    var email = req.body.email;
    var password = req.body.password;
    if(!email || !password){
        res.send("status code 404") // figure out middleware that throws err
    }
    checkEmail(email, res);

     user_id = generateRandomString();
     users[user_id] = {
        id: user_id,
        email: email,
        password:password,
     }

    res.cookie("user_id",user_id);
    res.redirect("/urls");
   });






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});