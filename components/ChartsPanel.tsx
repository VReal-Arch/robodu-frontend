"use client";

import { useStore } from "@/store/store";
import { getRobot } from "@/lib/robots";
import { engine } from "@/lib/engine";
import { fmt } from "@/lib/format";
import StripChart, { Series } from "./StripChart";
import LiveValue from "./LiveValue";
import Icon from "./Icon";

function Legend({ items }: { items: { label: string; colorVar: string }[] }) {
  return (
    <div className="chart-legend">
      {items.map((it, i) => (
        <span className="lg" key={i}>
          <span className="lg-line" style={{ background: `var(${it.colorVar})` }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function ToggleCard() {
  const chartMode = useStore((s) => s.chartMode);
  const setChartMode = useStore((s) => s.setChartMode);
  return (
    <div className="card card-strip card-strip-between">
      <span className="strip-label">
        <Icon name="chart" size={15} /> Tampilan Grafik
      </span>
      <div className="mode-selector" style={{ display: "inline-grid", gridTemplateColumns: "1fr 1fr", width: "auto" }}>
        <button className={"mode-btn" + (chartMode === "combined" ? " active" : "")} onClick={() => setChartMode("combined")}>
          Gabung
        </button>
        <button className={"mode-btn" + (chartMode === "separated" ? " active" : "")} onClick={() => setChartMode("separated")}>
          Pisah
        </button>
      </div>
    </div>
  );
}

export default function ChartsPanel({ height = 120, showToggle = true }: { height?: number; showToggle?: boolean }) {
  const activeId = useStore((s) => s.activeId);
  const chartMode = useStore((s) => s.chartMode);
  const robot = getRobot(activeId);
  const sep = chartMode === "separated";

  // ---- PID robots ----
  if (robot.type === "pid") {
    const buf = () => engine.getPidBuffers(useStore.getState().activeId);
    const yMin = robot.yMin;
    const yMax = robot.yMax;

    const mainRead = () => {
      const b = buf();
      const series: Series[] = b
        ? sep
          ? [{ data: b.sp, colorVar: "--muted", width: 2.2, dash: [5, 4] }]
          : [
              { data: b.sp, colorVar: "--muted", width: 2, dash: [5, 4] },
              { data: b.y, colorVar: "--teal", width: 2.2 },
            ]
        : [];
      return { series, min: yMin, max: yMax };
    };
    const actualRead = () => {
      const b = buf();
      return { series: b ? [{ data: b.y, colorVar: "--teal", width: 2.2 }] : [], min: yMin, max: yMax };
    };
    const errRead = () => {
      const b = buf();
      return { series: b ? [{ data: b.e, colorVar: "--orange", width: 2 }] : [], min: -yMax, max: yMax };
    };
    const outRead = () => {
      const b = buf();
      return {
        series: b ? [{ data: b.u, colorVar: "--blue", width: 2 }] : [],
        min: -robot.uMax,
        max: robot.uMax,
      };
    };

    const valActual = () => {
      const s = useStore.getState();
      const c = s.controls[s.activeId];
      const t = engine.telemetry(s.activeId) as { actual: number };
      return sep
        ? fmt(c.setpoint) + " " + robot.yUnit
        : fmt(t.actual) + " " + robot.yUnit;
    };

    return (
      <div className="stack-18">
        {showToggle && <ToggleCard />}
        <div className="card">
          <div className="card-title">
            <span>{sep ? "Setpoint — " + robot.yVar : robot.yVar + " vs Setpoint"}</span>
            <LiveValue className="chart-val" get={valActual} />
          </div>
          <StripChart read={mainRead} height={height} />
          <Legend
            items={
              sep
                ? [{ label: "Setpoint", colorVar: "--muted" }]
                : [
                    { label: "Setpoint", colorVar: "--muted" },
                    { label: robot.yVar, colorVar: "--teal" },
                  ]
            }
          />
        </div>

        {sep && (
          <div className="card">
            <div className="card-title">
              <span>Actual — {robot.yVar}</span>
              <LiveValue
                className="chart-val"
                get={() => {
                  const t = engine.telemetry(useStore.getState().activeId) as { actual: number };
                  return fmt(t.actual) + " " + robot.yUnit;
                }}
              />
            </div>
            <StripChart read={actualRead} height={height} />
            <Legend items={[{ label: robot.yVar, colorVar: "--teal" }]} />
          </div>
        )}

        <div className="card">
          <div className="card-title">
            <span>Error (setpoint − actual)</span>
            <LiveValue
              className="chart-val"
              get={() => {
                const s = useStore.getState();
                const t = engine.telemetry(s.activeId) as { actual: number };
                return fmt(s.controls[s.activeId].setpoint - t.actual) + " " + robot.yUnit;
              }}
            />
          </div>
          <StripChart read={errRead} height={height} />
          <Legend items={[{ label: "Error", colorVar: "--orange" }]} />
        </div>

        <div className="card">
          <div className="card-title">
            <span>Control Output — {robot.uVar}</span>
            <LiveValue
              className="chart-val"
              get={() => {
                const t = engine.telemetry(useStore.getState().activeId) as { output: number };
                return fmt(t.output) + " " + robot.uUnit;
              }}
            />
          </div>
          <StripChart read={outRead} height={height} />
          <Legend items={[{ label: robot.uVar, colorVar: "--blue" }]} />
        </div>
      </div>
    );
  }

  // ---- Humanoid ----
  const hbuf = () => engine.getHumBuffers(useStore.getState().activeId);
  const tiltRead = () => {
    const b = hbuf();
    const series: Series[] = b
      ? sep
        ? [{ data: b.roll, colorVar: "--teal", width: 2.2 }]
        : [
            { data: b.roll, colorVar: "--teal", width: 2.2 },
            { data: b.pitch, colorVar: "--blue", width: 2 },
          ]
      : [];
    return { series, min: -15, max: 15 };
  };
  const pitchRead = () => {
    const b = hbuf();
    return { series: b ? [{ data: b.pitch, colorVar: "--blue", width: 2.2 }] : [], min: -15, max: 15 };
  };
  const comRead = () => {
    const b = hbuf();
    return {
      series: b
        ? [
            { data: b.comX, colorVar: "--teal", width: 2.2 },
            { data: b.comY, colorVar: "--blue", width: 2 },
          ]
        : [],
      min: -1,
      max: 1,
    };
  };

  return (
    <div className="stack-18">
      {showToggle && <ToggleCard />}
      <div className="card">
        <div className="card-title">
          <span>{sep ? "Body Roll" : "Body Tilt (Roll / Pitch)"}</span>
          <LiveValue
            className="chart-val"
            get={() => {
              const t = engine.telemetry(useStore.getState().activeId) as { roll: number };
              return fmt(t.roll) + "°";
            }}
          />
        </div>
        <StripChart read={tiltRead} height={height} />
        <Legend
          items={
            sep
              ? [{ label: "Roll", colorVar: "--teal" }]
              : [
                  { label: "Roll", colorVar: "--teal" },
                  { label: "Pitch", colorVar: "--blue" },
                ]
          }
        />
      </div>

      {sep && (
        <div className="card">
          <div className="card-title">
            <span>Body Pitch</span>
            <LiveValue
              className="chart-val"
              get={() => {
                const t = engine.telemetry(useStore.getState().activeId) as { pitch: number };
                return fmt(t.pitch) + "°";
              }}
            />
          </div>
          <StripChart read={pitchRead} height={height} />
          <Legend items={[{ label: "Pitch", colorVar: "--blue" }]} />
        </div>
      )}

      <div className="card">
        <div className="card-title">
          <span>Center of Mass (X / Y)</span>
          <LiveValue
            className="chart-val"
            get={() => {
              const t = engine.telemetry(useStore.getState().activeId) as { comX: number };
              return "X " + fmt(t.comX, 2);
            }}
          />
        </div>
        <StripChart read={comRead} height={height} />
        <Legend
          items={[
            { label: "CoM X", colorVar: "--teal" },
            { label: "CoM Y", colorVar: "--blue" },
          ]}
        />
      </div>
    </div>
  );
}
