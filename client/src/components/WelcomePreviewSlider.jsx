import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    id: "welcome",
    eyebrow: "Warm Community Welcome",
    title: "Welcome to Deepak Supermarket",
    subtitle: "A local grocery store built for fresh routines, everyday quality, and friendly service.",
    description:
      "Step into Deepak Supermarket — your neighbourhood destination for crisp farm-fresh produce, authentic bakery treats, kitchen staples, and pantry essentials. We are proud to serve our community with honest prices and genuine warmth.",
    highlights: ["Fresh Produce Daily", "Everyday Honest Value", "Warm Neighbourhood Service"],
    actionPrimary: { text: "Explore Groceries", to: "/products" },
    actionSecondary: { text: "Visit The Shop", to: "/visit" },
    badgeText: "✨ Deepak Supermarket",
    badgeSubtext: "Open 7 Days a Week",
  },
  {
    id: "meet-deepak",
    eyebrow: "From The Founder",
    title: "Welcome from Deepak & The Team",
    subtitle: "Locally rooted, warmly run — made for the people and families around us.",
    description:
      "“At Deepak Supermarket, we believe grocery shopping should feel easy, welcoming, and personal. Whether you are picking up tonight's dinner or restocking pantry essentials, our friendly team is always here with a warm smile.”",
    highlights: ["Independent & Family-Run", "Hand-Selected Aisles", "Personal Customer Care"],
    actionPrimary: { text: "Read About Our Story", to: "/about" },
    actionSecondary: { text: "Customer Reviews", to: "/reviews" },
    badgeText: "👋 Meet Deepak",
    badgeSubtext: "Founder & Store Host",
  },
  {
    id: "groceries",
    eyebrow: "Everyday Quality",
    title: "Fresh, Local & Made for Real Routines",
    subtitle: "Hand-picked vegetables, seasonal fruits, organic selections, and household necessities.",
    description:
      "From morning milk and artisanal breads to evening cooking spices and home care goods, our shelves are curated with care so you can find everything your household needs under one roof.",
    highlights: ["Farm-to-Shelf Freshness", "Wide Specialty Selection", "Special Seasonal Offers"],
    actionPrimary: { text: "View Catalogue", to: "/products" },
    actionSecondary: { text: "Check Offers", to: "/offers" },
    badgeText: "🌿 Farm Fresh & Crisp",
    badgeSubtext: "Restocked Daily",
  },
  {
    id: "feedback",
    eyebrow: "We Value Your Voice",
    title: "Suggestions, Comments & Ideas",
    subtitle: "Tell us what you'd love to see on our shelves — scan our QR code or leave online feedback.",
    description:
      "Your feedback shapes Deepak Supermarket. Scan our in-store QR code with your smartphone or submit your ideas online to help us bring your favourite brands and grocery items to the store.",
    highlights: ["In-Store QR Code Ready", "Direct Response to Requests", "Community Feedback Welcome"],
    actionPrimary: { text: "Give Feedback & Suggestions", to: "/feedback" },
    actionSecondary: { text: "Scan QR Code", to: "/feedback" },
    badgeText: "📱 Scan QR in Store",
    badgeSubtext: "Feedback & Ideas",
  },
];

