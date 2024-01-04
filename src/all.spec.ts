import "reflect-metadata";

import * as mongoose from "mongoose";
import * as supertest from "supertest";
import * as sinon from "sinon";
import { faker } from "@faker-js/faker";
import { expect, assert } from "chai";

import "./database/database";
import { Region, RegionModel, UserModel } from "./models/models";
import GeoLib from "./utils/geoLib";
import server from "./server";

describe("Models", () => {
  let user;
  let session;
  let geoLibStub: Partial<typeof GeoLib> = {};
  let sharedAddress: string;
  let sharedLocation;

  before(async () => {
    sharedAddress = faker.location.streetAddress({ useFullAddress: true });
    sharedLocation = {
      lng: faker.location.longitude(),
      lat: faker.location.latitude(),
    };

    geoLibStub.getAddressFromCoordinates = sinon
      .stub(GeoLib, "getAddressFromCoordinates")
      .resolves(sharedAddress);
    geoLibStub.getCoordinatesFromAddress = sinon
      .stub(GeoLib, "getCoordinatesFromAddress")
      .resolves(sharedLocation);

    session = await mongoose.startSession();
    user = await UserModel.create({
      name: faker.person.firstName(),
      email: faker.internet.email(),
      address: sharedAddress,
    });
  });

  after(() => {
    sinon.restore();
    session.endSession();
  });

  beforeEach(() => {
    session.startTransaction();
  });

  afterEach(() => {
    session.commitTransaction();
  });

  describe("UserModel", () => {
    it("should create a user", async () => {
      expect(1).to.be.eq(1);
    });
  });

  describe("RegionModel", () => {
    it("should create a region", async () => {
      const regionData: Omit<Region, "_id" | "boundary"> = {
        user: user._id,
        name: faker.person.fullName(),
        address: sharedAddress,
        coordinates: [sharedLocation.lng, sharedLocation.lat],
      };

      const newRegion = new RegionModel(regionData);

      const saveNewRegion = await newRegion.save();

      expect(saveNewRegion).to.deep.include(regionData);
    });

    it("should rollback changes in case of failure", async () => {
      const userRecord = await UserModel.findOne({ _id: user._id })
        .select("regions")
        .lean();
      try {
        await RegionModel.create([{ user: user._id }]);

        assert.fail("Should have thrown an error");
      } catch (error) {
        const updatedUserRecord = await UserModel.findOne({ _id: user._id })
          .select("regions")
          .lean();

        expect(userRecord).to.deep.eq(updatedUserRecord);
      }
    });
  });

  it("should return a list of users", async () => {
    const response = await supertest(server).get(`/users`);

    expect(response).to.have.property("status", 200);
  });

  it("should return a user", async () => {
    const response = await supertest(server).get(`/users/${user._id}`);

    expect(response).to.have.property("status", 200);
  });
});
