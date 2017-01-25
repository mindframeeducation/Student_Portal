// Set up requirements
var express             = require("express"),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    app                 = express(),
    methodOverride      = require("method-override"),
    Blog                = require("./models/blog"),
    User                = require("./models/user"),
    // Flash message:
    flash               = require("connect-flash"),
    // Authentication requirements:
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    seedDB              = require("./seed_students"),
    seedEmail           = require("./seed_emails"),
    expressSanitizer    = require("express-sanitizer");
// NOTE: Cannot include pure JS file to this. The JS file will not work

// Setting up and including the routes
var blogRoutes      = require("./routes/blogs"),
    studentRoutes   = require("./routes/students"),
    entryRoutes     = require("./routes/entries"),
    noteRoutes      = require("./routes/notes"),
    parentRoutes    = require("./routes/parents"),
    indexRoutes     = require("./routes/index");

// Seed the student's database. ONLY DO IT ONCE!
// seedDB();
// Seed email database. Only do it once
// seedEmail();
// print_student();
// console.log(process.env.BLOG_DATABASE);
console.log(process.env.BLOG_DATABASE);
// export ENV_VAR=value in command line
var db = process.env.BLOG_DATABASE || "mongodb://localhost/blogData";
// App config
mongoose.connect(db, function(err,db){
    if (err){
        console.log("There is an error connecting to the database");
    } else {
        console.log("Connected to database!");
    }
});

app.set("view engine", "ejs");
// app.use(express.static("public"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer()); // Needs to go after bodyParser!!!
app.use(methodOverride("_method"));
app.use(flash()); // Need this for flash messages

// CONFIGURATION FOR PASSPORT ======================
app.use(require("express-session")({
    secret: "Mindframe",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// =================================================

app.use(function(req,res,next){
    res.locals.currentUser = req.user; // Set the variable currentUser to the logged in user
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next(); // This is important, otherwise the program will be stuck!
});

// ==============================
// Using all the required routes
// =============================
app.use("/blogs", blogRoutes);
app.use(indexRoutes);
app.use(studentRoutes);
app.use("/parents", parentRoutes);
app.use("/students/:id/notes", noteRoutes);
app.use("/students/:id/entries", entryRoutes);



// HOME PAGE. THIS IS REQUIRED SINCE NONE OF THE ROUTES HAVE THIS!
app.get("/", function(req,res){
    res.redirect("/blogs");
});

// =================================================================
// CREATING ADMIN USER. Only do it once!
// var testUser = new User({username: "admin", role: 'admin'});
// User.register(testUser, "mindframeAdm1n", function(err, user){
//     if (err){
//         console.log("There is an error!");
//     } else {
//         console.log("Successfully created the admin!");
//         console.log(user);
//     }
// });

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Blog app is running!");
});
    