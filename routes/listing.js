const express = require("express");
const router = express.Router();
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });



const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");


router
  .route("/")
  .get( wrapAsync(listingController.index))    // Index route
  .post(                                      // create route
  isLoggedIn,
  validateListing,
  upload.single('listing[image]'),
  wrapAsync(listingController.createListing)
);
 



// new route
router.get("/new", isLoggedIn,listingController.renderNewForm );

  

router
  .route("/:id")
  .get(             // show route
  wrapAsync(listingController.showListing)
)
  .put(             // update route
  isLoggedIn,
  isOwner,
  upload.single('listing[image]'),
  validateListing,
  wrapAsync(listingController.updateListing)
)
  .delete(            // delete route
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);




// // edit route

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);



module.exports = router;
