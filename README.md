# KVKSN & Co. — Website + Client Portal + Practice Console

A working, **fully offline** demo. No server, no build step, no internet needed.
Double-click `index.html` and everything runs.

---

## How to run

1. Open `index.html` in Chrome or Edge (double-click it).
2. That's it. Every link, button, form and calendar works.

> Best viewed in Chrome or Edge. All data is stored in the browser's `localStorage`,
> so your changes survive a refresh. **Reset demo data** in the admin sidebar restores
> the original seeded state.

---

## The three parts

| File | What it is | Who it's for |
|---|---|---|
| `index.html` | Public website | Anyone — prospects, search engines |
| `portal.html` | Client portal | Clients of the firm |
| `admin.html` | Practice management console | Staff and partner |

Access to the portal and console is by login only. Nothing on the public page exposes
client data.

---

## Demo logins

**Client portal** (`portal.html`) — click any account on the login screen, or type the credentials:

| Client | Email | Password |
|---|---|---|
| Sri Lakshmi Traders (proprietorship, GST + ITR) | `client@demo.in` | `demo` |
| Kadapa Dairy Farms Pvt Ltd (company, tax audit + ROC) | `dairy@demo.in` | `demo` |
| M. Sudhakar Reddy (salaried individual) | `sudhakar@demo.in` | `demo` |
| Rayalaseema Poultry LLP (QRMP, project report) | `poultry@demo.in` | `demo` |
| Sri Venkateswara Charitable Trust | `trust@demo.in` | `demo` |
| Anjaneya Steel Traders (GST notice, has a demand) | `steel@demo.in` | `demo` |

**Practice console** (`admin.html`):

| Member | Email | Password | Sees |
|---|---|---|---|
| CA K. Khaja Hussain — Partner | `kkhca1975@yahoo.co.in` | `demo` | Everything |
| S. Ramesh — Audit Manager | `ramesh@kvksn.in` | `demo` | Only jobs assigned to them |
| P. Anitha — Senior Accountant | `anitha@kvksn.in` | `demo` | Only their own jobs |
| T. Naveen — Article Assistant | `naveen@kvksn.in` | `demo` | Only their own jobs |
| B. Sridevi — Accounts Executive | `sridevi@kvksn.in` | `demo` | Only their own jobs |

Sign in as the **partner** to see the full system; sign in as **T. Naveen** to show a
client how staff access is restricted.

---

## A 5-minute demo script

1. **Public site** — the **announcement strip** at the top scrolls on its own. Use the
   arrows or dots, or the pause button.
2. Scroll to the **Statutory Compliance Calendar**. Click a highlighted date; filter by
   GST / Income Tax / TDS / ROC; move between months. Switch to **Year View** for the
   whole financial year grouped by category — note the `EXTENDED` badge on the ITR entry.
3. Fill in the **contact form** and submit.
4. **Client portal** → sign in as *Sri Lakshmi Traders*. The dashboard shows two items
   needing attention.
5. Open **GSTR-3B — Documents Pending** → drag any file onto the upload box. Watch the
   checklist tick off, and when it completes, the job moves itself to the team.
6. Open the **ITR-3** job → answer the open query. The status changes and the assigned
   staff member is notified.
7. **Request a Service** → pick *Udyam / MSME Registration* → a job is created and
   auto-assigned.
8. Go to **My Profile** → *Refresh from GST Portal*, then *Fetch Income Tax Record*
   (OTP is `123456`).
9. **Admin console** → sign in as the **partner**.
10. **Compliance Tracker** → *Sync All Clients*. The whole client base's GST filing
   position appears, with the defaulter flagged.
11. **Job Board** → open a job → *Raise Query*, *Reassign*, *Add Deliverable*,
    *Approve & Release*, *Raise Invoice*.
12. **Client Master** → *+ Add Client via GSTIN* → enter `29AABCU9603R1ZM` → the details
    come back from the (simulated) GST portal and create the client.
13. **Portal Sync** → run calls against the GST, Income Tax and MCA consoles.
14. **Enquiries** → the form you submitted earlier is sitting there as a lead.
15. **Website Media** → upload a banner, reorder it, set a caption, change the rotation
    speed, or swap the logo. Reload the public site to see it.

---

## What actually works (not mock-ups)

**Public site**
- Auto-scrolling announcement banner strip — arrows, dots, pause, swipe on touch;
  images managed from the admin console
- Full compliance calendar driven by a rule engine — generates every GST, income tax,
  TDS, ROC and labour due date for **any month of any year**, with category filters,
  day detail, and a live countdown
- Year View listing every due date of a financial year grouped by category, with
  notified extensions flagged
- Contact form that writes a real lead into the admin console

**Client portal**
- Login, dashboard with action items, KPIs and activity feed
- Job list with search, status filter and "needs me" view
- Job detail: progress bar through 7 stages, assigned staff, full audit trail
- Document checklist with drag-and-drop upload — uploading auto-advances the job
- Query thread: read a query, reply, status changes, staff notified
- Request a service — creates and auto-assigns a job
- Documents register and permanent completed-work vault with downloads
- Invoices with a working payment flow
- Personal compliance calendar filtered to the client's own registrations
- Profile with live GST portal refresh and OTP-gated income tax fetch
- Statutory applicability derived from turnover (audit, e-invoicing, QRMP, 194Q…)

**Practice console**
- Partner vs staff permissions — staff genuinely cannot open others' jobs
- Kanban job board across all 7 stages + table view, with filters
- Job actions: reassign, raise query, change status, add deliverable, submit for review,
  approve & release, send back, raise invoice, chase documents
- Maker-checker gate — nothing reaches the client until the partner releases it
- Client master with GSTIN-based onboarding (auto-fills name, constitution, turnover
  slab, jurisdiction)
