import PageContainer from "../components/PageContainer";
import PageIntro from "../components/PageIntro";
import { storeConfig } from "../data/storeConfig";

export default function PrivacyPage() {
  return (
    <>
      <PageIntro eyebrow="Legal information" title="Privacy information">
        This is a template draft for review. It is not a statement of the
        supermarket's final legal or data-processing practices.
      </PageIntro>
      <section className="page-section page-section--white">
        <PageContainer>
          <div className="prose">
            <span className="draft-label">
              {storeConfig.privacyDraft.reviewedLabel}
            </span>
            {storeConfig.privacyDraft.sections.map(([title, copy]) => (
              <section className="policy-section" key={title}>
                <h2>{title}</h2>
                <p>{copy}</p>
              </section>
            ))}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
