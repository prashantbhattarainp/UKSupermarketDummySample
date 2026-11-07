import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import SectionHeading from "../components/SectionHeading";
import StatusPanel from "../components/StatusPanel";
import WelcomePreviewSlider from "../components/WelcomePreviewSlider";
import { useStoreContent } from "../context/StoreContext";

export default function HomePage() {
  const { store } = useStoreContent();
  return (
    <>
      {/* Featured Welcome Preview with Animated Sliding Photo of Deepak */}
      <WelcomePreviewSlider />

      <section className="hero">
        <PageContainer>
          <div className="hero__content">
            <p className="eyebrow">A local shop for everyday life</p>
            <h1>{store.strapline}</h1>
            <p className="hero__intro">
              {store.name} is a fictional neighbourhood grocery store concept
              for welcoming local shopping, everyday food and household
              essentials, and a simple way to explore grocery categories.
            </p>
            <div className="hero__actions">
              <Link className="button button--light" to="/visit">
                Visit the shop
              </Link>
              <Link className="button button--outline" to="/products">
                Explore the catalogue
              </Link>
            </div>
            <div className="hero__aside">
              <p>
                Sample address, opening hours, holiday hours, and contact
                details are available on the store-information page.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="page-section page-section--white">
        <PageContainer>
          <SectionHeading
            eyebrow="The neighbourhood role"
            title="Useful, close by, and made for real routines."
          >
            A neighbourhood grocery store should make the everyday shop feel
            straightforward, with useful information that is clear and easy to
            find.
          </SectionHeading>
          <div className="feature-grid">
            <div className="feature">
              <span className="feature__number">01</span>
              <h3>Easy to find</h3>
              <p>
                Clear store information and opening hours for planning a visit.
              </p>
            </div>
            <div className="feature">
              <span className="feature__number">02</span>
              <h3>Ready to adapt</h3>
              <p>
                A convenient place to explore grocery categories before the
                catalogue is built.
              </p>
            </div>
            <div className="feature">
              <span className="feature__number">03</span>
              <h3>Grounded in place</h3>
              <p>
                A welcoming local grocery concept for everyday food and
                household essentials.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="page-section page-section--cream">
        <PageContainer>
          <SectionHeading
            eyebrow="At a glance"
            title="Plan your visit with confidence."
          />
          <div className="info-grid">
            <div className="info-card">
              <h3>Store information</h3>
              <StatusPanel>
                Sample address, opening hours, holiday hours, and contact
                details are available for this fictional demonstration store.
              </StatusPanel>
              <p style={{ marginTop: "1.1rem", marginBottom: 0 }}>
                <Link className="link-arrow" to="/visit">
                  See store information
                </Link>
              </p>
            </div>
            <div className="info-card">
              <h3>Questions or suggestions</h3>
              <p>
                Have something you would like the store to know? The contact
                layout is ready for connection to a secure enquiry service.
              </p>
              <Link className="link-arrow" to="/contact">
                Go to contact
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="page-section page-section--green">
        <PageContainer>
          <div className="cta-band">
            <div className="cta-band__copy">
              <p className="eyebrow">A considered starting point</p>
              <h2>Built to welcome the people around it.</h2>
              <p>
                When the details are ready, this foundation can grow into a
                useful online home for an independent supermarket.
              </p>
            </div>
            <Link className="button button--light" to="/about">
              Read about the idea
            </Link>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
