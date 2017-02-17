var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 6; i++ ){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function seeIfUserExists(users, emailString) {
  for (user in users){
    if (users[user].email === emailString) {
      return true;
    }
  }
  return false;
}

function urlsForUser(id) {
  const userURLs = {};
  for (shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  } return userURLs;
}


app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca",
              userID: "userRandomID"
            },
  "9sm5xK": { longURL: "http://www.google.com",
              userID: "user2RandomID"
            }
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
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require("cookie-parser");
app.use(cookieParser());

app.get("/urls", (req, res) => {
  console.log(39, req.cookies, users);
  let templateVars = { urls: urlsForUser(req.cookies.user_id), user: users[req.cookies.user_id] };
  // templateVars.user.email = 'fake@email.com';
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    res.render("urls_new");
  } else {
    res.redirect('/login');
  }
  let templateVars = { user: users[req.cookies.user_id] };
});

app.post("/urls", (req, res) => {
  var shortID = generateRandomString();
  urlDatabase[shortID] = { longURL: req.body.longURL, userID: req.cookies.user_id };
  console.log(urlDatabase);
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies.userID] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newLong;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  // get the id (inside req.params.id)
  // remove it from urlDatabase
  delete urlDatabase[req.params.id];
  // redirect somewhere (perhaps /urls?)
  console.log(req.params.id);
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  console.log(79, req.cookies);
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/');
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please use a valid email and password');
    console.log('Error 400');
    return;
  };

  if (seeIfUserExists(users, req.body.email)) {
    res.status(400).send('That email is already registered, please use a different one');
    console.log('Error 400');
    return;
  };

  let userID = generateRandomString();
  users[userID] = {id: userID, email: req.body.email, password: req.body.password};
  res.cookie('user_id', userID);
  res.redirect('/urls');
  console.log(135, users);
});

  app.get("/login", (req, res) => {
    let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
    res.render("urls_login");
  });

  app.post("/login", (req, res) => {
    const { email, password } = req.body;

    for (const userID in users) {
      if (users[userID].email === email && users[userID].password === password) {
        res.cookie("user_id", userID);
        return res.redirect("/");
      }
    }
    return res.status(403).send("Please provide a valid email address and password to login");
  });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
