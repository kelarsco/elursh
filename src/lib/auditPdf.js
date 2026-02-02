/**
 * Shared PDF generation for audit report and Fix-It Manual.
 * Used by AnalyzeStore (public) and AnalysedStores (manager).
 */
const WHATSAPP_NUMBER = "13439462565";
const INSTAGRAM_HANDLE = "elurshteam";

function isShopifySubdomain(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    return u.hostname.endsWith(".myshopify.com");
  } catch {
    return false;
  }
}

export function loadJsPDF() {
  const lib = typeof window !== "undefined" && (window.jspdf?.jsPDF || window.jsPDF);
  if (lib) return Promise.resolve(lib);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js";
    script.async = true;
    script.onload = () => resolve(window.jspdf?.jsPDF || window.jsPDF);
    script.onerror = () => reject(new Error("Failed to load PDF library"));
    document.head.appendChild(script);
  });
}

/**
 * Generate and save the audit report PDF. data must have storeInfo, revenueLoss, categories, actionPlan, overallScore, status.
 */
export async function generateAuditReportPdf(data, storeUrl) {
  if (!data) return;
  const dataForPdf = data;
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 16;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 0;

  const ensureSpace = (need) => {
    if (y + need > pageH - 28) {
      doc.addPage();
      y = margin;
    }
  };

  const rgb = (r, g, b) => ({ r, g, b });
  const colors = {
    headerBg: rgb(34, 34, 34),
    accent: rgb(45, 108, 95),
    criticalBg: rgb(254, 226, 226),
    highBg: rgb(254, 243, 199),
    quickWinBg: rgb(220, 252, 231),
    revenueBg: rgb(248, 248, 248),
    cardBorder: rgb(229, 231, 235),
    progressBg: rgb(229, 231, 235),
    progressGreen: rgb(34, 197, 94),
    progressOrange: rgb(249, 115, 22),
    progressRed: rgb(239, 68, 68),
    textMuted: rgb(107, 114, 128),
    textDark: rgb(34, 34, 34),
    white: rgb(255, 255, 255),
  };

  const setFill = (c) => doc.setFillColor(c.r, c.g, c.b);
  const setText = (c) => doc.setTextColor(c.r, c.g, c.b);
  const setDraw = (c) => doc.setDrawColor(c.r, c.g, c.b);

  const addText = (text, x, size = 10, bold = false, color = colors.textDark) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    setText(color);
    const lines = doc.splitTextToSize(text, pageW - margin * 2 - (x - margin));
    doc.text(lines[0] || text, x, y);
    y += (size * 0.5 + 1) * lines.length;
  };

  setFill(colors.headerBg);
  doc.rect(0, 0, pageW, 22, "F");
  setText(colors.white);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const storeUrlForPdf = dataForPdf?.storeInfo?.url ?? "";
  const urlShort = doc.splitTextToSize(storeUrlForPdf, 70)[0] || storeUrlForPdf;
  doc.text(urlShort, margin, 10);
  const platform = dataForPdf?.storeInfo?.platform ?? "";
  const auditDate = dataForPdf?.storeInfo?.auditDate ?? "";
  const subtitle = auditDate ? (platform ? `${platform} · Last audit: ${auditDate}` : `Last audit: ${auditDate}`) : platform || "Store audit";
  doc.setFontSize(8);
  doc.text(subtitle, margin, 16);
  doc.setFontSize(7);
  doc.text(`${dataForPdf.categories?.reduce((acc, c) => acc + (c.checks?.filter((ch) => ch.status === "critical").length || 0), 0) || 0} critical • ${dataForPdf.actionPlan?.length || 0} actions`, margin, 20);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(dataForPdf.status || "Audit", pageW / 2 - doc.getTextWidth(dataForPdf.status || "Audit") / 2, 14);
  doc.setFontSize(22);
  const overallScoreVal = dataForPdf.overallScore ?? 0;
  doc.text(`${overallScoreVal}/100`, pageW - margin - doc.getTextWidth(`${overallScoreVal}/100`) - 2, 12);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Overall score", pageW - margin - doc.getTextWidth("Overall score") - 2, 18);
  y = 30;

  setText(colors.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Need help? Get our services at elursh.com/improve-store", margin, y);
  y += 6;

  ensureSpace(40);
  addText("Executive Summary", margin, 12, true, colors.textDark);
  y += 4;

  const criticalCount = dataForPdf.categories?.reduce((acc, c) => acc + (c.checks?.filter((ch) => ch.status === "critical").length || 0), 0) || 0;
  const highCount = dataForPdf.actionPlan?.filter((a) => (a.priority || "").toLowerCase().includes("high")).length || 0;
  const quickCount = Math.min(dataForPdf.actionPlan?.length || 0, 6);
  const cardW = (pageW - margin * 2 - 8) / 3;
  [criticalCount, highCount, quickCount].forEach((num, i) => {
    const labels = ["Critical Issues", "High Priority", "Quick Wins"];
    const bgs = [colors.criticalBg, colors.highBg, colors.quickWinBg];
    const x = margin + i * (cardW + 4);
    setFill(bgs[i]);
    setDraw(colors.cardBorder);
    doc.roundedRect(x, y, cardW, 18, 2, 2, "FD");
    setText(colors.textDark);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(String(num), x + cardW / 2 - doc.getTextWidth(String(num)) / 2, y + 10);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(labels[i], x + cardW / 2 - doc.getTextWidth(labels[i]) / 2, y + 15);
  });
  y += 22;

  ensureSpace(28);
  setFill(colors.revenueBg);
  setDraw(colors.cardBorder);
  doc.roundedRect(margin, y, pageW - margin * 2, 20, 2, 2, "FD");
  setText(colors.textMuted);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Estimated Monthly Revenue Loss", margin + 6, y + 8);
  setText(colors.textDark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`$${(dataForPdf.revenueLoss?.min ?? 0).toLocaleString()} – $${(dataForPdf.revenueLoss?.max ?? 0).toLocaleString()}/month`, margin + 6, y + 16);
  y += 24;
  (dataForPdf.revenueLoss?.breakdown || []).forEach((item) => {
    ensureSpace(12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    setText(colors.textDark);
    doc.text(`${item.label} (${item.percentage}%)`, margin + 4, y);
    y += 4;
    if (item.description) {
      doc.setFont("helvetica", "normal");
      setText(colors.textMuted);
      doc.setFontSize(8);
      const descLines = doc.splitTextToSize(item.description, pageW - margin * 2 - 12);
      descLines.slice(0, 2).forEach((line) => {
        doc.text(line, margin + 6, y);
        y += 3.5;
      });
    }
    y += 3;
  });
  y += 4;

  if (isShopifySubdomain(dataForPdf?.storeInfo?.url)) {
    ensureSpace(36);
    setFill(colors.highBg);
    setDraw(colors.cardBorder);
    doc.roundedRect(margin, y, pageW - margin * 2, 32, 2, 2, "FD");
    setText(colors.textDark);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Domain Name Audit", margin + 6, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setText(colors.textMuted);
    doc.text("Your store is using a Shopify subdomain (*.myshopify.com).", margin + 6, y + 14);
    const domainRec = "Recommendation: Connect a custom domain in Shopify (Settings → Domains), then set it as primary so your store uses your branded URL.";
    const domainLines = doc.splitTextToSize(domainRec, pageW - margin * 2 - 12);
    domainLines.slice(0, 3).forEach((line, i) => {
      doc.text(line, margin + 6, y + 20 + i * 4);
    });
    y += 36;
  }

  ensureSpace(24);
  addText("Category Breakdown", margin, 12, true, colors.textDark);
  y += 6;

  (dataForPdf.categories || []).forEach((cat) => {
    ensureSpace(20);
    setDraw(colors.cardBorder);
    doc.roundedRect(margin, y, pageW - margin * 2, 16, 1.5, 1.5, "S");
    setText(colors.textDark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(cat.title, margin + 4, y + 6);
    doc.setFont("helvetica", "normal");
    doc.text(`${cat.score ?? 0}/100`, margin + 4, y + 12);
    setText(colors.textMuted);
    doc.setFontSize(8);
    doc.text(cat.status || "", margin + 4, y + 15);
    const barW = 45;
    const barX = pageW - margin - barW - 4;
    const barY = y + 5;
    const catScore = cat.score ?? 0;
    setFill(colors.progressBg);
    doc.roundedRect(barX, barY, barW, 5, 1, 1, "F");
    const fillW = (catScore / 100) * barW;
    if (fillW > 0) {
      if (catScore >= 60) setFill(colors.progressGreen);
      else if (catScore >= 40) setFill(colors.progressOrange);
      else setFill(colors.progressRed);
      doc.roundedRect(barX, barY, Math.max(1, fillW), 5, 1, 1, "F");
    }
    const issueCount = cat.checks?.filter((c) => c.status !== "good").length || 0;
    doc.setFontSize(7);
    doc.text(`${issueCount} issues`, barX + barW / 2 - doc.getTextWidth(`${issueCount} issues`) / 2, y + 12);
    y += 18;

    const issues = (cat.checks || []).filter((c) => c.status !== "good");
    if (issues.length > 0) {
      issues.forEach((ch) => {
        ensureSpace(10);
        setText(ch.status === "critical" ? colors.progressRed : colors.textMuted);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(`• ${ch.item}`, margin + 6, y);
        y += 4;
        if (ch.details) {
          doc.setFont("helvetica", "normal");
          setText(colors.textMuted);
          const detailLines = doc.splitTextToSize(ch.details, pageW - margin * 2 - 14);
          detailLines.slice(0, 2).forEach((line) => {
            doc.text(line, margin + 8, y);
            y += 3.5;
          });
        }
        y += 2;
      });
      y += 2;
    }
  });
  y += 4;

  ensureSpace(20);
  addText("Top Priority Fixes", margin, 12, true, colors.textDark);
  y += 5;

  (dataForPdf.actionPlan || []).slice(0, 10).forEach((a, i) => {
    ensureSpace(18);
    const severity = (a.priority || "").toLowerCase();
    const isHigh = severity.includes("high") || severity.includes("critical");
    const isMed = severity.includes("medium");
    setFill(isHigh ? colors.progressRed : isMed ? colors.progressOrange : colors.quickWinBg);
    doc.roundedRect(margin, y - 4, 4, 4, 2, 2, "F");
    setText(colors.textDark);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. ${a.action}`, margin + 8, y);
    y += 4;
    const desc = [a.timeEstimate, a.revenueImpact].filter(Boolean).join(" · ");
    if (desc) {
      doc.setFont("helvetica", "normal");
      setText(colors.textMuted);
      doc.setFontSize(8);
      const descLines = doc.splitTextToSize(desc, pageW - margin * 2 - 14);
      doc.text(descLines[0], margin + 8, y);
      y += 4;
    }
    y += 4;
  });

  const footerH = 22;
  if (y + footerH > pageH) {
    doc.addPage();
    y = margin;
  }
  setFill(colors.headerBg);
  doc.rect(0, pageH - footerH, pageW, footerH, "F");
  setText(colors.white);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("To fix all these issues, contact us:", margin, pageH - footerH + 8);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Instagram @${INSTAGRAM_HANDLE}  or  WhatsApp +${WHATSAPP_NUMBER}`, margin, pageH - footerH + 14);
  doc.setFontSize(8);
  doc.text("Elursh — Store audit & optimization", margin, pageH - footerH + 19);

  const filename = `audit-${(dataForPdf?.storeInfo?.url ?? "").replace(/[^a-z0-9.-]/gi, "-").slice(0, 40)}.pdf`;
  doc.save(filename);
}

/**
 * Generate and save the Fix-It Manual PDF. data must have storeInfo, categories, actionPlan.
 */
export async function generateFixItManualPdf(data, storeUrl) {
  if (!data) return;
  const dataForPdf = data;
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 18;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = margin;

  const ensureSpace = (need) => {
    if (y + need > pageH - 25) {
      doc.addPage();
      y = margin;
    }
  };

  const rgb = (r, g, b) => ({ r, g, b });
  const colors = {
    headerBg: rgb(34, 34, 34),
    accent: rgb(45, 108, 95),
    textDark: rgb(34, 34, 34),
    textMuted: rgb(107, 114, 128),
    critical: rgb(239, 68, 68),
    warning: rgb(180, 83, 9),
  };

  const setFill = (c) => doc.setFillColor(c.r, c.g, c.b);
  const setText = (c) => doc.setTextColor(c.r, c.g, c.b);

  const addText = (text, size, bold, color, maxW) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    setText(color);
    const lines = doc.splitTextToSize(text, maxW ?? pageW - margin * 2);
    lines.forEach((line) => {
      ensureSpace(6);
      doc.text(line, margin, y);
      y += size * 0.45 + 1;
    });
  };

  const prioritizedIssues = [];
  (dataForPdf.categories || []).forEach((cat) => {
    (cat.checks || [])
      .filter((c) => c.status !== "good")
      .forEach((ch) => prioritizedIssues.push({ ...ch, categoryTitle: cat.title, impact: cat.impact, recommendation: cat.recommendation }));
  });
  prioritizedIssues.sort((a, b) => (a.status === "critical" && b.status !== "critical" ? -1 : a.status !== "critical" && b.status === "critical" ? 1 : 0));

  setFill(colors.headerBg);
  doc.rect(0, 0, pageW, 28, "F");
  setText(rgb(255, 255, 255));
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Fix-It Manual", margin, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Tailored for ${dataForPdf?.storeInfo?.url ?? ""}`, margin, 22);
  y = 36;

  setText(colors.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Need help? Get our services at elursh.com/improve-store", margin, y);
  y += 6;

  addText("This checklist is ordered by severity and impact. Fix critical issues first to stop revenue leaks, then work through high-priority items. Each section explains what the issue is, how it affects sales, practical steps to fix it, and the results you can expect.", 9, false, colors.textDark, pageW - margin * 2);
  y += 6;

  addText("Recommended action order (from your audit):", 10, true, colors.textDark, pageW - margin * 2);
  y += 4;
  (dataForPdf.actionPlan || []).slice(0, 8).forEach((a, i) => {
    addText(`${i + 1}. ${a.action}`, 9, false, colors.textMuted, pageW - margin * 2 - 6);
  });
  y += 8;

  prioritizedIssues.forEach((issue, idx) => {
    ensureSpace(35);
    const isCritical = issue.status === "critical";
    setText(isCritical ? colors.critical : colors.warning);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${idx + 1}. ${issue.categoryTitle} — ${issue.item}`, margin, y);
    y += 5;

    setText(colors.textDark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("What it is", margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    addText(issue.details || issue.item, 8, false, colors.textMuted, pageW - margin * 2 - 4);
    y += 2;

    doc.setFont("helvetica", "bold");
    doc.text("Impact on sales and performance", margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    addText(issue.impact || "Addressing this improves trust, conversions, or technical health.", 8, false, colors.textMuted, pageW - margin * 2 - 4);
    y += 2;

    doc.setFont("helvetica", "bold");
    doc.text("Steps to fix", margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    addText(issue.recommendation || "Follow best practices for this area and re-audit to confirm.", 8, false, colors.textMuted, pageW - margin * 2 - 4);
    y += 2;

    doc.setFont("helvetica", "bold");
    doc.text("Expected results after implementation", margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    addText("Better scores in this category, higher trust and conversions, and reduced revenue loss once fixes are live.", 8, false, colors.textMuted, pageW - margin * 2 - 4);
    y += 8;
  });

  ensureSpace(15);
  setText(colors.textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Elursh — Fix-It Manual for ${dataForPdf?.storeInfo?.url ?? ""}. Contact: @${INSTAGRAM_HANDLE} / +${WHATSAPP_NUMBER}`, margin, y);

  const filename = `fix-it-manual-${(dataForPdf?.storeInfo?.url ?? "").replace(/[^a-z0-9.-]/gi, "-").slice(0, 30)}.pdf`;
  doc.save(filename);
}
