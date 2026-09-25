"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// FinanceHub — Knowledge Graph Visualizer
// components/learn/KnowledgeGraph.tsx
// Interactive SVG graph of concepts + prerequisites + mastery
// ============================================================

type Node = {
  id:          string;
  name:        string;
  slug:        string;
  difficulty:  string;
  track_slugs: string[];
  mastery:     number;   // 0-100
  x:           number;
  y:           number;
};

type Edge = {
  from:     string;
  to:       string;
  strength: "required" | "helpful";
};

type RawConcept = {
  id: string;
  name: string;
  slug: string;
  difficulty: string;
  track_slugs: string[];
};

type RawPrereq = {
  concept_id:  string;
  requires_id: string;
  strength:    "required" | "helpful";
};

type RawMastery = {
  concept_id:    string;
  mastery_score: number;
};

const TRACK_COLORS: Record<string, string> = {
  "personal-finance":    "#1D9E75",
  "trading-markets":     "#185FA5",
  "technical-analysis":  "#854F0B",
  "crypto-defi":         "#7C3AED",
  "corporate-finance":   "#B91C1C",
  "behavioral-finance":  "#D39A21",
  "forex-currency":      "#0E6163",
};

const DIFFICULTY_RADIUS: Record<string, number> = {
  beginner:     28,
  intermediate: 34,
  advanced:     40,
};

interface KnowledgeGraphProps {
  trackSlug?:  string;
  height?:     number;
  showLegend?: boolean;
}

