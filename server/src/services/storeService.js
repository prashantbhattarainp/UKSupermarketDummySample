import mongoose from "mongoose";

import { Service } from "../models/Service.js";
import { StoreSettings } from "../models/StoreSettings.js";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const defaultHours = days.map((day) => ({
  day,
  closed: false,
  openTime: "08:00",
  closeTime: "18:00",
}));

function error(code, message, statusCode = 400, fieldErrors = {}) {
  return Object.assign(new Error(message), {
    code,
    message,
    statusCode,
    fieldErrors,
  });
}
function text(value, field, max, required = false) {
  if (value === undefined && !required) return undefined;
  if (
    typeof value !== "string" ||
    (required && !value.trim()) ||
    value.trim().length > max
  )
    throw error("INVALID_INPUT", `${field} is invalid.`, 400, {
      [field]: `${field} is invalid.`,
    });
  return value.trim();
}
function bool(value, field) {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean")
    throw error("INVALID_INPUT", `${field} must be a boolean.`, 400, {
      [field]: `${field} must be a boolean.`,
    });
  return value;
}
function validateHours(items) {
  if (
    !Array.isArray(items) ||
    items.length !== 7 ||
    new Set(items.map((item) => item.day)).size !== 7 ||
    days.some((day) => !items.some((item) => item.day === day))
  )
    throw error(
      "INVALID_HOURS",
      "Provide exactly one entry for each day of the week.",
    );
  return items.map((item) => {
    if (typeof item.closed !== "boolean")
      throw error(
        "INVALID_HOURS",
        `Closed status for ${item.day} must be boolean.`,
      );
    if (
      !item.closed &&
      (!timePattern.test(item.openTime) ||
        !timePattern.test(item.closeTime) ||
        item.closeTime <= item.openTime)
    )
      throw error(
        "INVALID_HOURS",
        `Opening times for ${item.day} are invalid.`,
      );
    return {
      day: item.day,
      closed: item.closed,
      openTime: item.closed ? "" : item.openTime,
      closeTime: item.closed ? "" : item.closeTime,
    };
  });
}
function validateExceptions(items = []) {
  if (!Array.isArray(items))
    throw error("INVALID_EXCEPTIONS", "Exceptions must be an array.");
  const seen = new Set();
  return items.map((item) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || seen.has(item.date))
      throw error(
        "INVALID_EXCEPTION",
        "Exception dates must be unique YYYY-MM-DD values.",
      );
    seen.add(item.date);
    if (
      !item.closed &&
      (!timePattern.test(item.openTime) ||
        !timePattern.test(item.closeTime) ||
        item.closeTime <= item.openTime)
    )
      throw error(
        "INVALID_EXCEPTION",
        `Exception times for ${item.date} are invalid.`,
      );
    return {
      date: item.date,
      closed: Boolean(item.closed),
      openTime: item.closed ? "" : item.openTime,
      closeTime: item.closed ? "" : item.closeTime,
      note: text(item.note || "", "note", 240),
    };
  });
}
function payload(record) {
  const value = record?.toObject ? record.toObject() : record;
  return {
    id: value?._id?.toString(),
    name: value?.name,
    descriptor: value?.descriptor,
    strapline: value?.strapline,
    about: value?.about,
    addressLines: value?.addressLines || [],
    postcode: value?.postcode || "",
    phone: value?.phone || "",
    email: value?.email || "",
    directionsUrl: value?.directionsUrl || "",
    accessibility: value?.accessibility || "",
    published: value?.published !== false,
    openingHours: value?.openingHours || [],
    exceptions: value?.exceptions || [],
    createdAt: value?.createdAt,
    updatedAt: value?.updatedAt,
  };
}
function servicePayload(record) {
  const value = record?.toObject ? record.toObject() : record;
  return {
    id: value?._id?.toString() || value?.id,
    name: value?.name,
    slug: value?.slug,
    description: value?.description,
    image: value?.image || "",
    displayOrder: value?.displayOrder || 0,
    active: value?.active !== false,
    createdAt: value?.createdAt,
    updatedAt: value?.updatedAt,
  };
}