export default function WelcomePreviewSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideDirection, setSlideDirection] = useState("next");
  const slideCount = slides.length;
  const timerRef = useRef(null);

  // Auto sliding animation every 5.5 seconds, paused on hover
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setSlideDirection("next");
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slideCount]);

  function goToSlide(index, direction = "next") {
    setSlideDirection(direction);
    setCurrentSlide(index);
  }

  function handlePrev() {
    setSlideDirection("prev");
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  }

  function handleNext() {
    setSlideDirection("next");
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }

  const slide = slides[currentSlide];

  return (
    <section
      className="welcome-preview-slider"
      aria-label="Welcome to Deepak Supermarket Preview"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="page-container">
        <div className="welcome-slider-shell">
          {/* Main Grid: Left copy, Right sliding image preview */}
          <div className="welcome-slider-grid">
            {/* Copy Content Column with animated transition */}
            <div
              key={`copy-${currentSlide}`}
              className={`welcome-slider-copy welcome-slider-copy--${slideDirection}`}
            >
              <div className="welcome-pill-badge">
                <span className="welcome-pill-badge__dot"></span>
                <span>{slide.eyebrow}</span>
              </div>

              <h2 className="welcome-slider-title">{slide.title}</h2>
              <p className="welcome-slider-lead">{slide.subtitle}</p>
              <p className="welcome-slider-desc">{slide.description}</p>

              {/* Highlight points */}
              <ul className="welcome-slider-highlights">
                {slide.highlights.map((item, idx) => (
                  <li key={idx} className="welcome-slider-highlight-item">
                    <span className="welcome-check-icon">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Action Buttons */}
              <div className="welcome-slider-actions">
                <Link
                  className="button button--primary welcome-btn-main"
                  to={slide.actionPrimary.to}
                >
                  {slide.actionPrimary.text}
                </Link>
                <Link
                  className="button button--outline welcome-btn-secondary"
                  to={slide.actionSecondary.to}
                >
                  {slide.actionSecondary.text}
                </Link>
                <Link
                  className="welcome-qr-quicklink"
                  to="/feedback"
                  title="Scan in-store QR code for feedback"
                >
                  <img
                    src="/feedback-qr-code.png"
                    alt="Quick QR link"
                    className="welcome-qr-thumb"
                    width="28"
                    height="28"
                  />
                  <span>QR Feedback</span>
                </Link>
              </div>
            </div>

            {/* Visual Sliding Column featuring Deepak's Picture */}
            <div className="welcome-slider-visual-col">
              <div className="welcome-image-stage">
                {/* Decorative background glow & shapes */}
                <div className="welcome-stage-glow"></div>
                <div className="welcome-stage-frame">
                  {/* Sliding image container */}
                  <div
                    key={`img-${currentSlide}`}
                    className={`welcome-image-card welcome-image-card--${slideDirection}`}
                  >
                    <img
                      src="/final.JPG"
                      alt="Deepak, welcoming you to Deepak Supermarket"
                      className="welcome-main-image"
                      loading="eager"
                    />

                    {/* Gradient overlay on image */}
                    <div className="welcome-image-gradient"></div>

                    {/* Floating Glassmorphic Badge 1: Top Right */}
                    <div className="welcome-floating-badge welcome-floating-badge--top">
                      <span className="floating-badge-icon">✨</span>
                      <div>
                        <strong>{slide.badgeText}</strong>
                        <small>{slide.badgeSubtext}</small>
                      </div>
                    </div>

                    {/* Floating Glassmorphic Badge 2: Bottom Overlay Banner */}
                    <div className="welcome-floating-badge welcome-floating-badge--bottom">
                      <div className="badge-avatar-mini">
                        <span>DS</span>
                      </div>
                      <div>
                        <p className="floating-badge-title">Deepak Supermarket</p>
                        <p className="floating-badge-subtitle">
                          Welcome to your local shopping home
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Navigation Footer */}
          <div className="welcome-slider-controls">
            {/* Slide Dots Indicator */}
            <div className="welcome-slider-dots" role="tablist" aria-label="Slide indicators">
              {slides.map((s, index) => (
                <button
                  key={s.id}
                  type="button"
                  className={`welcome-slider-dot ${
                    index === currentSlide ? "welcome-slider-dot--active" : ""
                  }`}
                  onClick={() => goToSlide(index, index > currentSlide ? "next" : "prev")}
                  aria-label={`Go to slide ${index + 1}: ${s.title}`}
                  aria-selected={index === currentSlide}
                  role="tab"
                >
                  <span className="visually-hidden">Slide {index + 1}</span>
                </button>
              ))}
            </div>

            {/* Next / Prev Navigation Buttons */}
            <div className="welcome-slider-arrows">
              <button
                type="button"
                className="welcome-arrow-btn"
                onClick={handlePrev}
                aria-label="Previous welcome preview slide"
              >
                ‹
              </button>
              <span className="welcome-slide-counter">
                {currentSlide + 1} / {slideCount}
              </span>
              <button
                type="button"
                className="welcome-arrow-btn"
                onClick={handleNext}
                aria-label="Next welcome preview slide"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
