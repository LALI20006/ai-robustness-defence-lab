import os
import datetime
from typing import Dict, Any, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from backend.app.config import settings

def generate_academic_conclusion(
    algorithm_name: str,
    clean_acc: float,
    perturbation_method: str,
    perturbation_strength: float,
    robust_acc: float,
    acc_drop: float,
    asr: float,
    defence_method: str,
    defended_robust_acc: Optional[float] = None,
    robustness_improvement: Optional[float] = None
) -> str:
    """Synthesizes a realistic, fact-based academic summary conclusion."""
    clean_pct = f"{clean_acc * 100:.1f}%"
    robust_pct = f"{robust_acc * 100:.1f}%"
    drop_pct = f"{acc_drop * 100:.1f} percentage points"
    method_title = perturbation_method.replace("_", " ").title()

    base_conclusion = (
        f"The {algorithm_name} classifier achieved a clean baseline accuracy of {clean_pct}. "
        f"Under a {perturbation_strength*100:.0f}% {method_title} perturbation within valid mathematical bounds, "
        f"robust accuracy decreased to {robust_pct}, exhibiting an accuracy degradation of {drop_pct} "
        f"and an Attack Success Rate (ASR) of {asr:.1f}% on originally correct classifications."
    )

    if defence_method and defence_method != "none" and defended_robust_acc is not None:
        def_pct = f"{defended_robust_acc * 100:.1f}%"
        imp_pct = f"{(robustness_improvement or 0) * 100:+.1f} percentage points"
        defence_title = defence_method.replace("_", " ").title()
        return (
            f"{base_conclusion} Subsequent application of the {defence_title} defensive mechanism "
            f"improved post-perturbation accuracy to {def_pct} (a net robustness recovery of {imp_pct}). "
            f"These empirical findings confirm that proactive feature-space defenses significantly mitigate "
            f"perturbation vulnerability while preserving baseline generalization."
        )
    else:
        return (
            f"{base_conclusion} These results highlight the sensitivity of unhardened classifiers "
            f"to subtle distribution shifts and emphasize the requirement for defensive hardening "
            f"(such as input validation guards or adversarial augmentation) prior to mission-critical deployment."
        )