export function createStoreService({
  StoreModel = StoreSettings,
  ServiceModel = Service,
} = {}) {
  async function getRecord() {
    return StoreModel.findOne({ key: "default" });
  }
  function settingsInput(body = {}) {
    const allowed = new Set([
      "name",
      "descriptor",
      "strapline",
      "about",
      "addressLines",
      "postcode",
      "phone",
      "email",
      "directionsUrl",
      "accessibility",
      "published",
    ]);
    if (Object.keys(body).some((key) => !allowed.has(key)))
      throw error("INVALID_INPUT", "Unexpected store fields are not allowed.");
    if (!Array.isArray(body.addressLines))
      throw error("INVALID_INPUT", "Address lines must be an array.");
    return {
      name: text(body.name, "name", 160, true),
      descriptor: text(body.descriptor || "", "descriptor", 160),
      strapline: text(body.strapline || "", "strapline", 240),
      about: text(body.about || "", "about", 4000),
      addressLines: body.addressLines.map((line) =>
        text(line, "addressLines", 160),
      ),
      postcode: text(body.postcode || "", "postcode", 20),
      phone: text(body.phone || "", "phone", 40),
      email: text(body.email || "", "email", 160),
      directionsUrl: text(body.directionsUrl || "", "directionsUrl", 500),
      accessibility: text(body.accessibility || "", "accessibility", 1000),
      published: bool(body.published, "published") ?? true,
    };
  }
  async function getPublic() {
    const record = await getRecord();
    return record && record.published !== false ? payload(record) : null;
  }
  async function getOwner() {
    const record = await getRecord();
    return record
      ? payload(record)
      : payload({
          ...settingsInput({ name: "Deepak Supermarket", addressLines: [] }),
          openingHours: defaultHours,
          exceptions: [],
        });
  }
  async function update(body) {
    const input = settingsInput(body);
    const record = await StoreModel.findOneAndUpdate(
      { key: "default" },
      { ...input, key: "default" },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );
    return payload(record);
  }
  async function getHours() {
    const record = await getRecord();
    return {
      openingHours: record?.openingHours?.length
        ? record.openingHours
        : defaultHours,
      exceptions: record?.exceptions || [],
    };
  }
  async function updateHours(body) {
    const openingHours = validateHours(body.openingHours);
    const exceptions = validateExceptions(body.exceptions);
    const record = await StoreModel.findOneAndUpdate(
      { key: "default" },
      {
        $set: { key: "default", openingHours, exceptions },
        $setOnInsert: { name: "Deepak Supermarket" },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );
    return { openingHours: record.openingHours, exceptions: record.exceptions };
  }
  async function listServices(publicOnly = false) {
    const records = await ServiceModel.find(publicOnly ? { active: true } : {})
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    return records.map(servicePayload);
  }
  async function getService(id) {
    if (!mongoose.isValidObjectId(id))
      throw error("INVALID_IDENTIFIER", "id must be a valid identifier.");
    const record = await ServiceModel.findById(id).lean();
    if (!record) throw error("SERVICE_NOT_FOUND", "Service not found.", 404);
    return servicePayload(record);
  }
  function serviceInput(body = {}, partial = false) {
    const allowed = new Set([
      "name",
      "slug",
      "description",
      "image",
      "displayOrder",
      "active",
    ]);
    if (Object.keys(body).some((key) => !allowed.has(key)))
      throw error(
        "INVALID_INPUT",
        "Unexpected service fields are not allowed.",
      );
    const input = {};
    if (!partial || body.name !== undefined)
      input.name = text(body.name, "name", 160, true);
    if (!partial || body.slug !== undefined) {
      input.slug = text(body.slug, "slug", 120, true);
      if (!slugPattern.test(input.slug))
        throw error("INVALID_SLUG", "Slug must use lowercase kebab-case.");
    }
    if (!partial || body.description !== undefined)
      input.description = text(body.description, "description", 1000, true);
    if (body.image !== undefined) input.image = text(body.image, "image", 500);
    if (body.displayOrder !== undefined) {
      if (!Number.isInteger(body.displayOrder) || body.displayOrder < 0)
        throw error(
          "INVALID_INPUT",
          "Display order must be a non-negative integer.",
        );
      input.displayOrder = body.displayOrder;
    }
    if (body.active !== undefined) input.active = bool(body.active, "active");
    return input;
  }
  async function createService(body) {
    try {
      return servicePayload(await ServiceModel.create(serviceInput(body)));
    } catch (err) {
      if (err.code === 11000)
        throw error(
          "DUPLICATE_SLUG",
          "A service with that slug already exists.",
          409,
        );
      throw err;
    }
  }
  async function updateService(id, body) {
    if (!mongoose.isValidObjectId(id))
      throw error("INVALID_IDENTIFIER", "id must be a valid identifier.");
    try {
      const record = await ServiceModel.findByIdAndUpdate(
        id,
        serviceInput(body, true),
        { new: true, runValidators: true },
      ).lean();
      if (!record) throw error("SERVICE_NOT_FOUND", "Service not found.", 404);
      return servicePayload(record);
    } catch (err) {
      if (err.code === 11000)
        throw error(
          "DUPLICATE_SLUG",
          "A service with that slug already exists.",
          409,
        );
      throw err;
    }
  }
  async function deactivateService(id) {
    if (!mongoose.isValidObjectId(id))
      throw error("INVALID_IDENTIFIER", "id must be a valid identifier.");
    const record = await ServiceModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true },
    ).lean();
    if (!record) throw error("SERVICE_NOT_FOUND", "Service not found.", 404);
    return servicePayload(record);
  }
  return {
    getPublic,
    getOwner,
    update,
    getHours,
    updateHours,
    listServices,
    getService,
    createService,
    updateService,
    deactivateService,
  };
}
