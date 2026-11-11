"use client";

import Image from "next/image";
import {useState, useTransition} from "react";
import Button from "@/app/components/button/Button";
import {useRouter} from "../../../i18n/navigation";
import {addToCart} from "../cart/actions";
import styles from "./subscribe.module.scss";

export type Plan = {
  id: string;
  image: string | null;
  name: string;
  tagline: string;
  price: string | null;
  /** Shopify variant to add to the cart; null when unavailable or not loaded. */
  variantId: string | null;
  benefits: string[];
};

type SubscribePlansProps = {
  plans: Plan[];
  copy: {
    heading: string;
    lead: string;
    issueNote: string;
    priceNote: string;
    planChoice: string;
    includesLabel: string;
    cta: string;
    adding: string;
    priceUnavailable: string;
    unavailable: string;
    addError: string;
  };
};

// Client component only for the plan choice: the selected plan drives the large
// image and the benefits list. Everything else is static copy from the server.
export default function SubscribePlans({plans, copy}: SubscribePlansProps) {
  const [selectedId, setSelectedId] = useState(plans[0].id);
  const selected = plans.find((plan) => plan.id === selectedId) ?? plans[0];
  const router = useRouter();
  const [isAdding, startAdding] = useTransition();
  const [hasAddError, setHasAddError] = useState(false);

  function handleAddToCart() {
    if (!selected.variantId) {
      return;
    }

    const {variantId} = selected;

    setHasAddError(false);
    startAdding(async () => {
      const result = await addToCart(variantId);

      if (result.ok) {
        router.push("/buyer-details");
      } else {
        setHasAddError(true);
      }
    });
  }

  return (
    <main className={styles.main}>
      <div className={styles.stage} aria-hidden="true">
        {/* All images stay mounted and cross-fade, so switching never waits on a load. */}
        {plans.map((plan) =>
          plan.image ? (
            <Image
              key={plan.id}
              src={plan.image}
              alt=""
              fill
              priority={plan.id === plans[0].id}
              sizes="(min-width: 900px) 60vw, 100vw"
              className={`${styles.stageImage} ${plan.id === selected.id ? styles.stageImageActive : ""}`}
            />
          ) : null,
        )}
        <div className={styles.stageCaption}>
          <p className={styles.stageName}>{selected.name}</p>
          <p className={styles.stageTagline}>{selected.tagline}</p>
          <p className={styles.stagePrice}>
            {selected.price ?? copy.priceUnavailable}{" "}
            {selected.price ? <span>{copy.priceNote}</span> : null}
          </p>
        </div>
      </div>

      <section className={styles.panel} aria-labelledby="subscribe-heading">
        <div className={styles.intro}>
          <h1 id="subscribe-heading" className={styles.heading}>
            {copy.heading}
          </h1>
          <p className={styles.lead}>{copy.lead}</p>
        </div>

        <fieldset className={styles.choices}>
          <legend className={styles.visuallyHidden}>{copy.planChoice}</legend>
          {plans.map((plan) => (
            <label key={plan.id} className={styles.choice}>
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={plan.id === selected.id}
                onChange={() => setSelectedId(plan.id)}
                className={styles.radio}
              />
              {plan.image ? (
                <Image
                  src={plan.image}
                  alt=""
                  width={96}
                  height={120}
                  className={styles.thumb}
                />
              ) : (
                <span className={styles.thumb} aria-hidden="true" />
              )}
              <span className={styles.choiceText}>
                <span className={styles.choiceName}>{plan.name}</span>
                <span className={styles.choiceTagline}>{plan.tagline}</span>
                <span className={styles.choicePrice}>
                  {plan.price ?? copy.priceUnavailable}{" "}
                  {plan.price ? (
                    <span className="type-mono">{copy.priceNote}</span>
                  ) : null}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className={styles.summary}>
          <p className={`type-mono ${styles.legend}`}>{copy.includesLabel}</p>
          {/* Every plan's list shares one grid cell, so the cell is as tall as the
              longest list and switching plans never moves the purchase section. */}
          <div className={styles.benefitsStack}>
            {plans.map((plan) => (
              <ul
                key={plan.id}
                className={`${styles.benefits} ${plan.id === selected.id ? "" : styles.benefitsHidden}`}
              >
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className={styles.purchase}>
          <p className={`type-mono ${styles.issueNote}`}>{copy.issueNote}</p>
          <Button
            className={styles.cta}
            loading={isAdding}
            loadingLabel={copy.adding}
            disabled={!selected.variantId}
            onClick={handleAddToCart}
          >
            {selected.variantId ? copy.cta : copy.unavailable}
          </Button>
          {hasAddError ? (
            <p role="alert" className={styles.addError}>
              {copy.addError}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
