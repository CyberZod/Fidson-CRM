"""Generate the Tales Consulting discovery questionnaire for Fidson Healthcare as a single self-contained HTML file."""

from __future__ import annotations

import base64
from pathlib import Path

LOGO_PATH = Path(r"C:\Users\user\Desktop\tales consulting artifacts\tales_logo.png")

# Standalone version (offline backup — save-as-PDF only, no submission)
STANDALONE_OUTPUT = Path(
    r"C:\Users\user\Desktop\tales consulting artifacts\Fidson_Discovery_Questionnaire.html"
)

# Hosted version — gets deployed via Azure Static Web Apps at /discovery
HOSTED_OUTPUT = Path(
    r"c:\Users\user\Documents\Dev\Fidson-CRM\public\discovery\index.html"
)

# Web3Forms access key — replace before deployment.
# Get yours by signing up at https://web3forms.com with the Tales inbox email.
WEB3FORMS_ACCESS_KEY = "81a29cf8-0957-4dc6-ba90-e1b66b166af6"


def logo_data_uri() -> str:
    raw = LOGO_PATH.read_bytes()
    b64 = base64.b64encode(raw).decode("ascii")
    return f"data:image/png;base64,{b64}"


def textarea(name: str, rows: int = 4) -> str:
    return f'<textarea name="{name}" rows="{rows}"></textarea>'


def text_field(name: str) -> str:
    return f'<input type="text" name="{name}" />'


def checkbox(name: str, label: str, sub: str | None = None) -> str:
    sub_html = f'<span class="opt-sub">{sub}</span>' if sub else ""
    return f"""
    <label class="opt">
      <input type="checkbox" name="{name}" />
      <span class="opt-text"><strong>{label}</strong>{sub_html}</span>
    </label>
    """


def field_row(label: str, name: str) -> str:
    return f"""
    <div class="field-row">
      <div class="field-label">{label}</div>
      <div class="field-input">{text_field(name)}</div>
    </div>
    """


def question(num: str, text: str, helper: str | None, body: str) -> str:
    helper_html = f'<p class="helper">{helper}</p>' if helper else ""
    return f"""
    <div class="q">
      <p class="q-text"><span class="q-num">Q{num}.</span> {text}</p>
      {helper_html}
      <div class="q-body">{body}</div>
    </div>
    """


def section(num: str, title: str, inner: str) -> str:
    return f"""
    <section class="sec">
      <div class="sec-head">
        <span class="sec-num">{num}</span>
        <span class="sec-title">{title}</span>
      </div>
      <div class="sec-body">
        {inner}
      </div>
    </section>
    """


