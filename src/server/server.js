const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const morgan = require("morgan");
const connectMongo = require("connect-mongo");
const multer = require('multer');

const mongoose = require("mongoose");

const Handlebars=require('handlebars');

const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');




const app = express();

require("../config/passport");



// settings
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "../views"));

app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    
     helpers:require("./helpers"),
  })
);
app.set("view engine", ".hbs");

app.use(morgan("dev"));

	app.use(multer({dest:path.join(__dirname,'../public/img/uploads')}).single('image'));
	

app.use(express.urlencoded({ extended: false }));

app.use(express.json());




app.use(methodOverride("_method"));
const MongoStore = connectMongo(session);
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);





app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});


app.use(require("../routes/index.routes"));
app.use(require("../routes/user.routes"));
app.use(require("../routes/images.routes"));




app.use(express.static(path.join(__dirname, "../public")));

module.exports = app;
