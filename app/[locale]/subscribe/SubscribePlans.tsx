"use client";

import Image from "next/image";
import {useState} from "react";
import Button from "@/app/components/button/Button";
import styles from "./subscribe.module.scss";

export type Plan = {
  id: string;
  image: string;
  name: string;
  tagline: string;
  price: string;
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
  };
};

// Client component only for the plan choice: the selected plan drives the large
// image and the benefits list. Everything else is static copy from the server.
export default function SubscribePlans({plans, copy}: SubscribePlansProps) {
  const [selectedId, setSelectedId] = useState(plans[0].id);
  const selected = plans.find((plan) => plan.id === selectedId) ?? plans[0];

  return (
    <main className={styles.main}>
      <div className={styles.stage} aria-hidden="true">
        {/* All images stay mounted and cross-fade, so switching never waits on a load. */}
        {plans.map((plan) => (
          <Image
            key={plan.id}
            src={plan.image}
            alt=""
            fill
            priority={plan.id === plans[0].id}
            sizes="(min-width: 900px) 60vw, 100vw"
            className={`${styles.stageImage} ${plan.id === selected.id ? styles.stageImageActive : ""}`}
          />
        ))}
        <div className={styles.stageCaption}>
          <p className={styles.stageName}>{selected.name}</p>
          <p className={styles.stageTagline}>{selected.tagline}</p>
          <p className={styles.stagePrice}>
            {selected.price} <span>{copy.priceNote}</span>
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

        {/* Presentational only: checkout is not integrated yet. */}
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
              <Image
                src={plan.image}
                alt=""
                width={96}
                height={120}
                className={styles.thumb}
              />
              <span className={styles.choiceText}>
                <span className={styles.choiceName}>{plan.name}</span>
                <span className={styles.choiceTagline}>{plan.tagline}</span>
                <span className={styles.choicePrice}>
                  {plan.price} <span className="type-mono">{copy.priceNote}</span>
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className={styles.summary}>
          <p className={`type-mono ${styles.legend}`}>{copy.includesLabel}</p>
          <ul className={styles.benefits}>
            {selected.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>

        <div className={styles.purchase}>
          <p className={`type-mono ${styles.issueNote}`}>{copy.issueNote}</p>
          <Button className={styles.cta}>{copy.cta}</Button>
        </div>
      </section>
    </main>
  );
}
