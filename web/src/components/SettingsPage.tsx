import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons/faGear";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons/faRotateLeft";
import {
  DEFAULT_READING_SETTINGS,
  type ReadingSettings,
} from "../settings";

type Props = {
  settings: ReadingSettings;
  onChange: (settings: ReadingSettings) => void;
  onReset: () => void;
};

export function SettingsPage({ settings, onChange, onReset }: Props) {
  return (
    <section className="settings-page">
      <header className="settings-header">
        <p className="eyebrow">阅读偏好</p>
        <h2>
          <FontAwesomeIcon icon={faGear} /> 设置
        </h2>
        <p>调整阅读正文的字号和行距，设置会保存在当前浏览器。</p>
      </header>

      <div className="settings-field">
        <label htmlFor="settings-font-size">
          <span>正文字号</span>
          <strong>{settings.fontSize}px</strong>
        </label>
        <input
          id="settings-font-size"
          type="range"
          min={14}
          max={22}
          step={1}
          value={settings.fontSize}
          onChange={(event) =>
            onChange({ ...settings, fontSize: Number(event.target.value) })
          }
        />
        <p className="settings-hint">范围 14–22px，默认 16px。</p>
      </div>

      <div className="settings-field">
        <label htmlFor="settings-line-height">
          <span>正文行距</span>
          <strong>{settings.lineHeight.toFixed(2)}</strong>
        </label>
        <input
          id="settings-line-height"
          type="range"
          min={1.4}
          max={2.2}
          step={0.05}
          value={settings.lineHeight}
          onChange={(event) =>
            onChange({ ...settings, lineHeight: Number(event.target.value) })
          }
        />
        <p className="settings-hint">范围 1.40–2.20，默认 1.75。</p>
      </div>

      <div className="settings-preview">
        <p className="eyebrow">预览</p>
        <p
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
          }}
        >
          集合不是一种“高级写法”，而是把“有哪些对象”说清楚的最小工具。后面的关系、函数、图，都是在这个工具上继续搭起来的。
        </p>
      </div>

      <div className="settings-actions">
        <button type="button" onClick={onReset}>
          <FontAwesomeIcon icon={faRotateLeft} /> 恢复默认
        </button>
        <span>
          默认：{DEFAULT_READING_SETTINGS.fontSize}px /{" "}
          {DEFAULT_READING_SETTINGS.lineHeight.toFixed(2)}
        </span>
      </div>
    </section>
  );
}
