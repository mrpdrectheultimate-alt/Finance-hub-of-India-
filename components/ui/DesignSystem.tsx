"use client";
import { useState, useRef, useEffect, forwardRef } from "react";

// ================================================================
// BUTTON
// ================================================================
type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "danger" | "success";
type ButtonSize    = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  icon?:     React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  href?:     string;
}

const BTN_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background:   "var(--accent)",
    color:        "#fff",
    borderColor:  "var(--accent)",
  },
  secondary: {
    background:   "var(--bg-card)",
    color:        "var(--text-primary)",
    borderColor:  "var(--border-strong)",
  },
  ghost: {
    background:   "transparent",
    color:        "var(--text-secondary)",
    borderColor:  "transparent",
  },
  accent: {
    background:   "var(--accent-light)",
    color:        "var(--accent)",
    borderColor:  "var(--accent-light)",
  },
  danger: {
    background:   "var(--error-light)",
    color:        "var(--error)",
    borderColor:  "var(--error-light)",
  },
  success: {
    background:   "var(--success-light)",
    color:        "var(--success)",
    borderColor:  "var(--success-light)",
  },
};

const BTN_SIZES: Record<ButtonSize, React.CSSProperties> = {
  xs: { fontSize: "0.6875rem", padding: "4px 9px",  borderRadius: "var(--radius-sm)", gap: "3px" },
  sm: { fontSize: "0.8125rem", padding: "6px 13px", borderRadius: "var(--radius-md)", gap: "5px" },
  md: { fontSize: "0.875rem",  padding: "9px 18px", borderRadius: "var(--radius-md)", gap: "6px" },
  lg: { fontSize: "1rem",      padding: "12px 24px",borderRadius: "var(--radius-lg)", gap: "7px" },
  xl: { fontSize: "1.0625rem", padding: "14px 30px",borderRadius: "var(--radius-lg)", gap: "8px" },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = "primary", size = "md", loading, icon, iconRight,
  fullWidth, children, disabled, style, ...props
}, ref) => {
  const [hovered, setHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    fontFamily:     "var(--font-ui)",
    fontWeight:     600,
    lineHeight:     1,
    border:         "1.5px solid",
    cursor:         disabled || loading ? "not-allowed" : "pointer",
    opacity:        disabled || loading ? 0.6 : 1,
    transition:     "all var(--transition-fast)",
    whiteSpace:     "nowrap" as const,
    width:          fullWidth ? "100%" : undefined,
    transform:      hovered && !disabled && !loading ? "translateY(-1px)" : "translateY(0)",
    boxShadow:      hovered && !disabled && !loading && variant === "primary"
                      ? "0 4px 12px rgba(0,0,0,0.18)"
                      : undefined,
    ...BTN_SIZES[size],
    ...BTN_STYLES[variant],
    ...style,
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={baseStyle}
      {...props}
    >
      {loading ? (
        <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      ) : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
});
Button.displayName = "Button";

// ================================================================
// CARD
// ================================================================
interface CardProps {
  children:    React.ReactNode;
  interactive?: boolean;
  featured?:   boolean;
  padding?:    "none" | "sm" | "md" | "lg";
  style?:      React.CSSProperties;
  onClick?:    () => void;
  className?:  string;
}

const CARD_PADDING = { none: "0", sm: "14px", md: "20px", lg: "28px" };

type CardSubComponentProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

type CardComponent = ((props: CardProps) => JSX.Element) & {
  Header: (props: CardSubComponentProps) => JSX.Element;
  Footer: (props: CardSubComponentProps) => JSX.Element;
};

export const Card: CardComponent = function Card({ children, interactive, featured, padding = "md", style, onClick, className }: CardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
      style={{
        background:    "var(--bg-card)",
        border:        featured ? "2px solid var(--accent)" : "1px solid var(--border)",
        borderRadius:  "var(--radius-lg)",
        boxShadow:     hovered
                         ? "var(--shadow-lg)"
                         : featured
                           ? "0 0 0 4px var(--accent-light), var(--shadow-md)"
                           : "var(--shadow-sm)",
        transform:     hovered && interactive ? "translateY(-3px)" : "translateY(0)",
        transition:    "all var(--transition-base)",
        cursor:        onClick || interactive ? "pointer" : undefined,
        padding:       CARD_PADDING[padding],
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
} as CardComponent;

// Card sub-components
Card.Header = function CardHeader({ children, style }: CardSubComponentProps) {
  return (
    <div style={{
      paddingBottom: "14px",
      marginBottom:  "14px",
      borderBottom:  "1px solid var(--border)",
      ...style,
    }}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, style }: CardSubComponentProps) {
  return (
    <div style={{
      paddingTop:  "14px",
      marginTop:   "14px",
      borderTop:   "1px solid var(--border)",
      display:     "flex",
      alignItems:  "center",
      justifyContent: "space-between",
      ...style,
    }}>
      {children}
    </div>
  );
};

// ================================================================
// BADGE
// ================================================================
type BadgeVariant = "accent" | "success" | "warning" | "error" | "info" | "gold" | "dark" | "muted" | "purple";

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  accent:  { background: "var(--accent-light)",  color: "var(--accent)"  },
  success: { background: "var(--success-light)", color: "var(--success)" },
  warning: { background: "var(--warning-light)", color: "var(--warning)" },
  error:   { background: "var(--error-light)",   color: "var(--error)"   },
  info:    { background: "var(--info-light)",     color: "var(--info)"    },
  gold:    { background: "var(--gold-light)",     color: "var(--gold)"    },
  dark:    { background: "var(--text-primary)",   color: "var(--bg-page)" },
  muted:   { background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" },
  purple:  { background: "#EDE9FE", color: "#6D28D9" },
};

interface BadgeProps {
  children:  React.ReactNode;
  variant?:  BadgeVariant;
  size?:     "sm" | "md";
  icon?:     React.ReactNode;
  dot?:      boolean;
  style?:    React.CSSProperties;
}

export function Badge({ children, variant = "accent", size = "md", icon, dot, style }: BadgeProps) {
  return (
    <span style={{
      display:      "inline-flex",
      alignItems:   "center",
      gap:          "4px",
      fontSize:     size === "sm" ? "0.625rem" : "0.6875rem",
      fontWeight:   700,
      letterSpacing:"0.04em",
      padding:      size === "sm" ? "2px 7px" : "3px 9px",
      borderRadius: "var(--radius-full)",
      lineHeight:   1.4,
      fontFamily:   "var(--font-ui)",
      ...BADGE_STYLES[variant],
      ...style,
    }}>
      {dot && (
        <span style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "currentColor", flexShrink: 0,
        }} />
      )}
      {icon}
      {children}
    </span>
  );
}

// ================================================================
// INPUT
// ================================================================
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?:    string;
  error?:    string;
  hint?:     string;
  prefix?:   React.ReactNode;
  suffix?:   React.ReactNode;
  fullWidth?: boolean;
}

