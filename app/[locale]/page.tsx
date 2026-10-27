import Cover from "../components/cover/Cover";
import HomeIntro from "./HomeIntro";
import HomeStage from "./HomeStage";

export default function Home() {
  return (
    <HomeStage>
      <HomeIntro>
        <Cover />
      </HomeIntro>
    </HomeStage>
  );
}
