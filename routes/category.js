const express = require("express"),
    Category = require("../models/category"),
    app = express(),
    methodOverride = require("method-override"),
    i18n = require("i18n"),
    flash = require("connect-flash"),
    router = express.Router();


app.use(flash());
app.use(methodOverride("_method"));


router.get("/add", isLoggedIn, (req, res) => {
    res.render("./category/new", {header: 'Maciej Kuta | Portfolio | Polecane linki | Dodaj kategorię', currentUser: req.user, recommended:""})
})

router.post("/", isLoggedIn, (req, res) => {
    let newCategory = new Category({
        title: req.body.title, 
        titleEn: req.body.titleEn,
        description: req.body.description,
        descriptionEn: req.body.descriptionEn,
        link: req.body.titleEn.toLowerCase().split(' ').join('-')
    })
    Category.create(newCategory, (err, createdCategory) => {
        if(err){
            console.log(err);
        } else {
            res.redirect("/recommended-links");
        }
    })
})

router.get("/:id/edit", isLoggedIn, (req, res) => {
    Category.findById(req.params.id, (err, category) => {
        if(err){
            console.log(err);
        } else {
            
            res.render("./category/edit", {category:category,header: 'Maciej Kuta | Portfolio | Polecane linki | Edytuj kategorię', currentUser: req.user, recommended:""})
        }
    })
    
})

router.put("/:id", isLoggedIn, (req, res) => {
    Category.findByIdAndUpdate(req.params.id, req.body.category, (err, updatedCategory) => {
        if(err){
            console.log(err);
        } else {
            updatedCategory.link = updatedCategory.titleEn.toLowerCase().split(' ').join('-');
            updatedCategory.save();
            res.redirect(`/recommended-links/category/${updatedCategory.link}`)
        }
    })
})

router.get("/:id/delete", isLoggedIn, (req, res) => {
    Category.findByIdAndRemove(req.params.id, (err, updatedCategory) => {
        if(err){
            console.log(err);
        } else {
            res.redirect(`/recommended-links`)
        }
    })
})

router.get("/:id", (req, res) => {
    Category.findOne({link: req.params.id}).populate("links").exec((err, category) => {
        if(err){
            console.log(err);
        } else {
            Category.find({}, (err,otherCategories) => {
                if(err){
                    console.log(err)
                } else {
                    i18n.setLocale(req.language);
                    res.render("./links/show", {otherCategories:otherCategories,category:category,lang: req.language,header: `Maciej Kuta | Portfolio | Polecane linki | ${category.titleEn}`, currentUser: req.user, recommended:""})
                }
            })
           
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