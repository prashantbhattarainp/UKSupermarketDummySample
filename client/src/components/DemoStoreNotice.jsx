import { storeConfig } from "../data/storeConfig";

export default function DemoStoreNotice() {
  return (
    <div className="demo-notice" role="note">
      <div className="page-container demo-notice__inner">
        <span className="demo-notice__label">{storeConfig.demoNotice}</span>
        <span>
          All business details and prices shown are fictional examples for this
          demonstration.
        </span>
      </div>
    </div>
  );
}
