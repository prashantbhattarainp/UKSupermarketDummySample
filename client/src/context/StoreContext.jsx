import { createContext, useContext, useEffect, useState } from "react";

import { storeConfig } from "../data/storeConfig";
import { fetchStoreContent } from "../services/storeApi";

const fallback = {
  store: {
    name: storeConfig.name,
    descriptor: storeConfig.descriptor,
    strapline: storeConfig.strapline,
    about: storeConfig.about.paragraphs.join("\n\n"),
    addressLines: storeConfig.address.lines,
    postcode: storeConfig.address.postcode,
    phone: storeConfig.contact.phone,
    email: storeConfig.contact.email,
    directionsUrl: storeConfig.directionsUrl,
    accessibility: storeConfig.accessibility,
    published: true,
  },
  hours: { openingHours: [], exceptions: [] },
  services: [],
};

const StoreContext = createContext(null);

function fallbackHours() {
  return {
    openingHours: [
      { day: "monday", closed: false, openTime: "08:00", closeTime: "21:00" },
      { day: "tuesday", closed: false, openTime: "08:00", closeTime: "21:00" },
      {
        day: "wednesday",
        closed: false,
        openTime: "08:00",
        closeTime: "21:00",
      },
      { day: "thursday", closed: false, openTime: "08:00", closeTime: "21:00" },
      { day: "friday", closed: false, openTime: "08:00", closeTime: "21:00" },
      { day: "saturday", closed: false, openTime: "08:00", closeTime: "21:00" },
      { day: "sunday", closed: false, openTime: "09:00", closeTime: "18:00" },
    ],
    exceptions: storeConfig.holidayHours.map((item) => ({
      date: item.date,
      closed: true,
      note: item.hours,
    })),
  };
}

export function StoreProvider({ children }) {
  const [content, setContent] = useState({
    ...fallback,
    hours: fallbackHours(),
  });
  const [sourceError, setSourceError] = useState("");

  useEffect(() => {
    let active = true;
    fetchStoreContent()
      .then((next) => {
        if (active) {
          setContent(next);
          setSourceError("");
        }
      })
      .catch((error) => {
        if (active) setSourceError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <StoreContext.Provider value={{ ...content, sourceError }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContent() {
  const value = useContext(StoreContext);
  if (!value)
    throw new Error("useStoreContent must be used inside StoreProvider.");
  return value;
}
