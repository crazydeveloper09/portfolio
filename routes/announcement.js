const express = require("express"),
    Announcement = require("../models/announcement"),
    app = express(),
    methodOverride = require("method-override"),
    i18n = require("i18n"),
    flash = require("connect-flash"),
    router = express.Router();


app.use(flash());
app.use(methodOverride("_method"));


router.get("/new", isLoggedIn, (req, res) => {
    res.render("./announcements/new", {header:"Maciej Kuta | Portfolio | Nowe ogłoszenie", currentUser: req.user});

});

router.post("/", isLoggedIn, (req, res) => {
    Announcement.create({pl: req.body.polish, en: req.body.english}, function(err, createdAnnouncement){
        if(err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

router.get("/:id/edit", isLoggedIn, (req, res) => {
    Announcement.findById(req.params.id, function(err, announcement){
        if(err){
            console.log(err);
        } else {
            res.render("./announcements/edit", {header:"Maciej Kuta | Portfolio | Edytuj ogłoszenie", currentUser: req.user, announcement: announcement});
        }
    })
});

router.put("/:id", isLoggedIn, (req, res) => {
    Announcement.findByIdAndUpdate(req.params.id, req.body.announcement, function(err, updatedAnnouncement){
        if(err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});


router.get("/:id/delete", isLoggedIn, (req, res) => {
    Announcement.findByIdAndRemove(req.params.id, function(err, deletedAnnouncement){
        if(err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", i18n.__("Nie masz dostępu do tej strony"));
    res.redirect("/");
}

module.exports = router;