/* ================================================================
   STUDIO 7 — ESCAPE ROOM
   js/pdf.js  —  ייצוא תוצאות ל-PDF (jsPDF)
================================================================ */

const PDF7 = (() => {

  function download() {
    const btn = document.getElementById('pdf-btn');
    btn.textContent = '[ מכין... ]';
    btn.disabled = true;

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const W = 210, H = 297;
      const S      = Game.getState();
      const name   = Game.getPlayerName();
      const cat    = Game.getSelectedCat();
      const activeQ = Game.getActiveQ();
      const cfg    = CAT_CONFIG[cat];
      const pct    = Math.round(S.correct / activeQ.length * 100);

      const RANKS = [
        [88, 'MASTER ENGINEER'],
        [62, 'PODCAST PRO'],
        [38, 'TRAINEE'],
        [0,  'INTERN'],
      ];
      const rank = RANKS.find(x => pct >= x[0])[1];

      const now     = new Date();
      const dateStr = now.toLocaleDateString('he-IL', { year:'numeric', month:'long', day:'numeric' });
      const timeStr = now.toLocaleTimeString('he-IL', { hour:'2-digit', minute:'2-digit' });

      /* ---- helpers ---- */
      const hexToRGB = hex => {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return [r, g, b];
      };
      const scoreColor = pct >= 88 ? [0,255,136] : pct >= 62 ? [255,170,0] : [255,51,51];
      const catRGB     = hexToRGB(cfg.color);

      /* ================================================================
         PAGE BACKGROUND
      ================================================================ */
      doc.setFillColor(8, 11, 15);
      doc.rect(0, 0, W, H, 'F');

      /* ================================================================
         HEADER BAR
      ================================================================ */
      doc.setFillColor(13, 17, 23);
      doc.rect(0, 0, W, 40, 'F');

      // accent left stripe
      doc.setFillColor(0, 255, 136);
      doc.rect(0, 0, 3, 40, 'F');

      // bottom border
      doc.setDrawColor(30, 58, 42);
      doc.setLineWidth(0.6);
      doc.line(0, 40, W, 40);

      // title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(0, 255, 136);
      doc.text('STUDIO_7  //  ESCAPE ROOM', W / 2, 14, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(74, 122, 90);
      doc.text('PODCAST ACADEMY  //  MISSION DEBRIEF REPORT', W / 2, 21, { align: 'center' });

      // date top-right
      doc.setFontSize(7);
      doc.text(dateStr + '  |  ' + timeStr, W - 10, 10, { align: 'right' });

      // decorative corner dots
      [[10,8],[14,8],[18,8]].forEach(([x,y]) => {
        doc.setFillColor(30, 58, 42);
        doc.circle(x, y, 1.5, 'F');
      });

      /* ================================================================
         AGENT CARD
      ================================================================ */
      const cardY = 46, cardH = 105;
      doc.setFillColor(13, 17, 23);
      doc.setDrawColor(30, 58, 42);
      doc.setLineWidth(0.4);
      doc.roundedRect(12, cardY, W - 24, cardH, 2, 2, 'FD');

      // top accent bar in category color
      doc.setFillColor(...catRGB);
      doc.rect(12, cardY, W - 24, 1.5, 'F');

      // section label
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(74, 122, 90);
      doc.text('// AGENT IDENTIFICATION', 20, cardY + 12);

      // player name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(0, 204, 255);
      doc.text(name, 20, cardY + 24);

      // category badge
      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...catRGB);
      const catNameClean = cfg.name.replace(/[^\x00-\x7F\u05D0-\u05EA ]/g, '').trim();
      doc.text('MISSION CATEGORY:  ' + catNameClean, 20, cardY + 32);

      // big percentage
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(60);
      doc.setTextColor(...scoreColor);
      doc.text(pct + '%', W - 18, cardY + 36, { align: 'right' });

      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(74, 122, 90);
      doc.text('FINAL SCORE', W - 18, cardY + 43, { align: 'right' });

      // divider
      doc.setDrawColor(30, 58, 42);
      doc.setLineWidth(0.3);
      doc.line(20, cardY + 48, W - 20, cardY + 48);

      // stats grid
      const stats = [
        { lbl: 'CORRECT',  val: S.correct + ' / ' + activeQ.length, col: [0, 255, 136] },
        { lbl: 'ERRORS',   val: String(S.wrong),                     col: [255, 51, 51] },
        { lbl: 'PTS',      val: String(S.score),                     col: [255, 170, 0] },
        { lbl: 'RANK',     val: rank,                                 col: scoreColor    },
      ];
      const colW = (W - 40) / 4;
      stats.forEach((st, i) => {
        const x = 20 + i * colW + colW / 2;
        doc.setFontSize(7);
        doc.setTextColor(74, 122, 90);
        doc.setFont('courier', 'normal');
        doc.text('// ' + st.lbl, x, cardY + 59, { align: 'center' });
        doc.setFontSize(15);
        doc.setTextColor(...st.col);
        doc.setFont('helvetica', 'bold');
        doc.text(st.val, x, cardY + 70, { align: 'center' });
      });

      // progress bar
      const barX = 20, barY = cardY + 78, barW = W - 40, barH = 5;
      doc.setFillColor(26, 42, 30);
      doc.roundedRect(barX, barY, barW, barH, 1.5, 1.5, 'F');
      const fillW = barW * (pct / 100);
      doc.setFillColor(...scoreColor);
      doc.roundedRect(barX, barY, fillW, barH, 1.5, 1.5, 'F');

      // progress label
      doc.setFontSize(7);
      doc.setFont('courier', 'normal');
      doc.setTextColor(30, 58, 42);
      doc.text('MISSION COMPLETE  //  STUDIO_7 ESCAPE ROOM', W / 2, cardY + 99, { align: 'center' });

      /* ================================================================
         QUESTION LOG
      ================================================================ */
      const logY = cardY + cardH + 8;

      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 255, 136);
      doc.text('// MISSION LOG  —  QUESTION BREAKDOWN', 20, logY);

      doc.setDrawColor(0, 255, 136);
      doc.setLineWidth(0.3);
      doc.line(20, logY + 3, W - 20, logY + 3);

      // table header
      doc.setFillColor(13, 30, 20);
      doc.rect(20, logY + 5, W - 40, 7, 'F');

      doc.setFontSize(7);
      doc.setFont('courier', 'bold');
      doc.setTextColor(74, 122, 90);
      doc.text('#',        22, logY + 10);
      doc.text('QUESTION', 34, logY + 10);
      doc.text('STATUS',   152, logY + 10);
      doc.text('RESULT',   174, logY + 10);

      // table rows
      let ry = logY + 12;
      activeQ.forEach((q, i) => {
        if (ry > H - 22) return; // clip if overflow

        if (i % 2 === 0) {
          doc.setFillColor(10, 18, 13);
          doc.rect(20, ry, W - 40, 7, 'F');
        }

        // row number
        doc.setFont('courier', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(74, 122, 90);
        doc.text(String(i + 1).padStart(2, '0'), 22, ry + 4.5);

        // question text (truncate)
        const qShort = q.text.length > 60 ? q.text.slice(0, 60) + '…' : q.text;
        doc.setTextColor(180, 220, 180);
        doc.text(qShort, 34, ry + 4.5, { maxWidth: 115 });

        // status
        const isCorrect = S.history[i];
        if (isCorrect === true) {
          doc.setTextColor(0, 255, 136);
          doc.text('PASS  ✓', 152, ry + 4.5);
        } else if (isCorrect === false) {
          doc.setTextColor(255, 51, 51);
          doc.text('FAIL  ✕', 152, ry + 4.5);
        } else {
          doc.setTextColor(74, 122, 90);
          doc.text('—', 152, ry + 4.5);
        }

        // result points
        doc.setTextColor(255, 170, 0);
        doc.text(isCorrect === true ? '+pts' : '—', 174, ry + 4.5);

        ry += 7;
      });

      /* ================================================================
         FOOTER
      ================================================================ */
      doc.setFillColor(13, 17, 23);
      doc.rect(0, H - 16, W, 16, 'F');

      doc.setDrawColor(30, 58, 42);
      doc.setLineWidth(0.3);
      doc.line(0, H - 16, W, H - 16);

      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(74, 122, 90);
      doc.text('STUDIO_7  //  PODCAST ESCAPE ROOM', 12, H - 9);
      doc.text('GENERATED: ' + dateStr, W - 12, H - 9, { align: 'right' });

      doc.setTextColor(30, 58, 42);
      doc.setFontSize(6);
      doc.text('CONFIDENTIAL  —  AGENT COPY ONLY', W / 2, H - 4, { align: 'center' });

      /* ---- Save ---- */
      const fname = 'Studio7_' + name.replace(/\s+/g, '_') + '_' + pct + 'pct.pdf';
      doc.save(fname);

    } catch (e) {
      alert('שגיאה ביצירת ה-PDF: ' + e.message);
      console.error(e);
    }

    btn.textContent = '[ הורד PDF 📄 ]';
    btn.disabled = false;
  }

  return { download };
})();
