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


function checkEmail(email){
    for (var id in users){
        if( email === users[id].email){ 
            return true;
        }
    }

}


function retrieveUser(email, password) {
    for (var id in users) {
      if (email === users[id].email && password === users[id].password) {
        return users[id];
      }
    } 
  }

function urlsForUser(user_id){
    let obj = {};
    for (var shorturl in urlDatabase){
        if (urlDatabase[shorturl].userID === user_id) {
            obj[shorturl] = urlDatabase[shorturl].longURL;
        }
    }

    return obj;
}



var urlDatabase = {
  "b2xVn2":{ longURL:"http://www.lighthouselabs.ca", userID:"userRandomID" },
  "9sm5xK":{ longURL:"http://www.google.com", userID:"user2RandomID" }
};

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "123"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "123"
    }
  }

app.get("/urls", (req, res) => {
  var userUrls= urlsForUser(req.cookies["id"]);
    let templateVars = { user: users[req.cookies["id"]], urls: userUrls}
  var user = users[req.cookies["id"]]
    if (user){
    res.render("urls_index", templateVars);
  } else {
      res.redirect("/login")
  }
  
});

app.get("/urls/new", (req, res) => {
    const user = users[req.cookies["id"]]
    if (user) {
        let templateVars = { user: user}
        res.render("urls_new", templateVars); 
    } else {
        res.redirect("/register")
    }
});

app.get("/urls/:shortURL", (req, res) => {
    // var userUrls= urlsForUser(req.cookies["id"]);
    let templateVars = { shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL].longURL, user: user};
    var user = users[req.cookies["id"]]
    
   
    if (user){
    res.render("urls_show", templateVars);
  } else {
      res.redirect("/login")
  }
    
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  });

  app.get("/register", (req, res) => { 
    var userUrls= urlsForUser(req.cookies["id"]);
    let templateVars = { user: users[req.cookies["id"]]}
    res.render("urls_registration",templateVars );
   });

   app.get("/login", (req, res) => { 
    var userUrls= urlsForUser(req.cookies["id"]);
    let templateVars = { user: users[req.cookies["id"]]}
    res.render("urls_login", templateVars);
   });
   
app.post("/urls", (req, res) => { 
   var shorturl = generateRandomString();
   var user =  req.cookies["id"]
   urlDatabase[shorturl]= {
        longURL:req.body.longURL,
        userID: user
    }   
    res.redirect(`/urls/${shorturl}`);       
  });
  
  app.post("/urls/:shortURL/delete", (req, res) => { 
    
    var isAuthorized = req.cookies["id"] === urlDatabase[req.params.shortURL].userID
  
    if(isAuthorized){
        delete urlDatabase[req.params.shortURL];
        res.redirect("/urls");  
    }
    else{
        res.redirect("/login")
    }
   });
   
   app.post("/urls/:shortURL/update", (req, res) => { 
    var longURL= req.body.longURL; 
    var shortURL= req.params.shortURL;
    var user = req.cookies["id"];

    if(user){
        urlDatabase[shortURL].longURL= longURL;
        res.redirect(`/urls`);  

    }else{

        res.redirect("/login");
    }
    
        
   })

   app.post("/login", (req, res) => { 
    const email = req.body.email;
    const password = req.body.password;
    
    let user= retrieveUser(email, password);
    if (user) {   
    res.cookie('id', user.id);
    res.redirect('/urls');
    } else{
        res.send("403 status code")
    }
    
   });

   app.post("/logout", (req, res) => { 
    
    res.clearCookie("id")
    res.redirect("/urls");
   });

   app.post("/register", (req, res) => { 
    var email = req.body.email;
    var password = req.body.password;
    if(!email || !password){
        res.send("status code 404") // figure out middleware that throws err
    }
    
    if(checkEmail(email)){
        res.send("status code 404")
    }
     
    else{
        user_id = generateRandomString();
     users[user_id] = {
        id: user_id,
        email: email,
        password:password,
     }
     res.redirect("/urls");
    }
   });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});