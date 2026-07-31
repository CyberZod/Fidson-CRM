# FieldForce architecture: contracts, ports, adapters, artifacts and enablers

A self-contained explainer of how the FieldForce backend is structured and why. It ties the planning work (the user stories and the artifact registry) to the code patterns we build with. Written to be readable on its own, so it can be pasted into a fresh conversation as context.

Backend language: **Python + FastAPI**, with **Pydantic** models as the contracts. Frontend: **React + TypeScript**, consuming the backend through its auto-generated OpenAPI contract.

---

## The one idea everything rests on

> **A consumer binds to a contract (a shape), never to a source. So any source, fake or real, can sit behind the contract without the consumer noticing.**

Everything below is that sentence applied at different seams: backend-to-backend, backend-to-frontend, and shared machinery between stories. Get this one idea and the rest is naming.

---

## The five pieces

### 1. The data contract (the shape)

The exact fields and types of a piece of data. In our registry each artifact (Check-in, Order, Account) is one of these. In code it is a Pydantic model.

```python
from pydantic import BaseModel

class Coordinates(BaseModel):
    lat: float
    long: float
```

Pydantic enforces the shape at runtime: if something tries to build this from `{"latitude": 6.4}`, it raises immediately, before bad data reaches the business logic. The registry becomes enforced code, not just a document.

### 2. The port (the contract as an interface)

A named promise: "anything that wants to supply X must provide this method, returning that shape." It says nothing about **where** the data comes from. In Python it is an abstract base class (`ABC`) or a `Protocol`.

```python
from abc import ABC, abstractmethod

class CustomerRepositoryPort(ABC):
    @abstractmethod
    def get_customer_location(self, customer_id: str) -> Coordinates:
        ...
```

There is one port per artifact seam. Anything that produces or requires that artifact goes through the port.

### 3. Adapters (the swappable sources)

Concrete implementations of a port, one per source. Each adapter's real job is to **translate a foreign shape into the port's shape**. All adapters for a port are interchangeable.

```python
class ErpAccountAdapter(CustomerRepositoryPort):
    def get_customer_location(self, customer_id: str) -> Coordinates:
        erp = call_erp(customer_id)                 # foreign shape
        return Coordinates(lat=erp["Lat"], long=erp["Lng"])   # our shape

class SpreadsheetAccountAdapter(CustomerRepositoryPort):
    def get_customer_location(self, customer_id: str) -> Coordinates:
        row = self.rows[customer_id]
        return Coordinates(lat=row["lat"], long=row["long"])
```

This is **seed vs sync**: the spreadsheet adapter is the pilot ("seed"), the ERP adapter is national go-live ("sync"). Same port, swap the adapter, the rest of the system is untouched.

### 4. The core (the business logic) — NOT an adapter

The core is the story's actual rules. It is the one thing that is **never swappable and never an adapter**. That is the entire reason we protect it behind ports. Adapters are the interchangeable edges; the core is the fixed centre.

The core is **surrounded by adapters on two sides**, which is what makes it easy to mistake for one:

```
   [ FastAPI route ]  ──calls──►  [  CORE  ]  ──calls──►  [ ERP adapter    ]
   (driving adapter)              (the rules,             [ spreadsheet    ]
   frontend hits this)             NOT an adapter)        [ Postgres store ]
                                                          (driven adapters)
```

- **Driving adapters** call *into* the core: the FastAPI endpoint, a CLI, a test. The frontend drives the core through one of these.
- **Driven adapters** are called *by* the core: the ERP, the spreadsheet, the database.

The core is called by one side and calls the other. It is neither.

```python
class VisitService:                                   # the Check-in story's core
    def __init__(self, customers: CustomerRepositoryPort):
        self.customers = customers                    # dependency injected IN

    def check_in(self, customer_id: str, current_gps: Coordinates) -> dict:
        shop = self.customers.get_customer_location(customer_id)
        verified = self._distance(current_gps, shop) <= 100
        # RULE: flag, never block (matches Story 3 Acceptance Criteria)
        return {"status": "checked_in", "verified": verified}
```

The critical line is `def __init__(self, customers: CustomerRepositoryPort)`: the source is handed **in**. The core never reaches out to grab one, never imports the ERP. That is **dependency inversion**: the core points at the port, not at any source.

