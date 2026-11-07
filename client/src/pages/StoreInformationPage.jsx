import PageContainer from "../components/PageContainer";
import PageIntro from "../components/PageIntro";
import StatusPanel from "../components/StatusPanel";
import { ApplePayIcon, ContactlessIcon, MasterCardIcon, VisaCardIcon } from "../components/PaymentIcons";
import { useStoreContent } from "../context/StoreContext";

function AddressBlock({ store }) {
  if (!store.addressLines.length && !store.postcode)
    return (
      <StatusPanel title="Fictional sample address">
        This address is demonstration data only. It is not a verified business
        address and directions have not been checked.
      </StatusPanel>
    );
  return (
    <address>
      <p className="field__hint">Fictional sample address</p>
      <ul className="address-list">
        {store.addressLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
        {store.postcode && <li>{store.postcode}</li>}
      </ul>
      {store.directionsUrl && (
        <a
          className="button button--outline"
          href={store.directionsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Get directions
        </a>
      )}
    </address>
  );
}

export default function StoreInformationPage() {
  const { store, hours } = useStoreContent();
  const hasHours = hours.openingHours.length > 0;
  const displayHours = groupHours(hours.openingHours);
  return (
    <>
      <PageIntro eyebrow="Plan a visit" title="Store information">
        Example address, opening hours, holiday hours, and contact details for
        the fictional Deepak Supermarket demonstration.
      </PageIntro>
      <section className="page-section page-section--white">
        <PageContainer>
          <div className="info-grid">
            <div className="info-card">
              <h2>Address</h2>
              <AddressBlock store={store} />
            </div>
            <div className="info-card">
              <h2>Opening hours</h2>
              {hasHours ? (
                <ul className="details-list">
                  {displayHours.map((item) => (
                    <li key={item.day}>
                      <strong>
                        {item.day[0].toUpperCase() + item.day.slice(1)}
                      </strong>
                      <span>
                        {item.closed
                          ? "Closed"
                          : `${formatTime(item.openTime)} – ${formatTime(item.closeTime)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <StatusPanel>
                  Opening hours will be shown here when configured. No open or
                  closed status is being inferred.
                </StatusPanel>
              )}
            </div>
            <div className="info-card">
              <h2>Holiday hours</h2>
              {hours.exceptions.length ? (
                <ul className="details-list">
                  {hours.exceptions.map((item) => (
                    <li key={item.date}>
                      <strong>{item.date}</strong>
                      <span>
                        {item.closed
                          ? "Closed"
                          : `${item.openTime} – ${item.closeTime}`}{" "}
                        {item.note}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <StatusPanel>
                  Holiday hours and special closures will be listed here when
                  confirmed.
                </StatusPanel>
              )}
            </div>
            <div className="info-card">
              <h2>Contact</h2>
              {store.phone || store.email ? (
                <ul className="details-list">
                  {store.phone && (
                    <li>
                      <strong>Telephone (demonstration)</strong>
                      <span>{store.phone}</span>
                    </li>
                  )}
                  {store.email && (
                    <li>
                      <strong>Email (demonstration)</strong>
                      <span>{store.email}</span>
                    </li>
                  )}
                </ul>
              ) : (
                <StatusPanel>
                  Telephone and email details will be shown here when
                  configured.
                </StatusPanel>
              )}
            </div>
            <div className="info-card">
              <h2>Directions</h2>
              {store.directionsUrl ? (
                <a
                  className="link-arrow"
                  href={store.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open directions
                </a>
              ) : (
                <StatusPanel title="No verified directions">
                  A map is not embedded and directions have not been verified
                  for this fictional address.
                </StatusPanel>
              )}
            </div>
            <div className="info-card">
              <h2>Accessibility</h2>
              {store.accessibility ? (
                <p>{store.accessibility}</p>
              ) : (
                <StatusPanel>
                  Accessibility information will be added after the store has
                  confirmed the facilities and route details.
                </StatusPanel>
              )}
            </div>
            <div className="info-card info-card--payment">
              <h2>Payment methods</h2>
              <ul className="details-list">
                <li>
                  <strong>In-store accepted</strong>
                  <span>Cash, UK Debit & Credit cards, Contactless</span>
                </li>
                <li>
                  <strong>Visa & Mastercard</strong>
                  <span>UK & International credit and debit cards — contactless & chip</span>
                </li>
                <li>
                  <strong>Apple Pay</strong>
                  <span>Express mobile contactless — integrating soon</span>
                </li>
              </ul>
              <div className="store-payment-badges">
                <span className="store-payment-badge">
                  <VisaCardIcon size="compact" />
                  <span className="store-payment-badge__label">Visa</span>
                </span>
                <span className="store-payment-badge">
                  <MasterCardIcon size="compact" />
                  <span className="store-payment-badge__label">Mastercard</span>
                </span>
                <span className="store-payment-badge">
                  <ApplePayIcon size="compact" />
                  <span className="store-payment-badge__label">Apple Pay</span>
                  <span className="tag-soon-sm">Soon</span>
                </span>
                <span className="store-payment-badge">
                  <ContactlessIcon size={18} />
                  <span className="store-payment-badge__label">Contactless</span>
                </span>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}

function groupHours(items) {
  if (
    items.length === 7 &&
    items
      .slice(0, 6)
      .every(
        (item) =>
          !item.closed &&
          item.openTime === items[0].openTime &&
          item.closeTime === items[0].closeTime,
      )
  ) {
    return [
      { ...items[0], day: "Monday–Saturday" },
      { ...items[6], day: "Sunday" },
    ];
  }
  return items.map((item) => ({
    ...item,
    day: item.day[0].toUpperCase() + item.day.slice(1),
  }));
}

function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
}
