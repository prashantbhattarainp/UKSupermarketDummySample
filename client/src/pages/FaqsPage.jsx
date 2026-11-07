import Accordion from "../components/Accordion";
import PageContainer from "../components/PageContainer";
import PageIntro from "../components/PageIntro";
import { storeConfig } from "../data/storeConfig";

export default function FaqsPage() {
  return (
    <>
      <PageIntro eyebrow="Common questions" title="Frequently asked questions">
        Neutral starter content for a store website. Replace these answers with
        confirmed information before publication.
      </PageIntro>
      <section className="page-section page-section--white">
        <PageContainer>
          <div style={{ maxWidth: "760px" }}>
            <Accordion items={storeConfig.faqs} />
          </div>
        </PageContainer>
      </section>
    </>
  );
}
