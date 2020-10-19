const express = require("express"),
    User = require("../models/user"),
    app = express(),
    methodOverride = require("method-override"),
    i18n = require("i18n"),
    flash = require("connect-flash"),
    router = express.Router();


app.use(flash());
app.use(methodOverride("_method"));

router.get("/", function(req, res){
    let username = "Admin";
    User.findOne({username: username}, function(err, user){
        if(err){
            console.log(err);
        } else {
            i18n.setLocale(req.language);
            res.render("./user/show", {currentUser: req.user, user:user,type:req.params.type, lang: req.language, header: "Maciej Kuta | Portfolio | O mnie", about:""});
        }
    });
   
});


router.get("/:id/edit", isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, user){
        if(err) {
            console.log(err);
        } else {
            res.render("./user/edit", {user: user, header: "Maciej Kuta | Portfolio | Edytowanie usera", type:req.params.type,});
        }
    });
});


router.put("/:id", isLoggedIn, function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
        if(err) {
            console.log(err);
        } else {
            res.redirect("");
        }
    });
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", i18n.__("Nie masz dostępu do tej strony"));
    res.redirect("/");
}

module.exports = router;