- Firm-wide GST compliance tracker with bulk sync and defaulter detection
- Government portal sync console (GST / Income Tax ERI / MCA21) with a request-response
  log and a permanent sync audit trail
- Billing: unbilled work, invoice raising, reminders, mark-paid
- Team workload and capacity utilisation
- Enquiries inbox fed by the public site
- Partner reports: turnaround time, on-time delivery, fee value by service and client,
  document pendency
- Website Media: upload, reorder, caption, link, hide or delete home page banners; set
  the rotation speed; swap the firm logo site-wide

---

## Supplying your own logo and banners

The home page has a **scrolling announcement strip** at the top, like the one on
incometax.gov.in. Three placeholder banners ship with the demo. There are two ways to
replace them with your own artwork — use whichever is easier.

### Option 1 — copy files into the folder (fastest)

Save your images into the `assets/img/` folder with these exact names, then reload the website:

```
banner-1.png        first banner in the strip
banner-2.png        second
banner-3.png        third      (up to banner-6.png; .jpg also works)

ca-india.png        logo for light backgrounds — website header
ca-india-light.png  logo for dark backgrounds — footer, portal, console
```

**Why two logo files.** The footer, the client portal sidebar and the console sidebar are
dark navy. A dark-blue logo is invisible there, so a pale version is used instead. Both
are already in place: `ca-india.png` is the firm's artwork with the white background cut
out, and `ca-india-light.png` is the same artwork with the blue recoloured pale, keeping
the tricolour. The untouched original is kept as `ca-india-original.png`.

Any name that isn't there is skipped. As soon as one `banner-N` file is found, the
built-in placeholder banners step aside. Banners look best at roughly **1250 x 460**.

### Option 2 — upload in the admin console

**Practice Console → Website Media** (partner login). From there you can:

- Upload a banner — it is downscaled in the browser and stored locally
- Reorder with the up/down arrows
- Add a caption shown over the image
- Point a banner at a page (calendar, services, contact, client portal)
- Hide a banner without deleting it, or delete it
- Set the rotation speed (2 to 12 seconds per slide)
- Upload the firm logo — separate slots for the main and the light version, applied
  across the website, portal and console at once
- Restore the built-in banners

Reload the public website after saving to see the change.

> Uploaded images live under their own storage key, so **Reset demo data** does *not*
> wipe them.

---

## About the government portal integration

The GST, Income Tax and MCA calls are **simulated locally** — realistic request and
response shapes, network latency, an OTP consent step, and error cases. Nothing leaves
the machine.

For a live build:

- **GST** — the taxpayer search and return-filing status are public; the rest (GSTR-2B,
  e-way bills, filing) needs a contract with a licensed **GSP**.
- **Income Tax** — requires **ERI (e-Return Intermediary)** registration, or API access
  bought from a provider that holds one. Consent-based pulls are gated by an OTP sent to
  the client's own registered mobile.
- **Never** store client income tax portal passwords to drive automation. It breaches the
  portal terms, and a leak makes the firm liable for every client.

---

## Notes

- **Due dates.** The calendar has two views: **Month View** (grid, click a date for
  detail) and **Year View** (every due date for a financial year, grouped into GST,
  Income Tax, TDS/TCS, ROC/MCA and PF/ESI/PT). Rules live in `assets/js/duedates.js`.
- **Notified extensions.** When the government moves a date, add one line to the
  `EXTENSIONS` table at the top of `assets/js/duedates.js` and the whole calendar
  follows it, with an `EXTENDED` badge on the entry. One is already recorded: ITR-3/4/5/7
  for non-audit business cases, moved from 31 July 2026 to **31 August 2026** for
  AY 2026-27. Everything else is the standard statutory date — verify against the latest
  notification before relying on it.
- **ICAI advertising rules** restrict how a CA firm may promote itself. The public page
  is deliberately informational, with a disclaimer in the footer. Please have the wording
  confirmed against the current ICAI Guidelines before going live.
- **The CA India logo** is the firm's own artwork, at `assets/img/ca-india.png` (and the
  pale `ca-india-light.png` for dark backgrounds). To change it, overwrite those files or
  upload replacements in **Website Media** — no code change either way.
- **Downloads** produce a plain-text stand-in document, since there is no server to
  generate real PDFs.

---

## Files

```
index.html               Public website
portal.html              Client portal
admin.html               Practice management console
README.md                This file

assets/css/site.css      Public site styles
assets/css/app.css       Portal + console styles

assets/js/duedates.js    Statutory due date rule engine + notified extensions
assets/js/media.js       Banner + logo store (uploads, drop-in files)
assets/js/store.js       Demo data, workflow logic, simulated portal APIs
assets/js/ui.js          Shared UI helpers — modal, drawer, toast, formatting
assets/js/site.js        Public site — calendar widget, enquiry form
assets/js/portal.js      Client portal application
assets/js/admin.js       Practice console application

assets/img/ca-india.png        CA India mark — light backgrounds
assets/img/ca-india-light.png  CA India mark — dark backgrounds
assets/img/ca-india-original.png  the untouched file as supplied
assets/img/banner-itr.svg      Placeholder banner 1 (replaceable)
assets/img/banner-verify.svg   Placeholder banner 2 (replaceable)
assets/img/banner-gst.svg      Placeholder banner 3 (replaceable)
assets/img/portrait.jpg        Hero portrait
assets/img/founder.jpg         Team card portrait
assets/img/poster.jpg          Original CA Day artwork (unused, kept for reference)
```

**Contact:** KVKSN & Co., Chartered Accountants ·
# 5/356, 2nd Floor, Anjaneya Swamy Temple Street, Kadapa – 516 001 ·
+91 98495 06910 · +91 90590 43910 · kkhca1975@yahoo.co.in
