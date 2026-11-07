import PageContainer from "../components/PageContainer";
import PageIntro from "../components/PageIntro";
import EmptyState from "../components/EmptyState";
import { useStoreContent } from "../context/StoreContext";

export default function ServicesPage() {
  const { services } = useStoreContent();
  return (
    <>
      <PageIntro eyebrow="Store services" title="Services">
        Fictional demonstration services confirmed for this store template.
      </PageIntro>
      <section className="page-section page-section--white">
        <PageContainer>
          <div className="info-grid">
            {services.length ? (
              services.map((service) => (
                <article className="info-card" key={service.id}>
                  <h2>{service.name}</h2>
                  <p>{service.description}</p>
                </article>
              ))
            ) : (
              <EmptyState title="No services are published.">
                Services will appear here after they are confirmed by the owner.
              </EmptyState>
            )}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