def build_html(*, hosted: bool, access_key: str = "") -> str:
    logo = logo_data_uri()

    sec1 = section(
        "01",
        "Existing Systems & Integration",
        question(
            "1.1",
            "Does your ERP system expose a REST API or equivalent integration interface today?",
            "If yes, please describe the API (vendor, version, documentation availability). If no, indicate whether direct database access is available for read/sync purposes.",
            textarea("q_1_1", rows=5),
        )
        + question(
            "1.2",
            "If no API exists — are we able to access the underlying database directly to read and sync data?",
            "Specify database type (e.g., SQL Server, Oracle, MySQL), version, and whether a read-only replica or service account can be provisioned.",
            textarea("q_1_2", rows=4),
        ),
    )

    sec2 = section(
        "02",
        "IT Infrastructure & Hosting",
        question(
            "2.1",
            "Who hosts and manages your current IT infrastructure?",
            None,
            checkbox("q_2_1_internal", "Internal IT team", "Owned and operated in-house")
            + checkbox("q_2_1_msp", "Managed Service Provider (MSP)", "Outsourced to a third-party MSP")
            + checkbox("q_2_1_cloud", "Fully cloud-based (no in-house team)", "SaaS / cloud-native operations")
            + checkbox("q_2_1_hybrid", "Mixed / hybrid", "Combination of the above"),
        )
        + question(
            "2.2",
            "Is there a preference or restriction on data residency?",
            "For example: must data be stored on Nigerian servers, on the same infrastructure as your current ERP/database, or within a specific cloud region.",
            textarea("q_2_2", rows=4),
        ),
    )

    sec3 = section(
        "03",
        "Field Force Scale & Structure",
        question(
            "3.1",
            "How many field sales representatives will use the system at launch?",
            "Please provide a number or range, plus projected growth at 12 and 36 months. This directly determines database and API architecture sizing.",
            field_row("At launch", "q_3_1_launch")
            + field_row("Projected — 12 months", "q_3_1_12m")
            + field_row("Projected — 36 months", "q_3_1_36m"),
        )
        + question(
            "3.2",
            "How many territories, regions, and divisions currently exist?",
            None,
            field_row("Territories", "q_3_2_territories")
            + field_row("Regions", "q_3_2_regions")
            + field_row("Divisions", "q_3_2_divisions"),
        )
        + question(
            "3.3",
            "Are field reps employed directly, or are some contracted / third-party agents?",
            "This affects access control design and data ownership rules in the platform.",
            textarea("q_3_3", rows=4),
        )
        + question(
            "3.4",
            "Do reps work exclusively in the field, or do some have hybrid (office + field) roles?",
            None,
            textarea("q_3_4", rows=4),
        ),
    )

    sec4 = section(
        "04",
        "Data Migration",
        question(
            "4.1",
            "Is there historical sales data (orders, visits, rep performance) that needs to be imported?",
            "If yes, indicate the systems of record, approximate volume, and how far back the history extends.",
            textarea("q_4_1", rows=5),
        ),
    )

    sec5 = section(
        "05",
        "Regulatory & Compliance",
        question(
            "5.1",
            "Is the company subject to any specific regulatory framework governing field sales activity?",
            "For example: NAFDAC guidelines, internal SOPs on HCP engagement, sample distribution rules, promotional material approval requirements.",
            textarea("q_5_1", rows=5),
        )
        + question(
            "5.2",
            "Are there mandatory audit trail requirements for sample tracking and distribution?",
            "Sample management reconciliation is a regulatory requirement in most pharma environments. Please indicate whether NAFDAC or internal policy mandates a full chain of custody.",
            textarea("q_5_2", rows=4),
        )
        + question(
            "5.3",
            "Does the system need to comply with NDPR (Nigeria Data Protection Regulation)?",
            "This affects how personally identifiable data — rep GPS location, HCP data — is stored, processed, and shared.",
            textarea("q_5_3", rows=4),
        ),
    )

    sec6 = section(
        "06",
        "Reporting & Business Intelligence",
        question(
            "6.1",
            "Are there existing BI or reporting tools currently in use?",
            "If Power BI is already licensed under Microsoft 365, we can use Power BI Embedded for national dashboards at no additional licensing cost. Otherwise, we build dashboards natively — our preferred approach.",
            textarea("q_6_1", rows=4),
        ),
    )

    sec7 = section(
        "07",
        "Stakeholders & Deployment",
        question(
            "7.1",
            "Who is the primary technical point of contact and decision-maker for system design approvals on the client side?",
            "We need a named individual with authority to sign off on architecture decisions, data access, and integration credentials.",
            field_row("Full name", "q_7_1_name")
            + field_row("Role / title", "q_7_1_role")
            + field_row("Email", "q_7_1_email")
            + field_row("Phone", "q_7_1_phone"),
        )
        + question(
            "7.2",
            "Is there an internal IT team that will be involved in deployment, or does Tales Consulting handle end-to-end infrastructure?",
            None,
            checkbox("q_7_2_tales", "Tales Consulting handles end-to-end", "Full infrastructure setup and deployment managed by us")
            + checkbox("q_7_2_internal", "Internal IT team will be involved", "We coordinate with your IT team for access, firewalls, domain setup, etc.")
            + checkbox("q_7_2_hybrid", "Hybrid collaboration", "Shared responsibility — please describe below")
            + '<div style="margin-top: 10px;">'
            + textarea("q_7_2_notes", rows=3)
            + "</div>",
        ),
    )

    body = sec1 + sec2 + sec3 + sec4 + sec5 + sec6 + sec7

    if hosted:
        howto_copy = (
            "<strong>How to complete:</strong> Type your answers directly into the fields below. "
            "For multi-choice questions, tap each box that applies. Your progress is auto-saved on this device, "
            "so it's safe to close the tab and return. When you're done, click "
            "<strong>“Submit Responses”</strong> at the bottom of the page."
        )
        hidden_fields = (
            f'<input type="hidden" name="access_key" value="{access_key}" />'
            '<input type="hidden" name="subject" value="Fidson Discovery — new submission" />'
            '<input type="hidden" name="from_name" value="Fidson Discovery Form" />'
            '<input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off" />'
        )
        closing_copy = (
            "Once you click submit, your responses are sent directly to Tales Consulting. "
            "We will review them and follow up with a tailored architecture and engagement plan "
            "for the Fidson Field Force CRM."
        )
        actions_block = (
            '<div class="actions">'
            '<button type="submit">Submit Responses</button>'
            '<span class="hint" id="error-msg" style="display:none; color:#b91c1c;">'
            'Something went wrong submitting. Please check your connection and try again.'
            '</span>'
            '</div>'
        )
        success_block = """
    <div id="success" style="display:none;">
      <div class="closing" style="margin-top: 0;">
        <h3>Thank you — responses received.</h3>
        <p>Your answers have been sent to Tales Consulting. We will review them and follow up shortly with a tailored architecture and engagement plan for the Fidson Field Force CRM.</p>
      </div>
    </div>
"""
        form_attrs = 'id="discovery-form" method="POST"'
        script_block = """
<script>
(function () {
  var STORAGE_KEY = 'fidson-discovery-form-v1';
  var form = document.getElementById('discovery-form');
  if (!form) return;

  function snapshot() {
    var data = {};
    var els = form.querySelectorAll('input, textarea');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.name) continue;
      if (el.type === 'checkbox' || el.type === 'radio') {
        data['__chk__' + el.name + '__' + (el.value || 'on')] = !!el.checked;
      } else if (el.type !== 'hidden') {
        data[el.name] = el.value;
      }
    }
    return data;
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot())); } catch (e) {}
  }

  function restore() {
    var raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return; }
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch (e) { return; }
    var els = form.querySelectorAll('input, textarea');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.name) continue;
      if (el.type === 'checkbox' || el.type === 'radio') {
        var k = '__chk__' + el.name + '__' + (el.value || 'on');
        if (data[k]) el.checked = true;
      } else if (el.type !== 'hidden' && data[el.name] !== undefined) {
        el.value = data[el.name];
      }
    }
  }

  restore();

  var saveTimer = null;
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 250);
  }
  form.addEventListener('input', scheduleSave);
  form.addEventListener('change', scheduleSave);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]');
    var errMsg = document.getElementById('error-msg');
    if (errMsg) errMsg.style.display = 'none';
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

    var formData = new FormData(form);
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    }).then(function (res) {
      if (!res.ok) throw new Error('Request failed');
      return res.json();
    }).then(function (json) {
      if (json && json.success) {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        form.style.display = 'none';
        var success = document.getElementById('success');
        if (success) success.style.display = 'block';
        window.scrollTo(0, 0);
      } else {
        throw new Error((json && json.message) || 'Submission failed');
      }
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Responses'; }
      if (errMsg) errMsg.style.display = 'inline-block';
    });
  });
})();
</script>
"""
    else:
        howto_copy = (
            "<strong>How to complete:</strong> Type your answers directly into the fields below. "
            "For multi-choice questions, tap each box that applies. When you're finished, either click the "
            "<strong>“Save as PDF”</strong> button at the bottom of the page, or use your browser's "
            "<strong>Print → Save as PDF</strong> option, and return the PDF to your Tales Consulting point of contact."
        )
        hidden_fields = ""
        closing_copy = (
            "Once completed, please save this document as a PDF and return it to your Tales Consulting "
            "point of contact. We will use your responses to prepare a tailored architecture and "
            "engagement plan for the Fidson Field Force CRM."
        )
        actions_block = (
            '<div class="actions howto-print-hide">'
            '<button type="button" onclick="window.print()">Save as PDF</button>'
            '<span class="hint">Opens your browser\'s print dialog. Choose “Save as PDF” as the destination.</span>'
            '</div>'
        )
        success_block = ""
        form_attrs = 'id="discovery-form" onsubmit="return false;"'
        script_block = ""

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tales Consulting — Fidson Discovery Questionnaire</title>
  <style>
    /* Reset / base */
    * {{ box-sizing: border-box; }}
    html, body {{ margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f3f5f8;
      color: #1B2D5C;
      line-height: 1.5;
      font-size: 15px;
      -webkit-text-size-adjust: 100%;
    }}

    .page {{
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px 28px 48px;
    }}

    /* Cover */
    .cover {{
      padding: 8px 0 24px;
      border-bottom: 3px solid #2DCBC4;
      margin-bottom: 28px;
    }}
    .cover img.logo {{
      display: block;
      width: 200px;
      max-width: 60%;
      height: auto;
      margin-bottom: 18px;
    }}
    .cover h1 {{
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #1B2D5C;
      margin: 0 0 4px;
    }}
    .cover .subtitle {{
      color: #2DCBC4;
      font-weight: 600;
      font-size: 15px;
      margin: 0 0 18px;
    }}
    .cover .meta {{
      margin-top: 10px;
      font-size: 13.5px;
    }}
    .cover .meta-row {{
      display: block;
      margin-bottom: 4px;
    }}
    .cover .meta-row .k {{
      display: inline-block;
      min-width: 130px;
      color: #555f6e;
      font-weight: 600;
    }}
    .cover .meta-row .v {{ color: #1B2D5C; }}

    .intro {{
      margin: 24px 0 8px;
    }}
    .intro h2 {{
      font-size: 14px;
      margin: 0 0 6px;
      color: #1B2D5C;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }}
    .intro p {{ margin: 0 0 8px; font-size: 14px; }}
    .howto {{
      background: #eef7f6;
      border-left: 4px solid #2DCBC4;
      padding: 12px 14px;
      margin: 16px 0 8px;
      font-size: 13.5px;
      border-radius: 0 6px 6px 0;
    }}
    .howto strong {{ color: #1B2D5C; }}

    /* Sections */
    .sec {{ margin-top: 32px; }}
    .sec-head {{
      background: #1B2D5C;
      color: #ffffff;
      padding: 10px 14px;
      border-radius: 6px 6px 0 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .sec-num {{
      color: #2DCBC4;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 0.5px;
    }}
    .sec-title {{
      color: #ffffff;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }}
    .sec-body {{
      border: 1px solid #e0e4eb;
      border-top: none;
      padding: 18px 16px 4px;
      border-radius: 0 0 6px 6px;
      background: #ffffff;
    }}

    /* Questions */
    .q {{ margin-bottom: 22px; }}
    .q-text {{
      margin: 0 0 4px;
      font-weight: 600;
      color: #1B2D5C;
      font-size: 14.5px;
    }}
    .q-num {{
      color: #2DCBC4;
      font-weight: 800;
      margin-right: 4px;
    }}
    .helper {{
      margin: 0 0 8px;
      font-size: 12.5px;
      color: #6b7280;
      font-style: italic;
    }}
    .q-body {{ margin-top: 8px; }}

    /* Inputs */
    textarea, input[type="text"] {{
      width: 100%;
      font-family: inherit;
      font-size: 14px;
      color: #1B2D5C;
      background: #fafbfc;
      border: 1px solid #c8cdd6;
      border-radius: 4px;
      padding: 10px 12px;
      outline: none;
      -webkit-appearance: none;
      appearance: none;
    }}
    textarea {{
      resize: vertical;
      min-height: 70px;
      line-height: 1.5;
    }}
    textarea:focus, input[type="text"]:focus {{
      border-color: #2DCBC4;
      background: #ffffff;
    }}

    /* Field rows */
    .field-row {{
      display: block;
      margin-bottom: 8px;
    }}
    .field-label {{
      font-weight: 600;
      color: #1B2D5C;
      font-size: 13.5px;
      margin-bottom: 4px;
    }}
    .field-input input {{ background: #fafbfc; }}

    /* Checkbox options */
    .opt {{
      display: block;
      padding: 8px 10px;
      margin: 6px 0;
      border: 1px solid #e0e4eb;
      border-radius: 4px;
      background: #fafbfc;
      cursor: pointer;
    }}
    .opt input[type="checkbox"] {{
      margin-right: 10px;
      transform: scale(1.15);
      vertical-align: middle;
    }}
    .opt-text {{ vertical-align: middle; font-size: 14px; }}
    .opt-text strong {{ color: #1B2D5C; }}
    .opt-sub {{
      display: block;
      color: #6b7280;
      font-size: 12.5px;
      margin-top: 2px;
      margin-left: 0;
      font-weight: normal;
    }}

    /* Closing */
    .closing {{
      margin-top: 32px;
      background: #eef7f6;
      border: 1px solid #2DCBC4;
      border-radius: 6px;
      padding: 16px 18px;
    }}
    .closing h3 {{
      margin: 0 0 6px;
      color: #1B2D5C;
      font-size: 15px;
    }}
    .closing p {{
      margin: 0;
      font-size: 13.5px;
      color: #1B2D5C;
    }}

    .actions {{
      margin: 20px 0 8px;
      display: block;
      text-align: center;
    }}
    .actions button {{
      background: #1B2D5C;
      color: #ffffff;
      border: none;
      padding: 12px 22px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      font-family: inherit;
    }}
    .actions button:hover {{ background: #2DCBC4; color: #1B2D5C; }}
    .actions .hint {{
      display: block;
      margin-top: 8px;
      font-size: 12px;
      color: #6b7280;
    }}

    .footer {{
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid #e0e4eb;
      text-align: center;
      font-size: 11.5px;
      color: #6b7280;
    }}

    /* Mobile */
    @media (max-width: 640px) {{
      body {{ font-size: 14px; }}
      .page {{ padding: 20px 16px 32px; }}
      .cover h1 {{ font-size: 22px; }}
      .cover img.logo {{ width: 160px; }}
      .cover .meta-row .k {{ min-width: 110px; }}
      textarea, input[type="text"] {{ font-size: 16px; }} /* prevent iOS zoom */
    }}

    /* Print */
    @media print {{
      @page {{ size: A4; margin: 14mm; }}
      html, body {{ background: #ffffff; }}
      body {{ font-size: 11pt; color: #1B2D5C; }}
      .page {{ max-width: 100%; padding: 0; margin: 0; }}
      .actions, .howto-print-hide {{ display: none !important; }}

      .sec {{ page-break-inside: auto; margin-top: 18px; }}
      .sec-head {{
        background: #1B2D5C !important;
        color: #ffffff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        page-break-after: avoid;
      }}
      .sec-num, .sec-title, .q-num {{
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }}
      .q {{ page-break-inside: avoid; }}
      .closing {{
        page-break-inside: avoid;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }}
      textarea, input[type="text"] {{
        border: 1px solid #1B2D5C !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }}
      .opt {{
        background: #ffffff !important;
        border-color: #1B2D5C !important;
      }}
    }}
  </style>
</head>
<body>
  <div class="page">
    <header class="cover">
      <img class="logo" src="{logo}" alt="Tales Consulting" />
      <h1>Client Discovery Questionnaire</h1>
      <p class="subtitle">Field Force CRM — Discovery &amp; Requirements</p>
      <div class="meta">
        <div class="meta-row"><span class="k">Prepared for</span><span class="v">Fidson Healthcare Plc</span></div>
        <div class="meta-row"><span class="k">Prepared by</span><span class="v">Tales Consulting</span></div>
        <div class="meta-row"><span class="k">Document type</span><span class="v">Pre-engagement discovery questionnaire</span></div>
      </div>

      <div class="intro">
        <h2>Purpose of this document</h2>
        <p>This questionnaire helps Tales Consulting understand Fidson Healthcare's existing systems, field operations, regulatory obligations, and stakeholder structure before we finalise the architecture and rollout plan for your Field Force CRM. Your answers directly inform integration design, data residency choices, access-control rules, and compliance posture.</p>
      </div>

      <div class="howto">
        {howto_copy}
      </div>
    </header>

    <form {form_attrs}>
      {hidden_fields}
      {body}

      <div class="closing">
        <h3>Thank you.</h3>
        <p>{closing_copy}</p>
      </div>

      {actions_block}
    </form>
    {success_block}

    <div class="footer">
      Tales Consulting &nbsp;•&nbsp; Client Discovery Questionnaire — Fidson Healthcare &nbsp;•&nbsp; Confidential
    </div>
  </div>
  {script_block}
</body>
</html>
"""


def _write(path: Path, html: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding="utf-8")
    print(f"Wrote {path} ({path.stat().st_size / 1024:.1f} KB)")


def main() -> None:
    _write(STANDALONE_OUTPUT, build_html(hosted=False))
    _write(
        HOSTED_OUTPUT,
        build_html(hosted=True, access_key=WEB3FORMS_ACCESS_KEY),
    )
    if WEB3FORMS_ACCESS_KEY.startswith("YOUR_"):
        print(
            "\n[!] Hosted form is using a placeholder Web3Forms access key.\n"
            "    Sign up at https://web3forms.com with the Tales inbox email,\n"
            "    then replace WEB3FORMS_ACCESS_KEY in this script and re-run."
        )


if __name__ == "__main__":
    main()