### 5. Enablers (shared behaviour, reused by many stories)

An enabler is **not data**. It is a piece of **shared machinery** many stories need: the approval engine, the scoping/RBAC engine, the offline-sync engine, notifications, the AI service.

Two things make it different from an artifact and from a single story's core:

1. **Used by many stories, not one.** The approval engine serves plan approval (Story 2), clinical-meeting decisions (15), discount decisions (25), promo decisions (38).
2. **No standalone user value.** You cannot demo "the RBAC engine" to Fidson as a milestone. It only has value inside a story.

So it cannot be its own board story (a story must deliver acceptable value), and you do not want to build it four times. The rule: **an enabler is born as a subtask under the first story that needs it, then reused by the rest** ("the repo remembers, not Jira"). In code it is usually a **service behind its own port** that story cores depend on, exactly like a data source, except what is behind the port is shared *behaviour*, not a source.

---

## Artifact vs Adapter vs Enabler

| | What it is | Example | On the Jira board |
|---|---|---|---|
| **Artifact** | data with a shape, flows between stories | Check-in, Order, Account | the Pydantic model, built in a story's **Contract & backend** subtask |
| **Adapter** | a source that fills a port | ERP, spreadsheet, hardcode, Postgres | part of **Contract & backend** |
| **Enabler** | shared behaviour many stories reuse | approval engine, scoping, offline sync | an **Enabler** subtask under its first-consumer story; wired into later ones |

---

## The same pattern at the frontend seam

The frontend is just another consumer of a contract. It binds to the backend's shape (the OpenAPI contract FastAPI generates), not to how the backend works.

- To build a screen before the backend exists, point it at a **mock**: hardcoded JSON shaped exactly like the real response. That is the frontend's version of a **seed**.
- Later you swap the mock for the real backend. That swap (mock -> real backend) is the *same swap* as seed -> live sync, at a different seam.

This is why our subtasks split the way they do:

- **Frontend / UI** builds the screen against the mock (its seed).
- **Integration & receiving-end demo** swaps the mock for the real backend and proves a real action crosses to the real screen (a rep checks in, the manager sees it live).

---

## Frontend enablers: shared components and custom hooks

Enablers exist on the frontend too, so we never copy-paste UI across screens (which is slow, error-prone, and something external devs bill for repeatedly). Frontend reuse splits into two kinds:

- **Shared component** = reuse of *look and structure*. The visual building blocks: `<Button>`, `<Modal>`, `<DataTable>`, `<StatusBadge>`, `<ApprovalQueue>`. Built once, dropped into any screen. This is the component library / design system.
- **Custom hook** = reuse of *behaviour and state logic*. Fetching, caching, offline queueing, scoping, form handling: `useCheckin()`, `useApprovals()`, `useOfflineSync()`, `useScopedData()`. This is the closest match to a backend enabler, because it reuses behaviour, not just appearance.

| Backend | Frontend | What's reused |
|---|---|---|
| Enabler (engine, service) | **Custom hook** | behaviour / logic |
| (no direct data analogue) | **Shared component** | look / structure |
| Generated API client | the typed client the hooks call | the contract itself |

The symmetry with the backend approval enabler: the same four decide-stories (plan 2, clinical meeting 15, discount 25, promo 38) that reuse the backend `ApprovalEngine` also reuse one shared component and one hook on the frontend.

```tsx
// CUSTOM HOOK: shared behaviour (the frontend "enabler"), built once, used by every decide-screen
function useApprovals(kind: string) {
  const [queue, setQueue] = useState<ApprovalItem[]>([]);
  useEffect(() => { api.getApprovals(kind).then(setQueue); }, [kind]);   // api = generated OpenAPI client
  const decide = (id: string, yes: boolean) => api.decide(id, yes);
  return { queue, decide };
}

// SHARED COMPONENT: reused look/structure
function ApprovalQueue({ items, onDecide }: Props) {
  return items.map(i => (
    <Row key={i.id}>
      {i.summary}
      <Button onClick={() => onDecide(i.id, true)}>Approve</Button>
      <Button onClick={() => onDecide(i.id, false)}>Reject</Button>
    </Row>
  ));
}

// A STORY SCREEN = compose the two + a little glue. This is Story 25.
function DiscountDecisionsScreen() {
  const { queue, decide } = useApprovals("discount");        // the hook
  return <ApprovalQueue items={queue} onDecide={decide} />;  // the component
}
```

