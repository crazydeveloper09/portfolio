const express = require("express"),
    Project = require("../models/project"),
    Category = require("../models/category"),
    Announcement = require("../models/announcement"),
    passport = require("passport"),
    i18n = require("i18n"),
    router = express.Router();

router.get("/", (req, res) => {
    Project.find({}, function(err, projects){
       if(err) {
           console.log(err);
       } else {
           i18n.setLocale(req.language);
           Announcement.find({}, function(err, announcements){
               if(err){
                   console.log(err);
               } else {
                   res.render("index", {currentUser: req.user, announcements:announcements, lang:req.language, projects: projects,type:req.params.type, header: "Maciej Kuta | Portfolio | Home", home:""});
               }
           });
          
       }
   });
});

router.get("/login", (req, res) => {
   res.render("login");
});

router.get("/recommended-links", (req, res) => {
    Category.find({}, (err, categories) => {
        if(err){
            console.log(err)
        } else {
            i18n.setLocale(req.language);
            res.render("./links/index", {categories:categories,lang: req.language,header: 'Maciej Kuta | Portfolio | Polecane linki', currentUser: req.user, recommended:""})
        }
    })
    
})


router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) =>  {
   
});

router.get("/support", (req, res) => {
	res.redirect("https://www.buymeacoffee.com/crazydev");
});
/*
router.get("/register", (req, res) => {
    i18n.setLocale(req.language);
    res.render("register");
});
router.post("/register", (req, res) => {
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
*/
router.get("/logout", (req, res) =>  {
    req.logout();
    res.redirect("/");
});

module.exports = router;