export function Input({ label, error, hint, prefix, suffix, fullWidth, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ width: fullWidth ? "100%" : undefined, fontFamily: "var(--font-ui)" }}>
      {label && (
        <label style={{
          display:     "block",
          fontSize:    "0.8125rem",
          fontWeight:  600,
          color:       "var(--text-primary)",
          marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <div style={{
        display:      "flex",
        alignItems:   "center",
        background:   "var(--bg-card)",
        border:       `1.5px solid ${error ? "var(--error)" : focused ? "var(--border-focus)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        boxShadow:    focused ? `0 0 0 3px var(--accent-light)` : undefined,
        transition:   "all var(--transition-fast)",
        width:        fullWidth ? "100%" : undefined,
      }}>
        {prefix && (
          <div style={{ padding: "0 12px", color: "var(--text-muted)", flexShrink: 0 }}>{prefix}</div>
        )}
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex:       1,
            padding:    prefix ? "9px 12px 9px 0" : "9px 14px",
            paddingRight: suffix ? 0 : 14,
            fontSize:   "0.9375rem",
            fontFamily: "var(--font-ui)",
            color:      "var(--text-primary)",
            background: "transparent",
            border:     "none",
            outline:    "none",
            width:      "100%",
            ...style,
          }}
          {...props}
        />
        {suffix && (
          <div style={{ padding: "0 12px", color: "var(--text-muted)", flexShrink: 0 }}>{suffix}</div>
        )}
      </div>
      {(error || hint) && (
        <p style={{
          fontSize:   "0.75rem",
          marginTop:  5,
          color:      error ? "var(--error)" : "var(--text-muted)",
        }}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

// ================================================================
// TEXTAREA
// ================================================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  fullWidth?: boolean;
}

export function Textarea({ label, error, hint, fullWidth, style, ...props }: TextareaProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ width: fullWidth ? "100%" : undefined, fontFamily: "var(--font-ui)" }}>
      {label && (
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
          {label}
        </label>
      )}
      <textarea
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:        fullWidth ? "100%" : undefined,
          padding:      "10px 14px",
          fontSize:     "0.9375rem",
          fontFamily:   "var(--font-ui)",
          color:        "var(--text-primary)",
          background:   "var(--bg-card)",
          border:       `1.5px solid ${error ? "var(--error)" : focused ? "var(--border-focus)" : "var(--border)"}`,
          borderRadius: "var(--radius-md)",
          boxShadow:    focused ? "0 0 0 3px var(--accent-light)" : undefined,
          outline:      "none",
          resize:       "vertical",
          lineHeight:   1.6,
          transition:   "all var(--transition-fast)",
          boxSizing:    "border-box",
          ...style,
        }}
        {...props}
      />
      {(error || hint) && (
        <p style={{ fontSize: "0.75rem", marginTop: 5, color: error ? "var(--error)" : "var(--text-muted)" }}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

// ================================================================
// SELECT
// ================================================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:    string;
  error?:    string;
  options:   { value: string; label: string }[];
  fullWidth?: boolean;
}

export function Select({ label, error, options, fullWidth, style, ...props }: SelectProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ width: fullWidth ? "100%" : undefined, fontFamily: "var(--font-ui)" }}>
      {label && (
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
          {label}
        </label>
      )}
      <select
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:        fullWidth ? "100%" : undefined,
          padding:      "9px 14px",
          fontSize:     "0.9375rem",
          fontFamily:   "var(--font-ui)",
          color:        "var(--text-primary)",
          background:   "var(--bg-card)",
          border:       `1.5px solid ${error ? "var(--error)" : focused ? "var(--border-focus)" : "var(--border)"}`,
          borderRadius: "var(--radius-md)",
          outline:      "none",
          transition:   "all var(--transition-fast)",
          cursor:       "pointer",
          ...style,
        }}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ================================================================
// TABS
// ================================================================
interface Tab { id: string; label: string; icon?: React.ReactNode; badge?: string | number }
interface TabsProps {
  tabs:       Tab[];
  active:     string;
  onChange:   (id: string) => void;
  variant?:   "underline" | "pill";
  size?:      "sm" | "md";
}

export function Tabs({ tabs, active, onChange, variant = "underline", size = "md" }: TabsProps) {
  if (variant === "pill") {
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display:     "flex",
              alignItems:  "center",
              gap:         6,
              padding:     size === "sm" ? "5px 12px" : "7px 16px",
              fontSize:    size === "sm" ? "0.8125rem" : "0.875rem",
              fontWeight:  active === tab.id ? 600 : 500,
              fontFamily:  "var(--font-ui)",
              border:      "1.5px solid",
              borderColor: active === tab.id ? "var(--accent)" : "var(--border)",
              borderRadius:"var(--radius-full)",
              background:  active === tab.id ? "var(--accent-light)" : "var(--bg-card)",
              color:       active === tab.id ? "var(--accent)" : "var(--text-muted)",
              cursor:      "pointer",
              transition:  "all var(--transition-fast)",
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span style={{
                background:   active === tab.id ? "var(--accent)" : "var(--bg-surface)",
                color:        active === tab.id ? "#fff" : "var(--text-muted)",
                borderRadius: "var(--radius-full)",
                fontSize:     "0.625rem",
                fontWeight:   700,
                padding:      "1px 6px",
                minWidth:     18,
                textAlign:    "center",
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display:       "flex",
      borderBottom:  "1.5px solid var(--border)",
      overflowX:     "auto",
      scrollbarWidth:"none",
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            display:         "flex",
            alignItems:      "center",
            gap:             6,
            padding:         size === "sm" ? "8px 14px" : "10px 18px",
            fontSize:        size === "sm" ? "0.8125rem" : "0.875rem",
            fontWeight:      active === tab.id ? 600 : 500,
            fontFamily:      "var(--font-ui)",
            border:          "none",
            borderBottom:    active === tab.id ? "2.5px solid var(--accent)" : "2.5px solid transparent",
            background:      "transparent",
            color:           active === tab.id ? "var(--accent)" : "var(--text-muted)",
            cursor:          "pointer",
            whiteSpace:      "nowrap",
            transition:      "all var(--transition-fast)",
            marginBottom:    -1.5,
          }}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && (
            <Badge variant={active === tab.id ? "accent" : "muted"} size="sm">{tab.badge}</Badge>
          )}
        </button>
      ))}
    </div>
  );
}

// ================================================================
// PROGRESS BAR
// ================================================================
interface ProgressBarProps {
  value:     number;  // 0-100
  max?:      number;
  color?:    string;
  size?:     "xs" | "sm" | "md" | "lg";
  label?:    string;
  showValue?: boolean;
  animated?:  boolean;
  style?:    React.CSSProperties;
}

const PROGRESS_HEIGHTS = { xs: 3, sm: 5, md: 7, lg: 10 };

export function ProgressBar({ value, max = 100, color, size = "sm", label, showValue, animated, style }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div style={style}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          {label    && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>{label}</span>}
          {showValue && <span style={{ fontSize: "0.75rem", fontWeight: 600, color: color || "var(--accent)", fontFamily: "var(--font-mono)" }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{
        height:       PROGRESS_HEIGHTS[size],
        background:   "var(--bg-surface)",
        borderRadius: "var(--radius-full)",
        overflow:     "hidden",
        border:       "1px solid var(--border)",
      }}>
        <div style={{
          width:        `${pct}%`,
          height:       "100%",
          background:   color
                          ? color
                          : `linear-gradient(90deg, var(--accent) 0%, var(--accent-muted) 100%)`,
          borderRadius: "var(--radius-full)",
          transition:   "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundSize: animated ? "200% 100%" : undefined,
          animation:    animated ? "shimmer 2s infinite" : undefined,
        }} />
      </div>
    </div>
  );
}

// ================================================================
// PROGRESS RING
// ================================================================
interface ProgressRingProps {
  value:    number;  // 0-100
  size?:    number;
  stroke?:  number;
  color?:   string;
  label?:   React.ReactNode;
  style?:   React.CSSProperties;
}

export function ProgressRing({ value, size = 56, stroke = 5, color, label, style }: ProgressRingProps) {
  const radius = (size - stroke * 2) / 2;
  const circ   = 2 * Math.PI * radius;
  const pct    = Math.min(100, Math.max(0, value));
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, ...style }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg-surface)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color || "var(--accent)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      {label && (
        <div style={{
          position:   "absolute",
          inset:      0,
          display:    "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize:   size < 48 ? "0.6rem" : "0.75rem",
          fontWeight: 700,
          color:      color || "var(--accent)",
          fontFamily: "var(--font-ui)",
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

// ================================================================
// SKELETON LOADER
// ================================================================
interface SkeletonProps {
  width?:   string | number;
  height?:  string | number;
  rounded?: boolean;
  style?:   React.CSSProperties;
}

export function Skeleton({ width = "100%", height = 16, rounded, style }: SkeletonProps) {
  return (
    <div style={{
      width,
      height,
      borderRadius: rounded ? "var(--radius-full)" : "var(--radius-md)",
      background:   "linear-gradient(90deg, var(--bg-surface) 25%, var(--border) 50%, var(--bg-surface) 75%)",
      backgroundSize: "200% 100%",
      animation:    "shimmer 1.5s infinite",
      flexShrink:   0,
      ...style,
    }} />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <Card>
      <Skeleton height={20} width="60%" style={{ marginBottom: 12 }} />
      <Skeleton height={14} style={{ marginBottom: 8 }} />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} height={14} width={i === lines - 2 ? "75%" : "100%"} style={{ marginBottom: 8 }} />
      ))}
    </Card>
  );
}

// ================================================================
// ALERT / BANNER
// ================================================================
type AlertVariant = "success" | "warning" | "error" | "info" | "accent";

const ALERT_STYLES: Record<AlertVariant, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: "var(--success-light)", border: "var(--success)", color: "var(--success)", icon: "OK" },
  warning: { bg: "var(--warning-light)", border: "var(--warning)", color: "var(--warning)", icon: "!" },
  error:   { bg: "var(--error-light)",   border: "var(--error)",   color: "var(--error)",   icon: "X" },
  info:    { bg: "var(--info-light)",    border: "var(--info)",    color: "var(--info)",    icon: "i" },
  accent:  { bg: "var(--accent-light)",  border: "var(--accent)",  color: "var(--accent)",  icon: "*" },
};

interface AlertProps {
  variant?:    AlertVariant;
  title?:      string;
  children:    React.ReactNode;
  dismissible?: boolean;
  icon?:       React.ReactNode;
  style?:      React.CSSProperties;
}

export function Alert({ variant = "info", title, children, dismissible, icon, style }: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const cfg = ALERT_STYLES[variant];

  return (
    <div style={{
      display:      "flex",
      alignItems:   "flex-start",
      gap:          10,
      padding:      "12px 14px",
      borderRadius: "var(--radius-md)",
      border:       `1.5px solid ${cfg.border}`,
      background:   cfg.bg,
      fontSize:     "0.875rem",
      lineHeight:   1.55,
      fontFamily:   "var(--font-ui)",
      ...style,
    }}>
      <span style={{ color: cfg.color, fontWeight: 700, flexShrink: 0, fontSize: 15, marginTop: 1 }}>
        {icon || cfg.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontWeight: 600, color: cfg.color, marginBottom: 3 }}>{title}</div>}
        <div style={{ color: "var(--text-secondary)" }}>{children}</div>
      </div>
      {dismissible && (
        <button onClick={() => setDismissed(true)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", fontSize: 16, padding: "0 2px", flexShrink: 0,
        }}>X</button>
      )}
    </div>
  );
}

// ================================================================
// MODAL
// ================================================================
interface ModalProps {
  open:      boolean;
  onClose:   () => void;
  title?:    string;
  children:  React.ReactNode;
  size?:     "sm" | "md" | "lg" | "xl";
  footer?:   React.ReactNode;
}

const MODAL_WIDTHS = { sm: 420, md: 560, lg: 720, xl: 900 };

export function Modal({ open, onClose, title, children, size = "md", footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position:        "fixed",
        inset:           0,
        background:      "rgba(0, 0, 0, 0.5)",
        backdropFilter:  "blur(4px)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        zIndex:          999,
        padding:         16,
        animation:       "fade-in-fast 0.2s ease-out",
      }}
    >
      <div style={{
        background:   "var(--bg-card)",
        border:       "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        boxShadow:    "var(--shadow-xl)",
        width:        "100%",
        maxWidth:     MODAL_WIDTHS[size],
        maxHeight:    "90vh",
        overflow:     "hidden",
        display:      "flex",
        flexDirection:"column",
        animation:    "scale-in 0.25s ease-out",
        fontFamily:   "var(--font-ui)",
      }}>
        {/* Header */}
        {title && (
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "16px 20px",
            borderBottom:   "1px solid var(--border)",
            flexShrink:     0,
          }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              {title}
            </h3>
            <button onClick={onClose} style={{
              background: "var(--bg-surface)",
              border:     "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-muted)", fontSize: 14,
            }}>X</button>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding:    "14px 20px",
            borderTop:  "1px solid var(--border)",
            display:    "flex",
            justifyContent: "flex-end",
            gap:        10,
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================================
// STAT CARD
// ================================================================
interface StatCardProps {
  label:    string;
  value:    string | number;
  sub?:     string;
  icon?:    React.ReactNode;
  color?:   string;
  bg?:      string;
  trend?:   { value: number; label?: string };
  style?:   React.CSSProperties;
}

export function StatCard({ label, value, sub, icon, color, bg, trend, style }: StatCardProps) {
  return (
    <div style={{
      background:   bg || "var(--bg-card)",
      border:       "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding:      "16px 14px",
      fontFamily:   "var(--font-ui)",
      ...style,
    }}>
      {icon && (
        <div style={{
          width: 36, height: 36, borderRadius: "var(--radius-md)",
          background: color ? color + "18" : "var(--accent-light)",
          color: color || "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, marginBottom: 10,
        }}>
          {icon}
        </div>
      )}
      <div style={{
        fontSize:    typeof value === "string" && value.length > 6 ? "1.5rem" : "1.875rem",
        fontWeight:  800,
        letterSpacing: "-0.03em",
        color:       color || "var(--accent)",
        lineHeight:  1.1,
        marginBottom: 4,
        fontFamily:  "var(--font-ui)",
      }}>
        {value}
      </div>
      <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: sub ? 3 : 0 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{sub}</div>}
      {trend && (
        <div style={{
          fontSize:   "0.75rem",
          fontWeight: 600,
          color:      trend.value >= 0 ? "var(--success)" : "var(--error)",
          marginTop:  6,
          display:    "flex",
          alignItems: "center",
          gap:        3,
        }}>
          {trend.value >= 0 ? "up" : "down"} {Math.abs(trend.value)}%{trend.label && ` ${trend.label}`}
        </div>
      )}
    </div>
  );
}

// ================================================================
// TOOLTIP
// ================================================================
interface TooltipProps {
  children:  React.ReactNode;
  content:   string;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, content, position = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const posStyle: React.CSSProperties = {
    top:    position === "bottom" ? "calc(100% + 6px)" : position === "top" ? undefined : "50%",
    bottom: position === "top"    ? "calc(100% + 6px)" : undefined,
    left:   position === "right"  ? "calc(100% + 6px)" : position === "left" ? undefined : "50%",
    right:  position === "left"   ? "calc(100% + 6px)" : undefined,
    transform: (position === "top" || position === "bottom") ? "translateX(-50%)"
             : (position === "left" || position === "right") ? "translateY(-50%)" : undefined,
  };

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span style={{
          position:     "absolute",
          background:   "var(--text-primary)",
          color:        "var(--bg-page)",
          fontSize:     "0.6875rem",
          fontWeight:   500,
          padding:      "5px 9px",
          borderRadius: "var(--radius-sm)",
          whiteSpace:   "nowrap",
          zIndex:       999,
          pointerEvents:"none",
          fontFamily:   "var(--font-ui)",
          boxShadow:    "var(--shadow-md)",
          animation:    "fade-in-fast 0.15s ease-out",
          ...posStyle,
        }}>
          {content}
        </span>
      )}
    </span>
  );
}

// ================================================================
// DIVIDER
// ================================================================
interface DividerProps {
  label?:  string;
  style?:  React.CSSProperties;
  vertical?: boolean;
}

export function Divider({ label, style, vertical }: DividerProps) {
  if (vertical) {
    return <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch", flexShrink: 0, ...style }} />;
  }

  if (label) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "var(--space-6) 0", ...style }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap", fontFamily: "var(--font-ui)" }}>
          {label}
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>
    );
  }

  return <div style={{ height: 1, background: "var(--border)", margin: "var(--space-6) 0", ...style }} />;
}

// ================================================================
// EMPTY STATE
// ================================================================
interface EmptyStateProps {
  icon?:     string;
  title:     string;
  sub?:      string;
  action?:   React.ReactNode;
  style?:    React.CSSProperties;
}

export function EmptyState({ icon, title, sub, action, style }: EmptyStateProps) {
  return (
    <div style={{
      textAlign:    "center",
      padding:      "48px 24px",
      fontFamily:   "var(--font-ui)",
      ...style,
    }}>
      {icon && <div style={{ fontSize: 44, marginBottom: 14, lineHeight: 1 }}>{icon}</div>}
      <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 18, maxWidth: 340, margin: "0 auto 18px" }}>{sub}</div>}
      {action}
    </div>
  );
}

// ================================================================
// CALLOUT (lesson highlight box)
// ================================================================
interface CalloutProps {
  icon?:     string;
  title?:    string;
  children:  React.ReactNode;
  variant?:  "default" | "tip" | "warning" | "key";
  style?:    React.CSSProperties;
}

const CALLOUT_VARIANTS = {
  default: { bg: "var(--accent-light)",  border: "var(--accent-muted)",  icon: "Tip" },
  tip:     { bg: "var(--success-light)", border: "var(--success)",       icon: "OK" },
  warning: { bg: "var(--warning-light)", border: "var(--warning)",       icon: "!" },
  key:     { bg: "var(--gold-light)",    border: "var(--gold)",          icon: "Key" },
};

export function Callout({ icon, title, children, variant = "default", style }: CalloutProps) {
  const cfg = CALLOUT_VARIANTS[variant];
  return (
    <div style={{
      background:   cfg.bg,
      border:       `1.5px solid ${cfg.border}`,
      borderRadius: "var(--radius-md)",
      padding:      "14px 16px",
      display:      "flex",
      gap:          12,
      fontFamily:   "var(--font-ui)",
      marginBottom: "1.25em",
      ...style,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{icon || cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SPINNER
// ================================================================
export function Spinner({ size = 20, color }: { size?: number; color?: string }) {
  return (
    <div style={{
      width:       size,
      height:      size,
      border:      `2px solid ${color || "var(--border)"}`,
      borderTopColor: color || "var(--accent)",
      borderRadius:"50%",
      flexShrink:  0,
      animation:   "spin 0.7s linear infinite",
    }} />
  );
}

// ================================================================
// AVATAR
// ================================================================
interface AvatarProps {
  name?:   string;
  src?:    string;
  size?:   number;
  color?:  string;
  style?:  React.CSSProperties;
}

export function Avatar({ name, src, size = 36, color, style }: AvatarProps) {
  const initials = name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div style={{
      width:          size,
      height:         size,
      borderRadius:   "50%",
      background:     color || "var(--accent)",
      color:          "#fff",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      fontSize:       size * 0.38,
      fontWeight:     700,
      fontFamily:     "var(--font-ui)",
      flexShrink:     0,
      overflow:       "hidden",
      ...style,
    }}>
      {src ? (
        <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : initials}
    </div>
  );
}

// ================================================================
// TOGGLE / SWITCH
// ================================================================
interface ToggleProps {
  checked:   boolean;
  onChange:  (v: boolean) => void;
  label?:    string;
  size?:     "sm" | "md";
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, size = "md", disabled }: ToggleProps) {
  const w = size === "sm" ? 36 : 44;
  const h = size === "sm" ? 20 : 24;
  const k = size === "sm" ? 14 : 18;

  return (
    <label style={{
      display:    "flex",
      alignItems: "center",
      gap:        8,
      cursor:     disabled ? "not-allowed" : "pointer",
      opacity:    disabled ? 0.6 : 1,
      fontFamily: "var(--font-ui)",
      fontSize:   "0.875rem",
      color:      "var(--text-secondary)",
    }}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width:       w,
          height:      h,
          borderRadius:"var(--radius-full)",
          background:  checked ? "var(--accent)" : "var(--border-strong)",
          position:    "relative",
          flexShrink:  0,
          transition:  "background var(--transition-fast)",
        }}
      >
        <div style={{
          position:   "absolute",
          top:        (h - k) / 2,
          left:       checked ? w - k - (h - k) / 2 : (h - k) / 2,
          width:      k,
          height:     k,
          borderRadius:"50%",
          background: "#fff",
          boxShadow:  "var(--shadow-sm)",
          transition: "left var(--transition-fast)",
        }} />
      </div>
      {label}
    </label>
  );
}

// ================================================================
// SECTION HEADER (reusable page section header)
// ================================================================
interface SectionHeaderProps {
  title:     string;
  sub?:      string;
  badge?:    string;
  action?:   React.ReactNode;
  align?:    "left" | "center";
  style?:    React.CSSProperties;
}

export function SectionHeader({ title, sub, badge, action, align = "left", style }: SectionHeaderProps) {
  return (
    <div style={{
      display:        "flex",
      justifyContent: action ? "space-between" : align === "center" ? "center" : "flex-start",
      alignItems:     "flex-start",
      marginBottom:   "var(--space-6)",
      flexWrap:       "wrap",
      gap:            12,
      textAlign:      align,
      fontFamily:     "var(--font-ui)",
      ...style,
    }}>
      <div>
        {badge && <Badge variant="accent" style={{ marginBottom: 8 }}>{badge}</Badge>}
        <h2 style={{
          fontSize:      "clamp(1.25rem, 2.5vw, 1.625rem)",
          fontWeight:    700,
          letterSpacing: "-0.025em",
          color:         "var(--text-primary)",
          margin:        0,
          lineHeight:    1.25,
        }}>{title}</h2>
        {sub && (
          <p style={{
            fontSize: "0.9375rem",
            color:    "var(--text-muted)",
            marginTop: 5,
            lineHeight: 1.6,
          }}>{sub}</p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
