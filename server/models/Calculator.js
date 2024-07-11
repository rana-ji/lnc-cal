import { ObjectId } from "bson";
import mongoose from "mongoose";

const { Schema } = mongoose;

const priceSchema = new Schema(
  {
    store: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    pricing: {
      type: [
        {
          _id: {
            type: ObjectId,
          },
          area: {
            type: String,
            required: true,
          },
          extra: {
            type: String,
            required: true,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

export const Price = mongoose.model("Price", priceSchema);

const paperSchema = new Schema(
  {
    store: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    pricing: {
      type: [
        {
          _id: {
            type: ObjectId,
          },
          type: {
            type: String,
            required: true,
          },
          price: {
            type: String,
            required: true,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

export const Paper = mongoose.model("Paper", paperSchema);

const calculatorSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    store: {
      type: String,
      required: true,
    },
    tag: {
      type : String,
      required: true
    },
    price: {
      type: Schema.Types.ObjectId,
      ref: "Price",
    },
    paper: {
      type: Schema.Types.ObjectId,
      ref: "Paper",
    },
    products: {
      type: [String],
    },
    minMaxWidth: {
      min: {
        type: Number,
        required: true,
        default: 0,
      },
      max: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    minMaxHeight: {
      min: {
        type: Number,
        required: true,
        default: 0,
      },
      max: {
        type: Number,
        required: true,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

export const Calculator = mongoose.model("Calculator", calculatorSchema);
