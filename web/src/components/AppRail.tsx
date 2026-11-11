import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons/faBookOpen";
import { faGear } from "@fortawesome/free-solid-svg-icons/faGear";
import { faSitemap } from "@fortawesome/free-solid-svg-icons/faSitemap";

type Props = {
  active: "graph" | "settings";
  readHref: string;
  graphHref: string;
};

export function AppRail({ active, readHref, graphHref }: Props) {
  return (
    <nav className="app-rail" aria-label="全局导航">
      <a
        className={active === "graph" ? "rail-link active" : "rail-link"}
        href={graphHref}
        aria-current={active === "graph" ? "page" : undefined}
        title="知识图谱"
      >
        <FontAwesomeIcon icon={faSitemap} />
        <span>图谱</span>
      </a>
      <a className="rail-link" href={readHref} title="阅读">
        <FontAwesomeIcon icon={faBookOpen} />
        <span>阅读</span>
      </a>
      <a
        className={active === "settings" ? "rail-link active" : "rail-link"}
        href="#/settings"
        aria-current={active === "settings" ? "page" : undefined}
        title="设置"
      >
        <FontAwesomeIcon icon={faGear} />
        <span>设置</span>
      </a>
    </nav>
  );
}
