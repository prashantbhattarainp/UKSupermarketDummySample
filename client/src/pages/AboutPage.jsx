import PageContainer from "../components/PageContainer";
import PageIntro from "../components/PageIntro";
import SectionHeading from "../components/SectionHeading";
import { useStoreContent } from "../context/StoreContext";

export default function AboutPage() {
  const { store } = useStoreContent();
  return (
    <>
      <PageIntro eyebrow="About the demonstration store" title={store.name}>
        A fictional introduction for Deepak Supermarket. This demonstration
        identity and its store details are sample content, not verified claims.
      </PageIntro>
      <section className="page-section page-section--white">
        <PageContainer>
          <div className="two-column">
            <div className="prose">
              <SectionHeading
                eyebrow="The concept"
                title="A familiar place, with a clearer digital front door."
              />
              {(
                store.about ||
                "Store information will appear here when configured."
              )
                .split("\n\n")
                .map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              <p>
                The wording on this page is intentionally configurable. Before
                publication, replace the sample content with confirmed
                information about the supermarket and its genuinely provided
                services.
              </p>
            </div>
            <aside className="side-note">
              <h3>Content to confirm</h3>
              <p>
                Business history, ownership, sustainability commitments,
                partnerships, years of operation, and community claims should be
                supplied and approved by the owner before going live.
              </p>
            </aside>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
