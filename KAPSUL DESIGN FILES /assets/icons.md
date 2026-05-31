# Icon strategy

Kapsul uses **Lucide** (stroke-based, 1.5–2px weight). The codebase imports `lucide-react@0.562.0`; for static HTML cards we load Lucide via CDN.

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<i data-lucide="search" class="size-5"></i>
<script>lucide.createIcons();</script>
```

## Sizes
- 14px — inside chips
- 16–18px — nav, inline
- 20px — toolbar, buttons
- 24–32px — hero / empty-state

## Domain coloring
| Color | Used for |
|---|---|
| `blue-600` | navigation, AI, primary |
| `emerald-600` | sync, success, "Live" |
| `orange-500/600` | warning, Moodle, PowerPoint, alternate-mode |
| `purple-500` | Canva, RNCP |
| `amber-500` | Gamma |
| `red-600` | destructive (logout) |

## Connector tiles
Codebase ships placeholder emoji / single-letter tiles for Microsoft, Notion, Moodle, Slack, GitHub, Discord, Zoom, Teams, Google Workspace, Gamma, Canva. Drop official SVGs in `assets/integrations/` when available.

## The K mark
Rendered live as a `40×40 rounded-xl` tile filled with `--kp-gradient-energy`, white bold "K" centred. See `assets/logo.html`.