def generate_pdf_report(
    report_filename: str,
    report_data: Dict[str, Any]
) -> str:
    """Generates a styled, publication-grade academic PDF evaluation report using ReportLab."""
    pdf_path = os.path.join(settings.REPORT_DIR, report_filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )
    section_title = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )
    conclusion_style = ParagraphStyle(
        "ReportConclusion",
        parent=styles["Normal"],
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F1F5F9"),
        borderPadding=8,
        spaceBefore=8,
        spaceAfter=12
    )

    story = []

    # Title & Header
    story.append(Paragraph("ADVERSARIAL ROBUSTNESS EVALUATION REPORT", title_style))
    story.append(Paragraph(
        f"<b>Framework:</b> {settings.PROJECT_NAME}<br/>"
        f"<b>Generated:</b> {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} | <b>Security Scope:</b> Defensive Offline Evaluation",
        subtitle_style
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=12))

    # Meta Overview Table
    meta_data = [
        [
            Paragraph("<b>Analyst / User:</b>", body_style),
            Paragraph(str(report_data.get("user_name", "Researcher")), body_style),
            Paragraph("<b>Dataset:</b>", body_style),
            Paragraph(str(report_data.get("dataset_name", "N/A")), body_style)
        ],
        [
            Paragraph("<b>Classifier Architecture:</b>", body_style),
            Paragraph(str(report_data.get("algorithm", "N/A")).replace("_", " ").title(), body_style),
            Paragraph("<b>Target Column:</b>", body_style),
            Paragraph(str(report_data.get("target_column", "label")), body_style)
        ],
        [
            Paragraph("<b>Perturbation Method:</b>", body_style),
            Paragraph(str(report_data.get("perturbation_method", "N/A")).replace("_", " ").title(), body_style),
            Paragraph("<b>Perturbation Strength:</b>", body_style),
            Paragraph(f"{float(report_data.get('perturbation_strength', 0.05))*100:.1f}%", body_style)
        ],
        [
            Paragraph("<b>Defence Mechanism:</b>", body_style),
            Paragraph(str(report_data.get("defence_method", "None")).replace("_", " ").title(), body_style),
            Paragraph("<b>Random Seed:</b>", body_style),
            Paragraph(str(report_data.get("random_seed", 42)), body_style)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[125, 140, 115, 150])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Core Metrics Comparison Table
    story.append(Paragraph("1. EMPIRICAL ROBUSTNESS METRICS", section_title))
    
    clean_acc = report_data.get("clean_accuracy", 0.0)
    robust_acc = report_data.get("robust_accuracy", 0.0)
    acc_drop = report_data.get("accuracy_drop", 0.0)
    asr = report_data.get("attack_success_rate", 0.0)
    flip_rate = report_data.get("prediction_flip_rate", 0.0)
    defended_acc = report_data.get("defended_robust_accuracy", None)
    improvement = report_data.get("robustness_improvement", None)

    metrics_rows = [
        ["Evaluation State / Metric", "Accuracy", "Accuracy Drop", "Attack Success Rate (ASR)", "Flip Rate"],
        ["Clean Baseline", f"{clean_acc*100:.2f}%", "-", "-", "-"],
        ["Under Perturbation", f"{robust_acc*100:.2f}%", f"{acc_drop*100:.2f}%", f"{asr:.2f}%", f"{flip_rate:.2f}%"]
    ]

    if defended_acc is not None:
        metrics_rows.append([
            "Defended (Hardened)",
            f"{defended_acc*100:.2f}%",
            f"{(clean_acc - defended_acc)*100:.2f}%",
            f"{report_data.get('defended_attack_success_rate', 0.0):.2f}%",
            f"Recovery: {improvement*100:+.2f}%" if improvement else "-"
        ])

    metrics_table = Table(metrics_rows, colWidths=[160, 90, 90, 110, 80])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 14))

    # Preprocessing & Model Details
    story.append(Paragraph("2. PREPROCESSING & MODEL CONFIGURATION", section_title))
    prep_data = [
        ["Configuration Parameter", "Value", "Parameter", "Value"],
        [
            "Missing Value Strategy", str(report_data.get("missing_value_strategy", "mean")),
            "Encoding Method", str(report_data.get("encoding_method", "onehot"))
        ],
        [
            "Feature Scaling", str(report_data.get("scaling_method", "standard")),
            "Feature Selection", str(report_data.get("feature_selection_method", "all"))
        ],
        [
            "Train-Test Split", f"{int((1 - report_data.get('test_size', 0.2))*100)}/{int(report_data.get('test_size', 0.2)*100)}",
            "Total Processed Features", str(report_data.get("num_features", "N/A"))
        ]
    ]
    prep_table = Table(prep_data, colWidths=[140, 125, 130, 135])
    prep_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#334155")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(prep_table)
    story.append(Spacer(1, 14))

    # Executive Academic Conclusion
    story.append(Paragraph("3. ACADEMIC EVALUATION CONCLUSION", section_title))
    conclusion_text = report_data.get("conclusion") or generate_academic_conclusion(
        algorithm_name=report_data.get("algorithm", "Classifier").replace("_", " ").title(),
        clean_acc=clean_acc,
        perturbation_method=report_data.get("perturbation_method", "bounded_perturbation"),
        perturbation_strength=report_data.get("perturbation_strength", 0.05),
        robust_acc=robust_acc,
        acc_drop=acc_drop,
        asr=asr,
        defence_method=report_data.get("defence_method", "none"),
        defended_robust_acc=defended_acc,
        robustness_improvement=improvement
    )
    story.append(Paragraph(conclusion_text, conclusion_style))

    # Safety Notice Footer
    story.append(Spacer(1, 10))
    safety_text = (
        "<b>Defensive Research Compliance Statement:</b> This evaluation was conducted strictly within offline mathematical "
        "feature datasets. No active network packets, exploit payloads, executable binaries, or intrusion behaviors were generated. "
        "Intended solely for defensive AI security validation and machine-learning robustness research."
    )
    story.append(Paragraph(safety_text, ParagraphStyle("Safety", parent=body_style, fontSize=7.5, textColor=colors.HexColor("#64748B"))))

    doc.build(story)
    return pdf_path

