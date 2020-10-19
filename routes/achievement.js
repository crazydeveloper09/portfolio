const express      = require("express"),
    User           = require("../models/user"),
    app            = express(),
    methodOverride = require("method-override"),
    multer         = require("multer"),
    i18n 		   = require("i18n"),
    router         = express.Router({mergeParams: true}),
    dotenv         = require("dotenv"),
    flash = require("connect-flash");
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

    


app.use(flash());
app.use(methodOverride("_method"));

router.get("/add", isLoggedIn, (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err){
            console.log(err);
        } else {
            res.render("./user/addAchiev", {header: `Maciej Kuta | Portfolio | ${user.username} | Dodaj osiągnięcie`, currentUser: req.user, user:user})
        }
    })
})


router.post("/",upload.single("picture"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        let newAchievement = new Achievement({
            title: req.body.title,
            picture: result.secure_url
        });
        Achievement.create(newAchievement, function(err, achievement){
            if(err){
                console.log(err);
            } else {
                User.findById(req.params.id, function(err, user){
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

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", i18n.__("Nie masz dostępu do tej strony"));
    res.redirect("/");
}

module.exports = router;
