---
"@cloudflare/containers-shared": minor
---

Suppress Docker stderr from optional previous-image discovery during experimental build-output cleanup

Successful builds without local Container images no longer print misleading Docker errors when Docker or its daemon is unavailable. Discovery remains best effort, existing project-owned images are still cleaned up, and required Container build failures remain actionable.
