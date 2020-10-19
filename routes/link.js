const express = require("express"),
    Category = require("../models/category"),
    Links = require("../models/link"),
    app = express(),
    methodOverride = require("method-override"),
    i18n = require("i18n"),
    flash = require("connect-flash"),
    router = express.Router({mergeParams:true});


app.use(flash());
app.use(methodOverride("_method"));

router.get("/add", isLoggedIn, (req, res) => {
    Category.findById(req.params.category_id, (err, category) => {
        if(err){
            console.log(err);
        } else {
            res.render("./links/new", {category:category,header: `Maciej Kuta | Portfolio | Polecane linki | ${category.title} | Dodaj link`, currentUser: req.user, recommended:""})
        }
    })
});

router.post("/", isLoggedIn, (req, res) => {
    let newLink = new Links({
        title: req.body.title,
        titleEn: req.body.titleEn,
        link: req.body.link,
        linkEn: req.body.linkEn,
        description: req.body.description,
        descriptionEn: req.body.descriptionEn,
        
    })
    Links.create(newLink, (err, createdLink) => {
        if(err){
            console.log(err)
        } else {
            Category.findById(req.params.category_id, (err, category) => {
                if(err){
                    console.log(err);
                } else {
                    category.links.push(createdLink);
                    category.save();
                    res.redirect(`/recommended-links/category/${category.link}`)
                }
            })
            
        }
    })
})

router.get("/:link_id/edit", isLoggedIn, (req, res) => {
    Links.findById(req.params.link_id, (err, link) => {
        if(err){
            console.log(err);
        } else {
            res.render("./links/edit", {link:link,header: `Maciej Kuta | Portfolio | Polecane linki | Dana kategoria | Edytuj link`, category_id:req.params.category_id, currentUser: req.user, recommended:""})
        }
    })
})

router.get("/:link_id/redirect", (req, res) => {
    Links.findById(req.params.link_id, (err, link) => {
        if(err){
            console.log(err);
        } else {
            link.click++;
            link.save();
            if(req.language === "pl"){
                
                res.redirect(link.link);
            } else {
                
                res.redirect(link.linkEn);
            }
        }
    })
})

router.put("/:link_id", isLoggedIn, (req, res) => {
    Links.findByIdAndUpdate(req.params.link_id, req.body.link, (err, updatedLink) => {
        if(err){
            console.log(err);
        } else {
            res.redirect(`/recommended-links/category/${req.params.category_id}`)
        }
    })
})

router.get("/:link_id/delete", isLoggedIn, (req, res) => {
    Links.findByIdAndRemove(req.params.link_id, (err, deletedLink) => {
        if(err){
            console.log(err);
        } else {
            res.redirect(`/recommended-links/category/${req.params.category_id}`)
        }
    })
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", i18n.__("Nie masz dostępu do tej strony"));
    res.redirect("/");
}

module.exports = router;