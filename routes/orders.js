const express = require("express"),
    Order = require("../models/orders"),
    app = express(),
    methodOverride = require("method-override"),
    i18n = require("i18n"),
    flash = require("connect-flash"),
    router = express.Router();


app.use(flash());
app.use(methodOverride("_method"));

router.get("/new", (req, res) => {
    Order.find({}, (err, orders) => {
        if(err){
            console.log(err)
        } else {
            i18n.setLocale(req.language);
            res.render("./orders/new", {orders:orders,header: `Maciej Kuta | Portfolio | Zamów stronę`, currentUser: req.user})
        }
    })
    
        
});

router.get("/description", (req, res) => {
    Order.find({}, (err, orders) => {
        if(err){
            console.log(err)
        } else {
            i18n.setLocale(req.language);
            let header = 'Maciej Kuta | Portfolio | Zamówienia stron | Opis';
            res.render("./orders/description", {orders:orders, currentUser: req.user, header:header})
        }
    })
    
});

router.get("/", isLoggedIn, (req, res) => {
    Order.find({}, (err, orders) => {
        if(err){
            console.log(err)
        } else {
            let header = 'Maciej Kuta | Portfolio | Zamówienia stron';
            res.render("./orders/index", {orders:orders, currentUser: req.user, header:header})
        }
    })
})

router.post("/", (req, res) => {
    if(req.body.type === "new"){
        let newOrder = new Order({
            name: req.body.nameN,
            email: req.body.emailN,
            whatYouWish: req.body.whatYouWishN,
            status: "Zamówienie wysłane do mnie",
            statusEn: "Order has been sent to me",
            type: req.body.type,
            websiteTitle: req.body.websiteTitleN
        })
        Order.create(newOrder, (err, createdOrder) => {
            if(err){
                console.log(err)
            } else {
                req.flash("success", i18n.__("Zamówienie zostało pomyślnie wysłane"))
                res.redirect(`/website-orders/description`)
                   
                
            }
        })
    } else {
        let newOrder = new Order({
            name: req.body.name,
            email: req.body.email,
            whatYouWish: req.body.whatYouWish,
            previousWebsite: req.body.previousWebsite,
            status: "Zamówienie wysłane do mnie",
            statusEn: "Order has been sent to me",
            type: req.body.type,
            websiteTitle: req.body.websiteTitle
        })
        Order.create(newOrder, (err, createdOrder) => {
            if(err){
                console.log(err)
            } else {
                req.flash("success", "Zamówienie zostało pomyślnie wysłane")
                res.redirect(`/website-orders/description`)
                   
                
            }
        })
    }
    
    
})

router.get("/check-status", (req, res) => {
    Order.findOne({email: req.query.email}, (err, order) => {
        if(err){
            console.log(err);
        } else {
            i18n.setLocale(req.language);
            let header = "Maciej Kuta | Portfolio | Zamówienia | Sprawdż status"
            res.render("./orders/checkStatus", { lang: req.language,header:header, order:order, currentUser: req.user, orders:""})
        }
    })
})

router.get("/:order_id/edit", isLoggedIn, (req, res) => {
    Order.findById(req.params.order_id, (err, order) => {
        if(err){
            console.log(err);
        } else {
            res.render("./orders/edit", {order:order,header: `Maciej Kuta | Portfolio | Zamów stronę internetową | Edytowanie zamówienia`, currentUser: req.user, orders:""})
        }
    })
})

router.put("/:order_id", isLoggedIn, (req, res) => {
    Order.findByIdAndUpdate(req.params.order_id, req.body.order, (err, updatedOrder) => {
        if(err){
            console.log(err);
        } else {
            res.redirect(`/website-orders`)
        }
    })
})

router.get("/:order_id/delete", isLoggedIn, (req, res) => {
    Order.findByIdAndRemove(req.params.order_id, (err, deletedorder) => {
        if(err){
            console.log(err);
        } else {
            res.redirect(`/website-orders`)
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