`DiscountDecisionsScreen` is tiny because it stands on the hook and the component. Story 15's screen is nearly identical with `"clinical_meeting"`. That is the reuse: the fourth decide-screen is "compose existing pieces plus glue," not "build a screen from scratch."

Two points that mirror the backend:

- **The custom hook is where the frontend meets the contract.** `useApprovals` calls `api.getApprovals` / `api.decide`, which is the client generated from the FastAPI OpenAPI spec. The hook is the frontend consumer binding to the backend contract; the component below it does not know the backend exists, it just receives `items` and an `onDecide`.
- **Same "born under the first consumer" rule.** Shared components and hooks are not their own board items, for the same reason enablers are not. `<ApprovalQueue>` and `useApprovals()` are built inside the **Frontend / UI subtask of Story 2** (the first decide-story); Stories 15, 25, 38 reuse them. The repo remembers, not Jira.

## How this maps to the Jira subtasks

Every story on the board has three subtasks, plus an enabler subtask where a shared engine is first needed:

- **Contract & backend** — build the core (business rules) + the data ports and adapters (Pydantic models, ERP/DB adapters). For view-only stories this is **Backend / query** instead, since they produce no artifact.
- **Frontend / UI** — the screen, built against a mock.
- **Integration & receiving-end demo** — connect front to back and prove the output arrives at its consumer's screen. A story is done here, not at the submit button.
- **Enabler** (only on first-consumer stories) — build a shared engine (approval, scoping, sync) behind its own port, so later stories inject it.

---

## How this maps to the artifact registry

