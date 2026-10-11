import type { ReactNode } from "react";

// ── Shared props ──────────────────────────────────────────────────
export interface SlideProps { slideNumber: number; total: number; }

// ── SlideShell: full-screen container for each slide ─────────────
export const SlideShell = ({
  children,
  bg = "bg-background",
  bgImage = "",
}: {
  children: ReactNode;
  bg?: string;
  bgImage?: string;
}) => (
  <div className={`pitch-shell ${bg}`}>
    {bgImage && (
      <>
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.15]" 
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      </>
    )}
    <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none" />
    <div className="pitch-inner relative z-10 w-full">{children}</div>
  </div>
);

// ── Tag: small section label ──────────────────────────────────────
export const Tag = ({
  children,
  color = "text-primary",
}: {
  children: ReactNode;
  color?: string;
}) => <div className={`pitch-tag ${color}`}>{children}</div>;

// ── BigHeading: primary slide headline ───────────────────────────
export const BigHeading = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <h2 className={`fluid-h1 ${className}`}>{children}</h2>;

// ── SubHeading: secondary headline ───────────────────────────────
export const SubHeading = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <h3 className={`fluid-h2 ${className}`}>{children}</h3>;

// ── Body: paragraph text ─────────────────────────────────────────
export const Body = ({ children }: { children: ReactNode }) => (
  <p className="fluid-body text-foreground-muted mb-6">{children}</p>
);

// ── GlassCard: base glass card with uniform padding ───────────────
export const GlassCard = ({
  children,
  className = "",
  accent = false,
  centered = false,
  style = {},
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  centered?: boolean;
  style?: React.CSSProperties;
}) => (
  <div
    className={`pitch-card ${accent ? "pitch-card-accent" : ""} ${
      centered ? "text-center items-center justify-center" : ""
    } ${className}`}
    style={style}
  >
    {children}
  </div>
);

// ── StatCard: a metric display ────────────────────────────────────
export const StatCard = ({
  value,
  label,
  sub,
  color = "text-primary",
}: {
  value: string;
  label: string;
  sub?: string;
  color?: string;
}) => (
  <div className="pitch-card text-center items-center justify-center">
    <div className={`pitch-stat-value ${color} mb-2`}>{value}</div>
    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted mb-1">
      {label}
    </div>
    {sub && <div className="text-xs text-foreground-muted/70 leading-snug">{sub}</div>}
  </div>
);

// ── Glow: decorative background glow ─────────────────────────────
export const Glow = ({
  color = "bg-primary/10",
  cls = "",
}: {
  color?: string;
  cls?: string;
}) => (
  <div
    className={`absolute rounded-full blur-[140px] pointer-events-none ${color} ${cls}`}
  />
);

// ── Bullet list ───────────────────────────────────────────────────
export const Bullet = ({ items }: { items: string[] }) => (
  <ul className="space-y-3 mt-2">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3 text-base text-foreground-muted">
        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
        <span className="leading-relaxed">{item}</span>
      </li>
    ))}
  </ul>
);

// ── TwoCol: standard left-text / right-visual layout ─────────────
export const TwoCol = ({
  left,
  right,
  reverse = false,
}: {
  left: ReactNode;
  right: ReactNode;
  reverse?: boolean;
}) => (
  <div
    className={`grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20 items-center ${
      reverse ? "lg:[&>*:first-child]:order-2" : ""
    }`}
  >
    <div>{left}</div>
    <div>{right}</div>
  </div>
);

// ── Divider ───────────────────────────────────────────────────────
export const Divider = () => <div className="pitch-divider" />;
