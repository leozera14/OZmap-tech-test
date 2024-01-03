import "reflect-metadata";

import * as mongoose from "mongoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import {
  pre,
  getModelForClass,
  Prop,
  Ref,
  modelOptions,
} from "@typegoose/typegoose";
import GeoLib from "../lib";

import ObjectId = mongoose.Types.ObjectId;

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
      const { lat, lng } = await GeoLib.getCoordinatesFromAddress(user.address);
      user.coordinates = [lng, lat];
    }
  }

  //Here we validate if a existent User changes his address / coordinates by the PUT Route,
  //And if it's was changed we also update the current Region referenced coordinates
  if (user.isModified("coordinates") && !user.isNew) {
    const newCoordinates = user.coordinates;

    // Update all regions associated with this user
    await RegionModel.updateMany(
      { _id: { $in: user.regions } },
      { $set: { coordinates: newCoordinates } }
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

  if (region.isNew) {
    const user = await UserModel.findOne({ _id: region.user });

    user.regions.push(region._id);

    await user.save({ session: region.$session() });
  }

  if (region.isModified("coordinates") && !region.isNew) {
    const user = await UserModel.findById(region.user);

    if (!user) {
      throw new Error("Associated user not found");
    }

    // Update the user's coordinates
    user.coordinates = region.coordinates;
    await user.save();
  }

  next(region.validateSync());
})
@modelOptions({ schemaOptions: { validateBeforeSave: false } })
export class Region extends Base {
  @Prop({ required: true, auto: true })
  _id: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, type: () => [Number] })
  coordinates: [number, number];

  @Prop({ ref: () => User, required: true, type: () => String })
  user: Ref<User>;
}

export const UserModel = getModelForClass(User);
export const RegionModel = getModelForClass(Region);