- A registry **artifact** = a Pydantic model = a **port's shape**.
- The registry's **"Now: real / seeded"** column = which **adapter** is currently behind the port (hardcode -> seed -> sync).
- **"Consumers bind to the shape, not the source"** (the registry's core principle) = the core taking the port as a constructor argument.
- **Seed at pilot, sync at go-live** = swapping the spreadsheet adapter for the ERP adapter, with no change to any story core.
- The **discovery data audit** (kickoff doc) decides, per artifact, whether the production adapter is an **ERP-sync adapter** (data already structured) or an **admin-screen adapter** (we build the management story). Same port either way.

Note on layers: the registry holds the **data-shape** layer. The full **API contract** (endpoints, request/response, error rules) is generated by FastAPI from the routes and Pydantic models, and pinned down per story in its Contract & backend subtask. A rule in a story's Acceptance Criteria (e.g. "discount over ceiling holds the order for approval") is the same rule the API contract encodes as a response (`422 discount_over_ceiling`). One rule, two audiences.

---

## Appendix A — runnable example: ports and adapters

```python
from dataclasses import dataclass
from typing import Protocol

@dataclass
class Product:
    id: str
    name: str
    unit_price: int
    discount_ceiling: float

# THE PORT: anything with get_product(id) -> Product | None
class CatalogPort(Protocol):
    def get_product(self, product_id: str) -> Product | None: ...

# THREE ADAPTERS, same port, different sources
class HardcodedCatalog:
    def get_product(self, product_id):
        return {"p1": Product("p1", "Astymin", 4500, 0.10)}.get(product_id)

class SpreadsheetCatalog:
    def __init__(self, rows): self.rows = rows
    def get_product(self, product_id):
        row = next((r for r in self.rows if r["sku"] == product_id), None)
        if row is None: return None
        return Product(row["sku"], row["label"], row["price"], row["max_disc"])

class ErpCatalog:
    def get_product(self, product_id):
        erp = {"ProductCode": "p1", "Desc": "Astymin", "ListPrice": 4700, "DiscountCap": 0.12}
        if erp["ProductCode"] != product_id: return None
        return Product(erp["ProductCode"], erp["Desc"], erp["ListPrice"], erp["DiscountCap"])

# THE CORE: depends only on the port, handed in as `catalog`
def place_order(catalog: CatalogPort, *, product_id, qty, discount):
    product = catalog.get_product(product_id)
    if product is None:
        return {"error": "unknown_product"}
    if discount > product.discount_ceiling:                 # rule = Acceptance Criteria
        return {"status": "pending_approval", "reason": "discount_over_ceiling"}
    total = product.unit_price * qty * (1 - discount)
    return {"status": "placed", "product": product.name, "total": total}

if __name__ == "__main__":
    order = dict(product_id="p1", qty=20, discount=0.05)
    print(place_order(HardcodedCatalog(), **order))
    print(place_order(SpreadsheetCatalog([{"sku":"p1","label":"Astymin","price":4500,"max_disc":0.10}]), **order))
    print(place_order(ErpCatalog(), **order))
    print(place_order(ErpCatalog(), product_id="p1", qty=20, discount=0.5))  # over ceiling
```

Output: hardcoded and spreadsheet agree (same price, total 85500); ERP differs (price 4700, total 89300); the over-ceiling call returns `pending_approval`. The core never changed across all three sources.

---

## Appendix B — runnable example: an enabler (approval engine)

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class ApprovalStep:
    approver_role: str
    max_authority: float

@dataclass
class Request:
    kind: str
    amount: float
    requester: str

# THE ENABLER'S PORT
class ApprovalEnginePort(ABC):
    @abstractmethod
    def route(self, request: Request) -> str: ...
    @abstractmethod
    def decide(self, request: Request, approver_says_yes: bool) -> dict: ...

# THE ENABLER (built once, under Story 2; reused by 15, 25, 38)
class ApprovalEngine(ApprovalEnginePort):
    def __init__(self, chain: list[ApprovalStep]):
        self.chain = chain                              # low -> high authority
    def route(self, request):
        return self.chain[0].approver_role              # first-line approver
    def decide(self, request, approver_says_yes):
        approver = self.route(request)
        if not approver_says_yes:
            return {"status": "rejected", "by": approver}
        if request.amount > self.chain[0].max_authority and len(self.chain) > 1:
            return {"status": "escalated", "to": self.chain[1].approver_role}
        return {"status": "approved", "by": approver}

# TWO STORY CORES, each injected with the SAME enabler
class PlanApprovalService:                              # Story 2
    def __init__(self, approvals: ApprovalEnginePort): self.approvals = approvals
    def submit_plan(self, rep, approver_says_yes):
        return self.approvals.decide(Request("plan", 0, rep), approver_says_yes)

class DiscountService:                                  # Story 25
    def __init__(self, approvals: ApprovalEnginePort): self.approvals = approvals
    def request_discount(self, rep, discount_value, approver_says_yes):
        return self.approvals.decide(Request("discount", discount_value, rep), approver_says_yes)

if __name__ == "__main__":
    chain = [ApprovalStep("RSM", 50_000), ApprovalStep("DM", 200_000), ApprovalStep("NSM", 10_000_000)]
    engine = ApprovalEngine(chain)
    plans, discounts = PlanApprovalService(engine), DiscountService(engine)
    print(plans.submit_plan("rep_A", True))                      # approved by RSM
    print(discounts.request_discount("rep_A", 30_000, True))     # approved by RSM
    print(discounts.request_discount("rep_A", 120_000, True))    # escalated to DM
```

The `chain` is a **config artifact** (the Approval Chain, produced by the Workflow-builder story, hardcoded until then). The `ApprovalEngine` is the **enabler** (behaviour). Two different story cores reuse the same engine, injected, without knowing how it routes or escalates.

---

## One-paragraph summary

Every artifact in the registry is a **Pydantic contract**. Each contract sits behind a **port** (an ABC/Protocol). **Adapters** fill that port from different sources (hardcode, spreadsheet, ERP, database) and are freely swappable, which is what seed-vs-sync is. The **core** of each story holds the business rules, depends only on ports (handed in via the constructor), and is the one thing that is never swapped. **Enablers** are shared behaviours (approval, scoping, sync) that many story cores reuse; each lives behind its own port and is built once under its first-consumer story. The frontend is just another consumer that binds to the backend's generated contract, mocked first, wired to the real backend at integration. On the board this is exactly the subtask split: **Contract & backend** (core + data ports/adapters), **Frontend** (screen against a mock), **Integration** (prove it crosses to the receiving end), and **Enabler** (shared engines).
