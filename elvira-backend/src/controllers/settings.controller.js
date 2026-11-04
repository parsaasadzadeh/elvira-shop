const asyncHandler = require("../utils/asyncHandler");
const settings = require("../config/settings");

// فقط مقادیری که امن است عمومی شوند (بدون هیچ secret)
const getPublicSettings = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    settings: {
      shippingPrice: settings.shippingPrice,
      freeShippingThreshold: settings.freeShippingThreshold,
      maxQtyPerItem: settings.maxQtyPerItem,
      maxItemsPerOrder: settings.maxItemsPerOrder,
    },
  });
});

module.exports = { getPublicSettings };