def generate_html_report(
    report_data: Dict[str, Any]
) -> str:
    """Generates an elegant HTML report for in-browser printing and presentation."""
    clean_acc = report_data.get("clean_accuracy", 0.0)
    robust_acc = report_data.get("robust_accuracy", 0.0)
    acc_drop = report_data.get("accuracy_drop", 0.0)
    asr = report_data.get("attack_success_rate", 0.0)
    flip_rate = report_data.get("prediction_flip_rate", 0.0)
    defended_acc = report_data.get("defended_robust_accuracy", None)
    improvement = report_data.get("robustness_improvement", None)

    conclusion = report_data.get("conclusion") or generate_academic_conclusion(
        algorithm_name=report_data.get("algorithm", "Classifier").replace("_", " ").title(),
        clean_acc=clean_acc,
        perturbation_method=report_data.get("perturbation_method", "bounded_perturbation"),
        perturbation_strength=report_data.get("perturbation_strength", 0.05),
        robust_acc=robust_acc,
        acc_drop=acc_drop,
        asr=asr,
        defence_method=report_data.get("defence_method", "none"),
        defended_robust_acc=defended_acc,
        robustness_improvement=improvement
    )

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Robustness Evaluation Report - {report_data.get('dataset_name', 'Cybersecurity Lab')}</title>
  <style>
    body {{ font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; margin: 40px; color: #0f172a; background: #fff; }}
    .header {{ border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; }}
    .title {{ font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }}
    .subtitle {{ font-size: 13px; color: #64748b; margin-top: 6px; }}
    .grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }}
    .card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }}
    .card-title {{ font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }}
    .card-val {{ font-size: 18px; font-weight: 700; color: #0f172a; }}
    .card-val.accent {{ color: #2563eb; }}
    .card-val.danger {{ color: #e11d48; }}
    .card-val.success {{ color: #059669; }}
    table {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }}
    th, td {{ padding: 10px 14px; text-align: left; border: 1px solid #e2e8f0; }}
    th {{ background: #0f172a; color: #fff; font-weight: 600; }}
    tr:nth-child(even) {{ background: #f8fafc; }}
    .section-heading {{ font-size: 16px; font-weight: 600; margin: 24px 0 12px 0; color: #1e293b; }}
    .conclusion-box {{ background: #f1f5f9; border-left: 4px solid #2563eb; padding: 14px 18px; font-size: 14px; line-height: 1.6; margin-bottom: 24px; border-radius: 0 6px 6px 0; }}
    .footer {{ font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 40px; }}
    @media print {{ body {{ margin: 0; }} .no-print {{ display: none; }} }}
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 class="title">Adversarial Robustness Evaluation Report</h1>
        <div class="subtitle">{settings.PROJECT_NAME}</div>
      </div>
      <button class="no-print" onclick="window.print()" style="padding: 8px 16px; background: #0f172a; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Print / Save as PDF</button>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Clean Accuracy</div>
      <div class="card-val accent">{clean_acc*100:.2f}%</div>
    </div>
    <div class="card">
      <div class="card-title">Robust Accuracy</div>
      <div class="card-val danger">{robust_acc*100:.2f}%</div>
    </div>
    <div class="card">
      <div class="card-title">Attack Success Rate</div>
      <div class="card-val danger">{asr:.2f}%</div>
    </div>
    <div class="card">
      <div class="card-title">Defended Accuracy</div>
      <div class="card-val success">{f"{defended_acc*100:.2f}%" if defended_acc else "N/A"}</div>
    </div>
  </div>

  <h2 class="section-heading">1. Robustness Evaluation Summary</h2>
  <table>
    <thead>
      <tr>
        <th>Evaluation State</th>
        <th>Accuracy</th>
        <th>Accuracy Drop</th>
        <th>Attack Success Rate</th>
        <th>Prediction Flip Rate</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Baseline (Clean Data)</strong></td>
        <td>{clean_acc*100:.2f}%</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </tr>
      <tr>
        <td><strong>Perturbed ({report_data.get('perturbation_method', 'bounded_perturbation').replace('_', ' ').title()} {float(report_data.get('perturbation_strength', 0.05))*100:.0f}%)</strong></td>
        <td>{robust_acc*100:.2f}%</td>
        <td style="color: #e11d48;">-{acc_drop*100:.2f}%</td>
        <td style="color: #e11d48;">{asr:.2f}%</td>
        <td>{flip_rate:.2f}%</td>
      </tr>
      {f'''<tr>
        <td><strong>Defended Model ({report_data.get('defence_method', 'Adversarial Training').replace('_', ' ').title()})</strong></td>
        <td>{defended_acc*100:.2f}%</td>
        <td>-{(clean_acc - defended_acc)*100:.2f}%</td>
        <td style="color: #059669;">{report_data.get('defended_attack_success_rate', 0.0):.2f}%</td>
        <td style="color: #059669;">Robustness Gain: {improvement*100:+.2f}%</td>
      </tr>''' if defended_acc else ''}
    </tbody>
  </table>

  <h2 class="section-heading">2. Configuration & Provenance</h2>
  <table>
    <tbody>
      <tr>
        <td style="width: 25%;"><strong>Classifier:</strong></td>
        <td style="width: 25%;">{report_data.get('algorithm', 'N/A').replace('_', ' ').title()}</td>
        <td style="width: 25%;"><strong>Dataset:</strong></td>
        <td style="width: 25%;">{report_data.get('dataset_name', 'N/A')}</td>
      </tr>
      <tr>
        <td><strong>Scaling Method:</strong></td>
        <td>{report_data.get('scaling_method', 'standard')}</td>
        <td><strong>Encoding Method:</strong></td>
        <td>{report_data.get('encoding_method', 'onehot')}</td>
      </tr>
      <tr>
        <td><strong>Perturbation Method:</strong></td>
        <td>{report_data.get('perturbation_method', 'bounded_perturbation')}</td>
        <td><strong>Random Seed:</strong></td>
        <td>{report_data.get('random_seed', 42)}</td>
      </tr>
    </tbody>
  </table>

  <h2 class="section-heading">3. Academic Conclusion & Finding</h2>
  <div class="conclusion-box">
    {conclusion}
  </div>

  <div class="footer">
    Adversarial Robustness Evaluation & Defence Framework | Defensive research offline laboratory | Generated on {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
  </div>
</body>
</html>
"""
    return html_content
