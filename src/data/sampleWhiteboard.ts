// Realistic whiteboard SVG encoded for instant demo loading and preview
const svgWhiteboard = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" width="100%" height="100%">
  <defs>
    <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141c2e" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="chalkGlow">
      <feGaussianBlur stdDeviation="0.6" result="blur" />
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Board frame -->
  <rect x="10" y="10" width="880" height="540" rx="16" fill="#1e293b" stroke="#334155" stroke-width="4"/>
  <rect x="22" y="22" width="856" height="516" rx="10" fill="url(#boardGrad)"/>

  <!-- Classroom Board Header -->
  <text x="50" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="28" fill="#38bdf8" filter="url(#chalkGlow)">
    CS 101: Lecture 14 — Binary Search Algorithm
  </text>
  <text x="50" y="92" font-family="monospace" font-size="14" fill="#94a3b8">
    Prof. Miller | Mon 10:00 AM | Room 402
  </text>
  <line x1="50" y1="108" x2="850" y2="108" stroke="#334155" stroke-width="2" stroke-dasharray="6,4"/>

  <!-- Key Rule Section -->
  <rect x="50" y="125" width="360" height="100" rx="8" fill="#1e293b" fill-opacity="0.8" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="70" y="152" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="16" fill="#f59e0b">
    ⚠️ ABSOLUTE PREREQUISITE
  </text>
  <text x="70" y="180" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" fill="#f1f5f9">
    • Array MUST be sorted in ascending order!
  </text>
  <text x="70" y="206" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" fill="#cbd5e1">
    • If unordered, binary search WILL FAIL!
  </text>

  <!-- Array visualizer -->
  <rect x="430" y="125" width="420" height="100" rx="8" fill="#1e293b" fill-opacity="0.8" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="450" y="152" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="16" fill="#38bdf8">
    Sorted Array A [0..9]
  </text>
  <!-- Array cells -->
  <g transform="translate(450, 168)" font-family="monospace" font-size="13">
    <rect x="0" y="0" width="36" height="32" fill="#0f172a" stroke="#475569"/>
    <text x="11" y="21" fill="#f8fafc">2</text>
    <rect x="36" y="0" width="36" height="32" fill="#0f172a" stroke="#475569"/>
    <text x="47" y="21" fill="#f8fafc">5</text>
    <rect x="72" y="0" width="36" height="32" fill="#0f172a" stroke="#475569"/>
    <text x="83" y="21" fill="#f8fafc">8</text>
    <rect x="108" y="0" width="36" height="32" fill="#0f172a" stroke="#475569"/>
    <text x="114" y="21" fill="#f8fafc">12</text>
    <rect x="144" y="0" width="36" height="32" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
    <text x="150" y="21" fill="#ffffff" font-weight="bold">16</text>
    <text x="148" y="48" fill="#38bdf8" font-size="11">mid</text>
    <rect x="180" y="0" width="36" height="32" fill="#0f172a" stroke="#475569"/>
    <text x="186" y="21" fill="#f8fafc">23</text>
    <rect x="216" y="0" width="36" height="32" fill="#0f172a" stroke="#475569"/>
    <text x="222" y="21" fill="#f8fafc">38</text>
    <rect x="252" y="0" width="36" height="32" fill="#0f172a" stroke="#475569"/>
    <text x="258" y="21" fill="#f8fafc">56</text>
    <rect x="288" y="0" width="36" height="32" fill="#0f172a" stroke="#475569"/>
    <text x="294" y="21" fill="#f8fafc">72</text>
    <rect x="324" y="0" width="36" height="32" fill="#0f172a" stroke="#475569"/>
    <text x="330" y="21" fill="#f8fafc">91</text>
  </g>

  <!-- Midpoint Formula Section -->
  <rect x="50" y="245" width="360" height="140" rx="8" fill="#1e293b" fill-opacity="0.8" stroke="#10b981" stroke-width="1.5"/>
  <text x="70" y="272" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="16" fill="#34d399">
    Formula &amp; Overflow Guard
  </text>
  <text x="70" y="302" font-family="monospace" font-size="15" fill="#a7f3d0">
    mid = low + (high - low) / 2
  </text>
  <text x="70" y="332" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" fill="#cbd5e1">
    Why not (low + high) / 2?
  </text>
  <text x="70" y="358" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" fill="#94a3b8">
    → In Java/C++, low + high can exceed 2^31 - 1!
  </text>

  <!-- Space Halving Tree -->
  <rect x="430" y="245" width="420" height="260" rx="8" fill="#1e293b" fill-opacity="0.8" stroke="#818cf8" stroke-width="1.5"/>
  <text x="450" y="272" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="16" fill="#a5b4fc">
    Halving Search Space → Time Complexity
  </text>
  
  <g transform="translate(460, 290)" font-family="monospace" font-size="13" fill="#e2e8f0">
    <text x="0" y="20" fill="#38bdf8" font-weight="bold">N = 16 elements</text>
    <text x="240" y="20" fill="#94a3b8">Step 0</text>
    
    <text x="30" y="50" fill="#64748b">↓ divide by 2</text>
    <text x="0" y="80" fill="#a5b4fc" font-weight="bold">N/2 = 8 elements</text>
    <text x="240" y="80" fill="#94a3b8">Step 1</text>
    
    <text x="30" y="110" fill="#64748b">↓ divide by 2</text>
    <text x="0" y="140" fill="#c084fc" font-weight="bold">N/4 = 4 elements</text>
    <text x="240" y="140" fill="#94a3b8">Step 2</text>
    
    <text x="30" y="170" fill="#64748b">↓ divide by 2</text>
    <text x="0" y="195" fill="#f472b6" font-weight="bold">N/8 = 2 → 1 element</text>
    <text x="240" y="195" fill="#94a3b8">Step 4 (Found!)</text>
  </g>

  <!-- Complexity Highlight -->
  <rect x="50" y="405" width="360" height="100" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="2"/>
  <text x="70" y="435" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="20" fill="#ffffff">
    TIME COMPLEXITY: O(log₂ n)
  </text>
  <text x="70" y="465" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" fill="#c7d2fe">
    Number of steps k satisfies: 2^k = N  ==>  k = log₂(N)
  </text>
  <text x="70" y="488" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" fill="#a5b4fc">
    Space Complexity: O(1) iterative
  </text>

  <!-- Board Eraser in bottom tray -->
  <rect x="730" y="522" width="70" height="12" rx="3" fill="#78350f" stroke="#92400e"/>
</svg>`;

export const SAMPLE_WHITEBOARD_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(svgWhiteboard)}`;
