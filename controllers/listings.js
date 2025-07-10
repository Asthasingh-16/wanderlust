const Listing = require("../models/listing");
const axios = require('axios');

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  try {
    const location = req.body.listing.location;

    // 🧭 Geocode the location using Nominatim
    const geoResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: location,
        format: "json",
        limit: 1
      },
      headers: {
        "User-Agent": "wanderlust-app" // Required by Nominatim
      }
    });

    if (!geoResponse.data.length) {
      req.flash("error", "Invalid location. Please enter a valid place.");
      return res.redirect("/listings/new");
    }

    const geoData = geoResponse.data[0];

    // 📸 Image and Listing
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // 🗺️ Store geometry as GeoJSON format
    newListing.geometry = {
      type: "Point",
      coordinates: [parseFloat(geoData.lon), parseFloat(geoData.lat)]
    };

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
    
  } catch (err) {
    next(err); // Send error to error handler
  }
};


module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // Update fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    // Geocode the new location
    const geoResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: listing.location,
        format: "json",
        limit: 1
      },
      headers: {
        "User-Agent": "wanderlust-app"
      }
    });

    if (geoResponse.data.length > 0) {
      const geoData = geoResponse.data[0];
      listing.geometry = {
        type: "Point",
        coordinates: [parseFloat(geoData.lon), parseFloat(geoData.lat)]
      };
    }

    // Update image if new image uploaded
    if (typeof req.file !== "undefined") {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};


module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