export default function KnowledgeGraph({
  trackSlug,
  height = 560,
  showLegend = true,
}: KnowledgeGraphProps) {
  const svgRef       = useRef<SVGSVGElement>(null);
  const [nodes,      setNodes]      = useState<Node[]>([]);
  const [edges,      setEdges]      = useState<Edge[]>([]);
  const [selected,   setSelected]   = useState<Node | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [transform,  setTransform]  = useState({ x: 0, y: 0, scale: 1 });
  const [dragging,   setDragging]   = useState(false);
  const [dragStart,  setDragStart]  = useState({ x: 0, y: 0 });
  const [filterTrack,setFilterTrack]= useState(trackSlug || "all");
  const [width,      setWidth]      = useState(900);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive width
  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width || 900);
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Force-directed layout (simple version)
  const layoutNodes = useCallback((
    rawNodes: RawConcept[],
    rawEdges: Edge[],
    masteryMap: Map<string, number>,
  ): Node[] => {
    const W = width;
    const H = height;
    const nodeMap = new Map<string, Node>();

    // Group by difficulty for initial placement
    const byDiff: Record<string, RawConcept[]> = {
      beginner:     rawNodes.filter(n => n.difficulty === "beginner"),
      intermediate: rawNodes.filter(n => n.difficulty === "intermediate"),
      advanced:     rawNodes.filter(n => n.difficulty === "advanced"),
    };

    Object.entries(byDiff).forEach(([diff, group]) => {
      const rowY = diff === "beginner" ? H * 0.75 : diff === "intermediate" ? H * 0.45 : H * 0.18;
      group.forEach((n, i) => {
        const cols   = group.length;
        const xSpacing = W / (cols + 1);
        const x      = xSpacing * (i + 1);
        const jitter = (Math.random() - 0.5) * 30;
        nodeMap.set(n.id, {
          ...n,
          mastery: masteryMap.get(n.id) || 0,
          x: x + jitter,
          y: rowY + jitter,
        });
      });
    });

    // Simple force iterations to spread nodes
    const nodeArr = Array.from(nodeMap.values());
    for (let iter = 0; iter < 60; iter++) {
      // Repulsion between all nodes
      for (let i = 0; i < nodeArr.length; i++) {
        for (let j = i + 1; j < nodeArr.length; j++) {
          const dx   = nodeArr[j].x - nodeArr[i].x;
          const dy   = nodeArr[j].y - nodeArr[i].y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          const minDist = 80;
          if (dist < minDist) {
            const force = (minDist - dist) / dist * 0.5;
            nodeArr[i].x -= dx * force;
            nodeArr[i].y -= dy * force * 0.3;
            nodeArr[j].x += dx * force;
            nodeArr[j].y += dy * force * 0.3;
          }
        }
      }

      // Attraction along edges
      rawEdges.forEach(edge => {
        const a = nodeMap.get(edge.from);
        const b = nodeMap.get(edge.to);
        if (!a || !b) return;
        const dx   = b.x - a.x;
        const dy   = b.y - a.y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        const targetDist = 140;
        const force = (dist - targetDist) / dist * 0.08;
        a.x += dx * force;
        a.y += dy * force * 0.2;
        b.x -= dx * force;
        b.y -= dy * force * 0.2;
      });

      // Keep within bounds
      nodeArr.forEach(n => {
        n.x = Math.max(50, Math.min(W - 50, n.x));
        n.y = Math.max(50, Math.min(H - 50, n.y));
      });
    }

    return nodeArr;
  }, [width, height]);

  // Load data
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      let conceptQuery = supabase
        .from("concepts")
        .select("id,name,slug,difficulty,track_slugs")
        .eq("is_published", true);

      if (filterTrack !== "all") {
        conceptQuery = conceptQuery.contains("track_slugs", [filterTrack]);
      }

      const [{ data: conceptsData }, { data: prereqData }, { data: masteryData }] = await Promise.all([
        conceptQuery.limit(50),
        supabase.from("concept_prerequisites").select("concept_id,requires_id,strength"),
        user
          ? supabase.from("user_concept_mastery").select("concept_id,mastery_score").eq("user_id", user.id)
          : { data: [] },
      ]);

      const concepts = (conceptsData as unknown) as RawConcept[];
      const prereqs  = (prereqData  as unknown) as RawPrereq[];

      const masteryMap = new Map(
        ((masteryData as unknown) as RawMastery[]).map(m => [m.concept_id, m.mastery_score])
      );

      const conceptIds = new Set(concepts.map(c => c.id));
      const edges: Edge[] = prereqs
        .filter(p => conceptIds.has(p.concept_id) && conceptIds.has(p.requires_id))
        .map(p => ({ from: p.requires_id, to: p.concept_id, strength: p.strength }));

      const positioned = layoutNodes(concepts, edges, masteryMap);
      setNodes(positioned);
      setEdges(edges);
      setLoading(false);
    })();
  }, [filterTrack, layoutNodes]);

  // Pan/zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).tagName === "circle") return;
    setDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setTransform(t => ({ ...t, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
  };

  const handleMouseUp = () => setDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({ ...t, scale: Math.max(0.4, Math.min(2.5, t.scale * delta)) }));
  };

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  const getMasteryColor = (mastery: number): string => {
    if (mastery === 0)   return "#CBD5E0";
    if (mastery < 40)    return "#FC8181";
    if (mastery < 70)    return "#F6AD55";
    if (mastery < 90)    return "#68D391";
    return "#1D9E75";
  };

  const getTrackColor = (node: Node): string => {
    const track = node.track_slugs?.[0];
    return TRACK_COLORS[track] || "#718096";
  };

  const tracks = Object.keys(TRACK_COLORS);

  if (loading) {
    return (
      <div ref={containerRef} style={{
        height, background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center", fontFamily: "var(--font-ui,system-ui)" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#0E6163", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "#718096" }}>Building knowledge graph…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "var(--font-ui,system-ui)" }}>
      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        {/* Track filter */}
        <select
          value={filterTrack}
          onChange={e => setFilterTrack(e.target.value)}
          style={{
            padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 8,
            fontSize: 13, background: "#fff", cursor: "pointer",
            fontFamily: "var(--font-ui,system-ui)", color: "#1c2b3a",
          }}
        >
          <option value="all">All tracks</option>
          {tracks.map(t => (
            <option key={t} value={t}>{t.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>
          ))}
        </select>

        <div style={{ fontSize: 12, color: "#718096", marginLeft: 4 }}>
          {nodes.length} concepts · {edges.length} connections
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={() => setTransform(t => ({ ...t, scale: Math.min(2.5, t.scale * 1.2) }))}
            style={{ width: 32, height: 32, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 16 }}>
            +
          </button>
          <button onClick={() => setTransform(t => ({ ...t, scale: Math.max(0.4, t.scale * 0.8) }))}
            style={{ width: 32, height: 32, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 16 }}>
            −
          </button>
          <button onClick={resetView}
            style={{ padding: "0 10px", height: 32, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 11, color: "#718096" }}>
            Reset
          </button>
        </div>
      </div>

      {/* Main graph */}
      <div ref={containerRef} style={{
        position:  "relative",
        background: "var(--bg-base,#f7f4ee)",
        border:    "1px solid #e2e8f0",
        borderRadius: 14,
        overflow:  "hidden",
        height,
        cursor:    dragging ? "grabbing" : "grab",
      }}>
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ userSelect: "none" }}
        >
          <defs>
            {/* Arrow marker for edges */}
            <marker id="arrow-required" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#CBD5E0" />
            </marker>
            <marker id="arrow-helpful" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#EDF2F7" />
            </marker>
            {/* Glow filter for selected node */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
            {/* Edges */}
            {edges.map((edge, i) => {
              const from = nodes.find(n => n.id === edge.from);
              const to   = nodes.find(n => n.id === edge.to);
              if (!from || !to) return null;

              const isHighlighted = selected && (selected.id === edge.from || selected.id === edge.to);
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const len = Math.sqrt(dx*dx + dy*dy);
              const toRadius = DIFFICULTY_RADIUS[to.difficulty] || 30;
              const ex = to.x - (dx / len) * (toRadius + 6);
              const ey = to.y - (dy / len) * (toRadius + 6);

              return (
                <line key={i}
                  x1={from.x} y1={from.y}
                  x2={ex}     y2={ey}
                  stroke={isHighlighted ? "#0E6163" : edge.strength === "required" ? "#CBD5E0" : "#EDF2F7"}
                  strokeWidth={isHighlighted ? 2.5 : edge.strength === "required" ? 1.5 : 1}
                  strokeDasharray={edge.strength === "helpful" ? "5,4" : "none"}
                  markerEnd={`url(#arrow-${edge.strength})`}
                  opacity={selected && !isHighlighted ? 0.2 : 1}
                  style={{ transition: "opacity 0.2s" }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const radius    = DIFFICULTY_RADIUS[node.difficulty] || 30;
              const trackColor= getTrackColor(node);
              const masteryColor = getMasteryColor(node.mastery);
              const isSelected = selected?.id === node.id;
              const isRelated  = selected && edges.some(e =>
                (e.from === selected.id && e.to === node.id) ||
                (e.to === selected.id && e.from === node.id)
              );
              const opacity = selected && !isSelected && !isRelated ? 0.25 : 1;

              // Mastery arc
              const circumference = 2 * Math.PI * radius;
              const masteryOffset = circumference - (node.mastery / 100) * circumference;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  style={{ cursor: "pointer", opacity, transition: "opacity 0.2s" }}
                  onClick={() => setSelected(s => s?.id === node.id ? null : node)}
                >
                  {/* Shadow */}
                  <circle r={radius + 2} fill="rgba(0,0,0,0.06)" transform="translate(2,3)" />

                  {/* Background */}
                  <circle r={radius} fill="#fff" stroke="#e2e8f0" strokeWidth={1.5} />

                  {/* Track color ring */}
                  <circle r={radius} fill="none" stroke={trackColor} strokeWidth={2.5} opacity={0.4} />

                  {/* Mastery arc (clockwise from top) */}
                  {node.mastery > 0 && (
                    <circle
                      r={radius}
                      fill="none"
                      stroke={masteryColor}
                      strokeWidth={3}
                      strokeDasharray={circumference}
                      strokeDashoffset={masteryOffset}
                      strokeLinecap="round"
                      transform="rotate(-90)"
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                  )}

                  {/* Selected ring */}
                  {isSelected && (
                    <circle r={radius + 4} fill="none" stroke="#0E6163" strokeWidth={2.5} filter="url(#glow)" />
                  )}

                  {/* Node label */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: radius > 34 ? 10 : 9,
                      fontWeight: isSelected ? 700 : 600,
                      fill: isSelected ? "#0E6163" : "#1c2b3a",
                      fontFamily: "var(--font-ui,system-ui)",
                      pointerEvents: "none",
                    }}
                  >
                    {node.name.length > 16
                      ? node.name.split(" ").map((word, i, arr) =>
                          <tspan key={i} x="0" dy={i === 0 ? (arr.length > 1 ? "-0.5em" : "0") : "1.1em"}>{word}</tspan>
                        )
                      : node.name
                    }
                  </text>

                  {/* Mastery percentage (small) */}
                  {node.mastery > 0 && (
                    <text
                      y={radius - 7}
                      textAnchor="middle"
                      style={{ fontSize: 8, fill: masteryColor, fontWeight: 700, fontFamily: "monospace", pointerEvents: "none" }}
                    >
                      {Math.round(node.mastery)}%
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected node info panel */}
        {selected && (
          <div style={{
            position:   "absolute",
            bottom:     14,
            left:       14,
            right:      14,
            background: "#fff",
            border:     "1px solid #e2e8f0",
            borderRadius: 12,
            padding:    "14px 16px",
            boxShadow:  "0 10px 30px rgba(0,0,0,0.12)",
            display:    "flex",
            gap:        14,
            alignItems: "flex-start",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1c2b3a", margin: 0 }}>{selected.name}</h3>
                <span style={{
                  fontSize: 10, padding: "1px 6px", borderRadius: 8, fontWeight: 700,
                  background: "#EBF8FF", color: "#2C5282", textTransform: "capitalize",
                }}>
                  {selected.difficulty}
                </span>
              </div>

              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#718096" }}>
                <span>
                  {edges.filter(e => e.to === selected.id).length} prerequisite{edges.filter(e => e.to === selected.id).length !== 1 ? "s" : ""}
                </span>
                <span>
                  {edges.filter(e => e.from === selected.id).length} unlock{edges.filter(e => e.from === selected.id).length !== 1 ? "s" : ""}
                </span>
                <span style={{ color: getMasteryColor(selected.mastery), fontWeight: 600 }}>
                  {selected.mastery > 0 ? `${Math.round(selected.mastery)}% mastered` : "Not started"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <a href={`/glossary/${selected.slug}`}
                style={{ padding: "7px 12px", background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#0E6163", textDecoration: "none", fontWeight: 600 }}>
                Learn →
              </a>
              <button onClick={() => setSelected(null)}
                style={{ padding: "7px 10px", background: "none", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "#718096" }}>
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Hint */}
        {!selected && (
          <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#a0aec0", background: "rgba(255,255,255,0.9)", padding: "4px 12px", borderRadius: 20, pointerEvents: "none" }}>
            Click a concept · Drag to pan · Scroll to zoom
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap", fontSize: 12, color: "#718096" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 28, height: 2, background: "#CBD5E0" }} />
            <span>Required prerequisite</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 28, height: 2, background: "#EDF2F7", borderTop: "2px dashed #CBD5E0" }} />
            <span>Helpful prerequisite</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#CBD5E0" }} />
            <span>Not started</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#1D9E75" }} />
            <span>Mastered (80%+)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>Ring colour = track · Arc = mastery level</span>
          </div>
        </div>
      )}
    </div>
  );
}
