import "reflect-metadata";

import * as mongoose from "mongoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import {
  pre,
  getModelForClass,
  Prop,
  Ref,
  modelOptions,
  index,
  Severity,
} from "@typegoose/typegoose";
import GeoLib from "../utils/lib";

import ObjectId = mongoose.Types.ObjectId;
import { calculateCircularBoundary } from "../utils/calculateBoundary";
import { BOUNDARY_NUM_SIDES, BOUNDARY_RADIUS_IN_METERS } from "../constants";

class Base extends TimeStamps {
  @Prop({ required: true, default: () => new ObjectId().toString() })
  _id: string;
}

@pre<User>("save", async function (next) {
  const user = this as Omit<any, keyof User> & User;

  if (user.isModified("address") || user.isModified("coordinates")) {
    if (!user.isModified("coordinates") && !user.isModified("address")) {
      throw new Error(
        "You need to give your address or coordinates. Try again with the correct payload!"
      );
    }

    if (user.isModified("coordinates") && user.isModified("address")) {
      throw new Error(
        "Only address or coordinates should be provided, not both. Try again with the correct payload!"
      );
    }

    if (user.isModified("coordinates")) {
      user.address = await GeoLib.getAddressFromCoordinates(user.coordinates);
    } else if (user.isModified("address")) {
      const { lng, lat } = await GeoLib.getCoordinatesFromAddress(user.address);
      user.coordinates = [lng, lat];
    }

    //Here we validate if the Region mentioned by User already exists, if not we create
    //it and associate the User ID in Region and reverse. Also if we validate that the
    //Region already exists we only ensure that the Region ID will be in User Regions
    const existingRegion = await RegionModel.findOne({
      coordinates: user.coordinates,
    }).exec();

    if (!existingRegion) {
      const newRegion = new RegionModel({
        name: `${user.name}'s Region`,
        coordinates: user.coordinates,
        user: user._id,
      });

      await newRegion.save();

      user.regions.push(newRegion._id);
    } else {
      // If region exists, ensure the user is associated with it
      if (!user.regions.includes(existingRegion._id)) {
        user.regions.push(existingRegion._id);
      }
    }
  }

  //Here we validate if a existent User changes his address / coordinates by the PUT Route,
  //And if it's was changed we also update the current Region referenced coordinates
  if (user.isModified("coordinates") && !user.isNew) {
    const newCoordinates = user.coordinates;
    const newAddress = user.address;

    // Update all regions associated with this user
    await RegionModel.updateMany(
      { _id: { $in: user.regions } },
      { $set: { coordinates: newCoordinates, address: newAddress } }
    );
  }

  next();
})
export class User extends Base {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({
    required: function () {
      return !this.coordinates;
    },
  })
  address: string;

  @Prop({
    required: function () {
      return !this.address;
    },
    type: () => [Number],
  })
  coordinates: [number, number];

  @Prop({ required: true, default: [], ref: () => Region, type: () => String })
  regions: Ref<Region>[];
}

@pre<Region>("save", async function (next) {
  const region = this as Omit<any, keyof Region> & Region;

  if (!region.user) {
    throw new Error(
      "You need to give a valid user ID to reference this region, please try again with the correct payload!"
    );
  }

  if (!region._id) {
    region._id = new ObjectId().toString();
  }

  if (region.isModified("coordinates")) {
    region.address = await GeoLib.getAddressFromCoordinates(region.coordinates);
  }

  if (region.isModified("coordinates") && !region.isNew) {
    const user = await UserModel.findById(region.user);

    if (!user) {
      throw new Error("Associated user not found");
    }

    // Update the user's coordinates
    user.coordinates = region.coordinates;
    await user.save({ session: region.$session() });
  }

  // Calculate boundary when coordinates are modified or when a new region is created
  if (region.isModified("coordinates") || region.isNew) {
    region.boundary = {
      type: "Polygon",
      coordinates: [
        calculateCircularBoundary(
          region.coordinates,
          BOUNDARY_RADIUS_IN_METERS,
          BOUNDARY_NUM_SIDES
        ),
      ],
    };
  }

  next(region.validateSync());
})
@modelOptions({
  schemaOptions: { validateBeforeSave: false },
  options: { allowMixed: Severity.ALLOW },
})
@index({ boundary: "2dsphere" })
@index({ coordinates: "2dsphere" })
export class Region extends Base {
  @Prop({ required: true, auto: true })
  _id: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, type: () => [Number] })
  coordinates: [number, number];

  @Prop({ required: false })
  address: string;

  @Prop({ ref: () => User, required: true, type: () => String })
  user: Ref<User>;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.Mixed,
  })
  boundary: {
    type: string;
    coordinates: number[][][];
  };
}

export const UserModel = getModelForClass(User);
export const RegionModel = getModelForClass(Region);
