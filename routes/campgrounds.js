var express         = require("express");
var router          = express.Router();
var Campground      = require("../models/campground");
var middleware      = require("../middleware");

//index route
router.get("/", function(req, res){
   //get all campgrounds from db
   Campground.find({}, function(err, allCampgrounds){
      if(err){
        console.log("Error");
        console.log(err);
    } else {
        res.render("campgrounds/index", {campgrounds: allCampgrounds});
    } 
   });
});

//create route
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//new route
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to campground array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, image: image, price: price, description: desc, author: author};
    
    //create a new campground and save to db
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
        console.log("Error");
        console.log(err);
    } else {
           //redirect back to campgrounds page
        res.redirect("/campgrounds");
    } 
    });
});


//Show route
router.get("/:id", function(req, res){
    //find campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found!");
            res.redirect("back");
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }  
    });
});

//edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err,foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
                
});

//show campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //find and update correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
      if(err) {
          req.flash("error", "Unable to update campground!");
          res.redirect("/campgrounds");
      } else {
          req.flash("success", "Campground has been updated!");
          res.redirect("/campgrounds/" + req.params.id);
      } 
    });
    //redirect show page
});

//destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
            req.flash("error", "Unable to delete campground!");
            res.redirect("/campgrounds");
       } else {
           req.flash("success", "Campground has been deleted!");
           res.redirect("/campgrounds");
       }
   });
});

module.exports = router;