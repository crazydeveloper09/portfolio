	const express             = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    methodOverride        = require("method-override"),
    passport              = require("passport"),
    passportLocalMongoose = require("passport-local-mongoose"),
    LocalStrategy 		  = require("passport-local").Strategy,
	cookieParser 		  = require("cookie-parser"),
    flash                 = require("connect-flash"),
    multer                = require("multer"),
	i18n 				  = require("i18n"),
    dotenv                = require("dotenv");
    dotenv.config();
    var storage = multer.diskStorage({
        filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
        }
    });
    var imageFilter = function (req, file, cb) {
        // accept image files only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    };
    var upload = multer({ storage: storage, fileFilter: imageFilter})
    
    var cloudinary = require('cloudinary');
    cloudinary.config({ 
        cloud_name: 'syberiancats', 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    }); 

// Connecting to database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});

// App configuration
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.use(methodOverride("_method"));
app.use(cookieParser());

i18n.configure({
    locales: ["en", "de", "pl"],
   	register: global,
	defaultLocale: 'en',
    directory: __dirname + '/locales',
})

app.use(i18n.init);
const achievementsSchema = new mongoose.Schema({
    title:String,
    picture: String
});

let Achievement = mongoose.model("Achievement", achievementsSchema);

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    about: String,
    achievements: [achievementsSchema]
});
userSchema.plugin(passportLocalMongoose);
let User = mongoose.model("User", userSchema);

const projectSchema = new mongoose.Schema({
    title: String,
    description: String,
    profile: String,
    status:String,
    link: String,
    pictures: Array,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    stars: {
        number: Number,
        iterate: Number
    }
});

let Project = mongoose.model("Project", projectSchema);

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        required: true
    },
    written: {
        type: Date,
        default: Date.now()
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    stars: Number
});

let Comment = mongoose.model("Comment", commentSchema);


app.use(require("express-session")({
    secret: "heheszki",
    resave: false,
    saveUninitialized: false
}));
app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
	res.locals.language = i18n;
    next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.get("/", function(req, res){
	 Project.find({}, function(err, projects){
        if(err) {
            console.log(err);
        } else {
			i18n.setLocale(req.language)
            res.render("index", {currentUser: req.user, projects: projects, header: "Maciej Kuta | Portfolio | Home", home:""});
        }
    });
});

app.get("/login", function(req, res){
    i18n.setLocale(req.language);
    res.render("login");
});



app.get("/about", function(req, res){
    let username = "Admin";
    User.findOne({username: username}, function(err, user){
        if(err){
            console.log(err);
        } else {
            i18n.setLocale(req.language);
            res.render("about", {currentUser: req.user, user:user, header: "Maciej Kuta | Portfolio | O mnie", about:""});
        }
    });
   
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/projects/last",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res) {
   
});

app.get("/support", function(req, res){
	res.redirect("https://www.buymeacoffee.com/crazydev");
});
app.get("/register", function(req, res){
    i18n.setLocale(req.language);
    res.render("register");
});
app.post("/register", function(req, res){
    let newUser = new User({
        username: req.body.username
    });
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            req.flash("error", err.message)
            return res.render("register", {user: req.body, error: err.message});
        } 
        passport.authenticate("local")(req, res, function() {
            req.flash("success", i18n.__('Witaj ') + req.body.username + i18n.__(' na moim portfolio'));
            res.redirect("/login");
        });
    });
});
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
});

app.get("/projects/:project_id/reviews/new", isLoggedIn, function(req, res){
    Project.findById(req.params.project_id, function(err, project){
        if(err){
            console.log(err);
        } else {
            i18n.setLocale(req.language);
            res.render("./reviews/new", { project:project, currentUser: req.user, header: "Maciej Kuta | Portfolio | " + project.title + " | Nowa opinia", lang: req.language});
        }
    });
    
});
app.post("/projects/:project_id/reviews", isLoggedIn, function(req, res){
    Project.findById(req.params.project_id, function(err, project){
        if(err){
            console.log(err);
        } else {    

            Comment.create({text: req.body.text}, function(err, review){
                if(err){
                    console.log(err);
                } else {
                    console.log(req.body);
                    review.author = req.user._id;
                    review.project = project._id;
                    review.stars = req.body.stars;
                    review.save();
                    project.reviews.push(review);
                    project.save();
                    res.redirect("/projects/" + project._id);
                }
            });
        }
    });
});


app.get("/projects/:project_id/reviews/:review_id/edit", isLoggedIn, function(req, res){
    Project.findById(req.params.project_id, function(err, project){
        if(err){
            console.log(err);
        } else {
            Comment.findById(req.params.review_id, function(err, review){
                if(err) {
                    console.log(err);
                } else {
                    i18n.setLocale(req.language);
                    res.render("./reviews/edit", { project:project, currentUser: req.user, review:review, header: "Maciej Kuta | Portfolio | " + project.title + " | Edytuj opinię", lang: req.language});
                }
            });
            
        }
    });
    
});



