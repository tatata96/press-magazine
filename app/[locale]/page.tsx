import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {getPageMetadata} from "@/lib/seo";
import Cover from "../components/cover/Cover";
import HomeIntro from "./HomeIntro";
import HomeStage from "./HomeStage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return getPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "",
    absoluteTitle: true,
  });
}

export default function Home() {
  return (
    <HomeStage>
      <HomeIntro>
        <Cover />
      </HomeIntro>
    </HomeStage>
  );
}
