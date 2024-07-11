import { Price, Calculator, Paper } from "../models/Calculator.js";
import clientProvider from "../../utils/clientProvider.js";
import mongoose from "mongoose";

export const createVariant = async (req, res) => {
  console.log("URL hit");

  const { productId, price } = req.body;

  if (!productId || !price) {
    return res.status(400).json({ error: "Missing required fields: productId, price" });
  }

  try {
    const { client: graphqlClient } = await clientProvider.offline.graphqlClient({
      shop: res.locals.user_shop,
    });

    const data = await graphqlClient.request(
      `mutation productVariantCreate($input: ProductVariantInput!) {
        productVariantCreate(input: $input) {
          product {
            id
            title
          }
          
          productVariant {
            id
            title
            price
            inventoryPolicy
          }
          userErrors {
            field
            message
          }
        }
      }`,{
        variables : {
          "input": {
            "price": price,
            "inventoryPolicy": "CONTINUE",
            "productId": `gid://shopify/Product/${productId}`,
            "options": `cal-${new mongoose.Types.ObjectId().toString()}`
          }
        }
      }
    )

    if (data.errors) {
      return res.status(500).json({ error: "Failed to create variant" });
    }
    var fullid = data.data.productVariantCreate.productVariant.id.split("/ProductVariant/")[1]

    res.status(201).json(fullid);
  } catch (err) {
    console.error("Error creating variant:", err);
    res.status(500).json({ error: err.message });
  }
};

export const returnPrices = async (req, res) => {
  let { productId } = req.body;
  console.log(productId, "here get price");

  try {
    const { client } = await clientProvider.offline.graphqlClient({
      shop: res.locals.user_shop,
    });
    const store = client.session.shop;

    // Getting list of all calculators related to store
    let calculators = await Calculator.findOne({ store: store, tag: productId });

    if (!calculators) {
      return res.status(404).json({ error: "Product calculator not found" });
    }

    console.log("calculators product", calculators);

    // Getting pricings as per calculator
    const pricing = await Price.findById(calculators.price);
    const paper = await Paper.findById(calculators.paper);

    console.log("price product", pricing, paper);

    if (!pricing) {
      return res.status(404).json({ error: "Pricing not found" });
    }

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    // Sorting pricing
    const priceData = pricing.pricing.map((price) => ({
      area: price.area,
      extra: price.extra,
    }));

    const paperData = paper.pricing.map((paper) => ({
      type: paper.type,
      price: paper.price,
    }));

    console.log("price product", priceData, paperData);

    res
      .status(200)
      .json({
        price: priceData,
        calculator: calculators,
        paper: paperData,
      });
  } catch (err) {
    console.error("Error updating calculator data:", err);
    res.status(501).json({ error: err.message });
  }
};