app.put("/projects/:project_id/reviews/:review_id", isLoggedIn, function(req, res){
    Project.findById(req.params.project_id, function(err, project){
        if(err){
            console.log(err);
        } else {
            Comment.findByIdAndUpdate(req.params.review_id, req.body.review, function(err, review){
                if(err) {
                    console.log(err);
                } else {
                    res.redirect("/projects/" + project._id);
                }
            });
            
        }
    });
    
});

app.get("/projects/:project_id/reviews/:review_id/delete", isLoggedIn, function(req, res){
    Project.findById(req.params.project_id, function(err, project){
        if(err){
            console.log(err);
        } else {
            Comment.findByIdAndDelete(req.params.review_id, function(err, review){
                if(err) {
                    console.log(err);
                } else {
                    res.redirect("/projects/" + project._id);
                }
            });
            
        }
    });
    
});

app.get("/colorgame", function(req, res){
	res.render("color", { header: "Maciej Kuta | Portfolio | Bootcamp | Zgadywanie kolorów"  });
});

app.get("/score-keeper", function(req, res){
	res.render("score", { header: "Maciej Kuta | Portfolio | Bootcamp | Score keeper" });
})


app.get("/projects/new", isLoggedIn, function(req, res){
    Project.find({}, function(err, projects){
        if(err) {
            console.log(err);
        } else {
            res.render("./projects/new", {projects: projects, header: "Maciej Kuta | Portfolio | Nowa nowinka"});
        }
    });
});



app.get("/projects/:id/edit", isLoggedIn, function(req, res){
    Project.findById(req.params.id, function(err, project){
        if(err) {
            console.log(err);
        } else {
            res.render("./projects/edit", {project: project, header: "Maciej Kuta | Portfolio | Edytowanie nowinki"});
        }
    });
});

app.get("/user/:id/edit", isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, user){
        if(err) {
            console.log(err);
        } else {
            res.render("uedit", {user: user, header: "Maciej Kuta | Portfolio | Edytowanie usera"});
        }
    });
});


app.get("/projects/:id", function(req, res){
    Project.findById(req.params.id, function(err, project){
        if(err) {
            console.log(err);
        } else {
            i18n.setLocale(req.language);
            Comment.find({project: project._id}).populate("author").exec(function(err, reviews){
                if(err){
                    console.log(err);
                } else {
                    res.render("./projects/show", {project: project, currentUser: req.user, header: "Maciej Kuta | Portfolio | " + project.title, reviews: reviews, lang: req.language});
                }
            });
           
        }
    });
});

app.get("/projects", function(req, res){
    Project.find({}, function(err, projects){
        if(err) {
            console.log(err);
        } else {
			i18n.setLocale(req.language)
            res.render("./projects/index", {projects: projects, currentUser: req.user, header: "Maciej Kuta | Portfolio | Moje projekty", my:""});
        }
    });
});

app.post("/projects",upload.single("profile"),function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        let newProject = new Project({
            title: req.body.title,
            description: req.body.description,
            profile: result.secure_url,
            status: req.body.status,
            link: req.body.link,
            pictures: []
        });
        Project.create(newProject, function(err, project){
            if(err) {
                console.log(err)
            } else {
                res.redirect("/projects/" + project._id);
            }
        });
    });
    
});


app.post("/achievements",upload.single("picture"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        let newAchievement = new Achievement({
            title: req.body.title,
            picture: result.secure_url
        });
        Achievement.create(newAchievement, function(err, achievement){
            if(err){
                console.log(err);
            } else {
                User.findOne({username: "Admin"}, function(err, user){
                    if(err) {
                        console.log(err)
                    } else {
                        user.achievements.push(achievement);
                        user.save();
                        res.redirect("/about");
                    }
                });
            }
        });
    });
    
   
});
app.post("/projects/new/picture",upload.single("picture"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        Project.findOne({title: req.body.title}, function(err, project){
            if(err) {
                console.log(err)
            } else {
                project.pictures.push(result.secure_url);
                project.save();
                res.redirect("/projects/" + project._id);
            }
        });
    });
    
});

app.post("/projects/edit/picture", upload.single("picture"), function(req, res){
   
    cloudinary.uploader.upload(req.file.path, function(result) {
      
        Project.findOne({title: req.body.title}, function(err, project){
            if(err) {
                console.log(err);
            } else {
                project.profile = result.secure_url;
                project.save();
                res.redirect("/projects/" + project._id);
            }
        });
    });
    
});

app.put("/projects/:id", isLoggedIn, function(req, res){
    Project.findByIdAndUpdate(req.params.id, req.body.project, function(err, updatedProject){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/projects/" + req.params.id);
        }
    });
});

app.put("/user/:id", isLoggedIn, function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/about");
        }
    });
});

app.delete("/projects/:id", isLoggedIn, function(req, res){
    Project.findByIdAndDelete(req.params.id, function(err, deletedProject){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", i18n.__("Prosimy zaloguj się najpierw"));
    res.redirect("/login");
}

app.listen(process.env.PORT);