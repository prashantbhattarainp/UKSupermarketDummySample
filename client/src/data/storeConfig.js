export const storeConfig = {
  name: "Deepak Supermarket",
  descriptor: "Your Neighbourhood Grocery Store",
  strapline: "A welcoming place for the everyday grocery shop.",
  demoNotice: "Demo Store — Sample Information",
  address: {
    lines: ["125 High Street", "Hounslow", "London"],
    postcode: "TW3 1QL",
  },
  contact: {
    phone: "020 7946 0123",
    email: "hello@deepaksupermarket.example",
  },
  directionsUrl: "",
  openingHours: [
    { day: "Monday–Saturday", hours: "8:00 AM – 9:00 PM" },
    { day: "Sunday", hours: "9:00 AM – 6:00 PM" },
  ],
  holidayHours: [
    { date: "Christmas Day", hours: "Closed" },
    { date: "New Year's Day", hours: "10:00 AM – 4:00 PM" },
  ],
  accessibility: "",
  about: {
    eyebrow: "About the demonstration store",
    title: "A useful local grocery shop, shaped around everyday routines.",
    paragraphs: [
      "Deepak Supermarket is a fictional neighbourhood grocery store concept for demonstrating this reusable website template.",
      "The example site is designed to make everyday grocery shopping information easy to explore, from store details and opening hours to future grocery categories and products.",
    ],
  },
  faqs: [
    {
      question: "Are these store details real?",
      answer:
        "No. The address, opening hours, telephone number, and email address on this website are fictional sample information for demonstration purposes.",
    },
    {
      question: "What can I explore on this website?",
      answer:
        "You can explore the example store information and the planned grocery categories. The product catalogue will be implemented in a later phase.",
    },
    {
      question: "Does the website take online orders or payments?",
      answer:
        "In store, we accept cash, UK debit/credit cards (Visa and Mastercard), and contactless. Online checkout with Visa, Mastercard, and Apple Pay express payment will be integrated in an upcoming release.",
    },
    {
      question: "Can I contact the supermarket?",
      answer:
        "The contact form is presented for layout review in this development version. It does not send or store messages yet, and the contact details are fictional examples.",
    },
  ],
  privacyDraft: {
    reviewedLabel: "Draft for owner and legal review",
    sections: [
      [
        "Information collected",
        "The final policy should describe the information collected through the site and distinguish optional information from information needed for a specific request. Confirm this before launch.",
      ],
      [
        "How information is used",
        "The owner should confirm why information is used, who can access it, and which lawful basis applies to each purpose.",
      ],
      [
        "Cookies and analytics",
        "No analytics or non-essential cookies are configured in this frontend foundation. Confirm any future tools and consent requirements before adding them.",
      ],
      [
        "Data retention",
        "Retention periods for enquiries and other submissions have not been decided. Confirm them with the owner and legal adviser.",
      ],
      [
        "Data sharing",
        "Confirm whether any service providers, hosting partners, or email providers will receive personal information before publication.",
      ],
      [
        "Your rights and contact details",
        "Add the confirmed privacy contact and the process for access, correction, deletion, and other applicable rights before launch.",
      ],
    ],
  },
};

export function hasAddress(address) {
  return address.lines.length > 0 || Boolean(address.postcode);
}

export function hasContact(contact) {
  return Boolean(contact.phone || contact.email);
}
