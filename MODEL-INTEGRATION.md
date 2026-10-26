# GST model integration

## Current flow

The Vite app uses the existing Render FastAPI backend through `VITE_API_BASE_URL`. The model integration is additive; legacy routes such as `/api/pipeline/run` and `/api/upload/reconcile` remain available. The app's model flow uses:

| Route | Purpose |
| --- | --- |
| `GET /api/model/invoices?session_id=demo&offset=0&limit=100` | Load the unscored demo preview and its source-derived summary. |
| `POST /api/model/pipeline/run` | With no session, score the full demo; with an upload session, return its explicit unscored result. |
| `GET /api/model/invoices?session_id=...` | Fetch a page, with server-side search, bucket, match, IRN, AP, filing, and sort filters. |
| `POST /api/model/upload` | Validate and reconcile an uploaded Purchase Register plus optional source CSVs. |

The demo data and model artifacts are bundled under `backend/data/gst_model_demo/` and `backend/gst_model/`. Local start:

```bash
uvicorn backend.main:app --reload --port 8000
npm --prefix vite-app run dev
```

## Model and output contract

The adapter loads the model's 14 declared feature columns from `train_corpus.csv`, using the feature list in the model metadata. It reads that file with an explicit `usecols` list and never loads `self_correct` into the inference frame. The bundled model implementation and `decide()` output are unchanged; batch inference applies its probability thresholds, decision buckets, and statutory-window escalation, then maps buckets for the UI:

| Model bucket | App label |
| --- | --- |
| `IGNORE` | `SAFE TO HOLD` |
| `WATCH` | `WATCH` |
| `CHASE` | `CHASE NOW` |
| `ESCALATE` | `CHASE NOW` |

Each decision retains the raw bucket, probability, source, reason, and decision-context drivers. The probability is for synthetic later GSTR-2B appearance only—not legal ITC eligibility, payment recovery, or a validated real-world outcome. Driver text is not SHAP attribution.

The demo corpus has 200,000 invoices and is paginated in 100-row pages. The backend batches inference and computes full-corpus summaries. The bundled `out_B` corpus was used in training, so its predictions are in-sample and are only suitable for exercising the app flow.

## User uploads

The Purchase Register is required. GSTR-2B, GSTR-1, AP aging, and filing history are optional. CSVs are parsed in backend memory and reconciled where possible; upload sessions are temporary, expire after 30 minutes, and are not persisted to a database. The current limits are 50 MB per file and 80 MB combined.

The agreed upload sources do not provide a verified IRN feature. Therefore uploaded rows are returned as `not_scored`, even when AP and filing data are present. The adapter does not infer missing model features or accept `self_correct` as an upload input. Without a GSTR-2B file, match status and unmatched-tax totals are unknown and shown as `-to-be-populated-`.

## Deployment and future persistence

Deploy the FastAPI backend on Render: it needs the bundled CSV corpus, model artifact, metadata, and PyYAML dependency. Keep these assets off the Vercel serverless bundle. Existing API routes are retained for backward compatibility.

Supabase integration is intentionally deferred. The schema reference is `/home/catfish/Downloads/geommy/Schema Visualization.md`; a later authenticated persistence pass can map source rows and decisions to `purchase_invoices`, `gstr2b_rows`, `ap_aging`, `filing_history`, `irn_snapshots`, `mismatches`, and `routing_decisions`. Before writing, add the app's authentication and organization-membership flow and enforce the existing row-level security policies. Do not bypass RLS with a service key.

## Local checks

```bash
pytest -q
npm --prefix vite-app test
npm --prefix vite-app run build
```
