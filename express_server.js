const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    name: 'session',
    keys: ["TinyAppisanappabouturlshortners"],
  }))
 
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
      if (email === users[id].email && bcrypt.compareSync(password, users[id].password)){
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
app.get("/", (req, res) => {
    var user = users[req.session.id]
    if (user){
        res.redirect("/urls");
    } else {
        res.redirect("/login")
    }
    
  });
app.get("/urls", (req, res) => {
    var userUrls= urlsForUser(req.session.id);
    let templateVars = { user: users[req.session.id], urls: userUrls}
    var user = users[req.session.id]
    if (user){
        res.render("urls_index", templateVars);
  } else {
        res.redirect("/login")
  }
  
});

app.get("/urls/new", (req, res) => {
    const user = users[req.session.id];
    if (user) {
        let templateVars = { user: user}
        res.render("urls_new", templateVars); 
    } else {
        res.redirect("/login")
    }
});

app.get("/urls/:shortURL", (req, res) => {
    var userUrls= urlsForUser(req.session.id);
    let templateVars = { shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL].longURL, user: userUrls};
    
    if(!req.session.id){
        res.send('<h2>Please Login add link to login page</h2>')
    }

    if (urlDatabase[req.params.shortURL].longURL === userUrls[req.params.shortURL]){
        res.render("urls_show", templateVars);
  } else {
        res.send('<h2>short URL does not belong to this account</h2>')
  }
    
});

app.get("/u/:shortURL", (req, res) => {
   
    if(urlDatabase[req.params.shortURL]){
        const longURL = urlDatabase[req.params.shortURL].longURL;
        res.redirect(longURL);
    }
    
    else {
        res.send('<h2>please enter correct short url</h2>');
    }
});

app.get("/register", (req, res) => { 
    var user = users[req.session.id]
        if(user){
            res.redirect("/urls")
        }
        else {
            res.render("urls_registration");
        }
});

app.get("/login", (req, res) => { 
    var user = users[req.session.id]
    if(user){
        res.redirect("/urls")
    }
    else{
        res.render("urls_login");
    }
});
   
app.post("/urls", (req, res) => { 
   var shorturl = generateRandomString();
   var user = req.session.id
   urlDatabase[shorturl]= {
        longURL:req.body.longURL,
        userID: user
    }   
    res.redirect(`/urls/${shorturl}`);       
});
  
app.post("/urls/:shortURL/delete", (req, res) => { 
    var isAuthorized = req.session.id=== urlDatabase[req.params.shortURL].userID
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
    var user = req.session.id;
    if(user){
        urlDatabase[shortURL].longURL= longURL;
        res.redirect(`/urls`);  

    }else{
        res.redirect("/login");
    }
    
});

app.post("/login", (req, res) => { 
    const email = req.body.email;
    const password = req.body.password;
    let user= retrieveUser(email, password);
    if(!email || !password){
        res.send('<h2>Please fill out both fields</h2>') 
    }
    else if (user) {   
        req.session.id = user.id;
    res.redirect('/urls');
    } else {
        res.send('<h2>This account does not exist</h2>')
    }
    
});

app.post("/logout", (req, res) => { 
    req.session = null;
    res.redirect("/urls");
});

app.post("/register", (req, res) => { 
    var email = req.body.email;
    var password = req.body.password;
    if(!email || !password){
        res.send('<h2>Please fill out both fields</h2>') 
    }
    
    else if(checkEmail(email)){
        res.send('<h2>Sorry, email already exists </h2>')
    }
     
    else{
        
        user_id = generateRandomString();
        users[user_id] = {
            id: user_id,
            email: email,
            password: bcrypt.hashSync(password,10)
    }
     
     res.redirect("/urls");
    }
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});