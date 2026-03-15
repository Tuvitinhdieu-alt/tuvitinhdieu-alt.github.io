// Hàm lấy màu cho Can hoặc Chi (dùng cho trường hợp cần truyền vào 1 chuỗi Can hoặc Chi bất kỳ)
function getCanChiElementColor(canChi, fallbackColor = '#0b3a80') {
  const can = String(canChi).trim();
  // Ưu tiên tra Can trước, nếu không có thì tra Chi
  let element = STEM_TO_ELEMENT[can];
  if (!element) element = CHI_TO_ELEMENT[can];
  return element ? ELEMENT_COLOR[element] : fallbackColor;
}
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './HoroscopeCanvas.css';

const BASE_WIDTH = 900;
const BASE_HEIGHT = 1200;

const PAIR_POSITION = {
  'Thìn_Tỵ': { x: 0.125, y: 0.25 },
  'Dần_Mão': { x: 0.125, y: 0.75 },
  'Thân_Dậu': { x: 0.875, y: 0.25 },
  'Tuất_Hợi': { x: 0.875, y: 0.75 },
  'Ngọ_Mùi': { x: 0.5, y: 0.25 },
  'Tý_Sửu': { x: 0.5, y: 0.75 }
};

function measureTextWidth(ctx, text, fontSize, fontWeight, fontFamily) {
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  return ctx.measureText(String(text || '')).width;
}

function drawTextWithSpacing(ctx, text, x, y, spacing, align) {
  const chars = Array.from(String(text || ''));
  if (chars.length === 0) return;

  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((acc, w) => acc + w, 0) + spacing * Math.max(0, chars.length - 1);

  let cursor = x;
  if (align === 'center') cursor = x - total / 2;
  if (align === 'right') cursor = x - total;

  chars.forEach((ch, idx) => {
    ctx.fillText(ch, cursor, y);
    cursor += widths[idx] + spacing;
  });
}

function drawFittedSingleLine(ctx, options) {
  const {
    text,
    x,
    y,
    maxWidth,
    color = '#000000',
    fontSize = 20,
    minFontSize = 11,
    fontWeight = 700,
    fontFamily = "'Times New Roman', 'Noto Serif', serif",
    align = 'left'
  } = options;

  const raw = String(text || '');
  let fittedSize = fontSize;
  let textWidth = measureTextWidth(ctx, raw, fittedSize, fontWeight, fontFamily);

  while (textWidth > maxWidth && fittedSize > minFontSize) {
    fittedSize -= 1;
    textWidth = measureTextWidth(ctx, raw, fittedSize, fontWeight, fontFamily);
  }

  ctx.font = `${fontWeight} ${fittedSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  if (textWidth <= maxWidth) {
    ctx.textAlign = align;
    ctx.fillText(raw, x, y);
    return;
  }

  const chars = Array.from(raw);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const rawWidth = widths.reduce((acc, w) => acc + w, 0);
  const spacing = chars.length > 1 ? Math.min(0.8, (maxWidth - rawWidth) / (chars.length - 1)) : 0;

  drawTextWithSpacing(ctx, raw, x, y, spacing, align);
}

function truncateTextToWidth(ctx, text, maxWidth) {
  const raw = String(text || '');
  if (!raw) return '';
  if (ctx.measureText(raw).width <= maxWidth) return raw;

  const ellipsis = '...';
  const ellipsisWidth = ctx.measureText(ellipsis).width;
  if (ellipsisWidth > maxWidth) return '';

  let left = 0;
  let right = raw.length;
  while (left < right) {
    const mid = Math.ceil((left + right) / 2);
    const candidate = raw.slice(0, mid);
    if (ctx.measureText(candidate).width + ellipsisWidth <= maxWidth) {
      left = mid;
    } else {
      right = mid - 1;
    }
  }

  return `${raw.slice(0, left)}${ellipsis}`;
}

// Bảng màu ngũ hành đúng yêu cầu
const ELEMENT_COLOR = {
  Moc: '#16a34a', // Xanh lá
  Hoa: '#ef4444', // Đỏ
  Tho: '#d4a017', // Vàng
  Kim: '#838181', // Trắng
  Thuy: '#111111' // Đen
};

// Mapping thiên can
const STEM_TO_ELEMENT = {
  Giáp: 'Moc', Ất: 'Moc',
  Bính: 'Hoa', Đinh: 'Hoa',
  Mậu: 'Tho', Kỷ: 'Tho',
  Canh: 'Kim', Tân: 'Kim',
  Nhâm: 'Thuy', Quý: 'Thuy'
};
// Mapping địa chi
const CHI_TO_ELEMENT = {
  Dần: 'Moc', Mão: 'Moc',
  Tỵ: 'Hoa', Ngọ: 'Hoa',
  Thìn: 'Tho', Tuất: 'Tho', Sửu: 'Tho', Mùi: 'Tho',
  Thân: 'Kim', Dậu: 'Kim',
  Tý: 'Thuy', Hợi: 'Thuy'
};

function getCanColor(can, fallbackColor = '#0b3a80') {
  const element = STEM_TO_ELEMENT[String(can).trim()];
  return element ? ELEMENT_COLOR[element] : fallbackColor;
}
function getChiColor(chi, fallbackColor = '#0b3a80') {
  const element = CHI_TO_ELEMENT[String(chi).trim()];
  return element ? ELEMENT_COLOR[element] : fallbackColor;
}

function HoroscopeCanvas({
  palaces,
  centerInfo,
  tuanTrietInfo,
  isNamPhaiOff,
  isTuHoaMode,
  overlay = null
}) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const holdTimerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const fontFamily = useMemo(() => "'Times New Roman', 'Noto Serif', serif", []);

  // Fix common typos or data-entry variants in star names before rendering
  const fixStarName = (raw) => {
    if (!raw) return raw;
    return String(raw)
      .replace(/Dươn/g, 'Dương')
      .replace(/Dươngg/g, 'Dương')
      .replace(/Duon/g, 'Dương')
      .replace(/D/g, 'Dương');
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const link = document.createElement('a');
    link.download = 'laso_tuvi.png';
    link.href = image;
    link.click();
  };

  useEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) return;
      const available = wrapperRef.current.clientWidth;
      const nextScale = Math.min(1, Math.max(0.2, available / BASE_WIDTH));
      setScale(nextScale);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

    window.addEventListener('resize', updateScale);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(BASE_WIDTH * dpr);
    canvas.height = Math.floor(BASE_HEIGHT * dpr);
    canvas.style.width = `${BASE_WIDTH}px`;
    canvas.style.height = `${BASE_HEIGHT}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    ctx.fillStyle = '#e5e4e0';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    const cellW = BASE_WIDTH / 4;
    const cellH = BASE_HEIGHT / 4;
    const lineColor = '#111111';

    const palaceRects = palaces.map((item) => ({
      key: item.label,
      x: (item.col - 1) * cellW,
      y: (item.row - 1) * cellH,
      w: cellW,
      h: cellH,
      data: item
    }));

    const centerRect = {
      x: cellW,
      y: cellH,
      w: cellW * 2,
      h: cellH * 2
    };

    palaceRects.forEach((rect) => {
      ctx.fillStyle = '#ecebe7';
      ctx.fillRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
    });

    ctx.fillStyle = '#ecebe7';
    ctx.fillRect(centerRect.x + 1, centerRect.y + 1, centerRect.w - 2, centerRect.h - 2);

    const segments = new Map();
    const addSegment = (x1, y1, x2, y2) => {
      const key = `${x1},${y1},${x2},${y2}`;
      const reverseKey = `${x2},${y2},${x1},${y1}`;
      if (segments.has(reverseKey)) {
        segments.set(reverseKey, segments.get(reverseKey) + 1);
      } else {
        segments.set(key, (segments.get(key) || 0) + 1);
      }
    };

    [...palaceRects.map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h })), centerRect].forEach((r) => {
      addSegment(r.x, r.y, r.x + r.w, r.y);
      addSegment(r.x + r.w, r.y, r.x + r.w, r.y + r.h);
      addSegment(r.x + r.w, r.y + r.h, r.x, r.y + r.h);
      addSegment(r.x, r.y + r.h, r.x, r.y);
    });

    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    Array.from(segments.keys()).forEach((k) => {
      const [x1, y1, x2, y2] = k.split(',').map(Number);
      ctx.moveTo(x1 + 0.5, y1 + 0.5);
      ctx.lineTo(x2 + 0.5, y2 + 0.5);
    });

    ctx.stroke();

    // Ensure the outer right and bottom borders are drawn (fix missing edges)
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, BASE_WIDTH - 1, BASE_HEIGHT - 1);

    const drawPalaceContent = (rect) => {
      const {
        palaceTitle,
        thanMarker,
        canChiTop,
        daiVan,
        mainStars,
        leftSubStars,
        rightSubStars,
        luuGoodStars,
        luuOtherStars,
        trangSinh,
        tieuHan,
        thangHan,
        thaiTueSequence
      } = rect.data;


      const contentX = rect.x + 12;
      const contentY = rect.y + 12;
      const contentW = rect.w - 24;
      const contentH = rect.h - 24;
      // Move header row higher (closer to top of cell)
      const headerY = contentY + 6;



      // Draw palace title and <Thân> right next to each other, not centered as a block
      const palaceTitleFontSize = 16;
      ctx.font = `700 ${palaceTitleFontSize}px ${fontFamily}`;
      ctx.fillStyle = '#111111';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      const titleX = rect.x + rect.w / 2;
      if (thanMarker) {
        // Vẽ tên cung trước (layer trên), <Thân> vẽ sau (layer dưới), chỉ cho trùng đến dấu "<"
        const palaceTitleFontSize = 18;
        const thanFontSize = 17;
        // Đo width tên cung với font 18px
        ctx.font = `700 ${palaceTitleFontSize}px ${fontFamily}`;
        const titleWidth = ctx.measureText(palaceTitle).width;
        // Đo width <Thân> với font 17px
        ctx.font = `700 ${thanFontSize}px ${fontFamily}`;
        const thanWidth = ctx.measureText('<Thân>').width;
        const thanLeftWidth = ctx.measureText('<').width;
        // Tính vị trí để chữ "<" của <Thân> nằm ngay dưới chữ cuối cùng của tên cung
        const startX = titleX - (titleWidth + thanWidth - thanLeftWidth) / 2;
        // Vẽ <Thân> trước (layer dưới)
        ctx.textAlign = 'left';
        ctx.fillStyle = '#d32f2f';
        ctx.font = `700 ${thanFontSize}px ${fontFamily}`;
        ctx.fillText('<Thân>', startX + titleWidth - thanLeftWidth, headerY);
        // Vẽ tên cung đè lên (layer trên)
        ctx.font = `700 ${palaceTitleFontSize}px ${fontFamily}`;
        ctx.fillStyle = '#111111';
        ctx.fillText(palaceTitle, startX, headerY);
      } else {
        ctx.textAlign = 'center';
        ctx.font = `700 18px ${fontFamily}`;
        ctx.fillText(palaceTitle, titleX, headerY);
      }

      // Draw can chi: move to left edge, font size 15px, align left
      drawFittedSingleLine(ctx, {
        text: canChiTop,
        x: rect.x + 4, // sát viền trái
        y: headerY,
        maxWidth: contentW * 0.30,
        color: '#0033cc',
        fontSize: 15,
        minFontSize: 10,
        fontWeight: 700,
        fontFamily,
        align: 'left'
      });

      drawFittedSingleLine(ctx, {
        text: daiVan || '',
        x: rect.x + rect.w - 14,
        y: headerY,
        maxWidth: contentW * 0.2,
        color: '#111111',
        fontSize: 14,
        minFontSize: 10,
        fontWeight: 700,
        fontFamily,
        align: 'right'
      });

      // Move main stars (chính tinh) higher up
      const starTop = contentY + 32;

      // Draw niên hóa labels (A/B/C/D) as a left-aligned red column, if provided on palace data
      const nienHoa = rect.data.nienHoa || [];
      if (Array.isArray(nienHoa) && nienHoa.length > 0) {
        ctx.save();
        const nienFontSize = 20;
        ctx.font = `700 ${nienFontSize}px ${fontFamily}`;
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.textBaseline = 'middle';
        // We'll compute circle center based on text width so circle hugs the label closely.
        const labelLeft = rect.x + 6; // left inset
        nienHoa.slice(0, 6).forEach((label, i) => {
          const text = String(label || '');
          const y = starTop + i * 22;
          const textWidth = ctx.measureText(text).width;
          const padding = 3;
          const minRadius = nienFontSize * 0.7;
          const radius = Math.max(textWidth / 2 + padding, minRadius);
          const cx = labelLeft + radius;
          const cy = y;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.textAlign = 'center';
          ctx.fillText(text, cx, cy);
        });
        ctx.restore();
      }

      mainStars.slice(0, 6).forEach((star, idx) => {
        drawFittedSingleLine(ctx, {
          text: fixStarName(star.text),
          x: rect.x + rect.w / 2,
          y: starTop + idx * 22,
          maxWidth: contentW - 8,
          color: star.color,
          fontSize: 22,
          minFontSize: 11,
          fontWeight: 700,
          fontFamily,
          align: 'center'
        });
      });

      if (!isNamPhaiOff) {
        // Move left sub-stars closer to the left border
        const leftX = rect.x + 4;
        // Start x for right column adjusted leftwards and aligned to left
        // Shift further left by increasing the subtraction value
        const rightStart = rect.x + rect.w - 12 - contentW * 0.44 - 14;
        const subTop = starTop + 22 * Math.max(2, Math.min(mainStars.length, 6)) + 8;

        // Render all sub-stars (phụ tinh) with a fixed font size for visual consistency
        const subStarFontSize = 15;
        const subStarFontWeight = 700;

        ctx.textBaseline = 'middle';

        // Left column: fixed font, always show full text (no truncate)
        ctx.textAlign = 'left';
        ctx.font = `${subStarFontWeight} ${subStarFontSize}px ${fontFamily}`;
        [...leftSubStars, ...luuGoodStars].slice(0, 8).forEach((star, idx) => {
          const yPos = subTop + idx * 18;
          ctx.fillStyle = star.color || '#111111';
          ctx.fillText(fixStarName(star.text), leftX, yPos);
        });

        // Right column: left-aligned and shifted left to match left column alignment, always show full text
        ctx.textAlign = 'left';
        ctx.font = `${subStarFontWeight} ${subStarFontSize}px ${fontFamily}`;
        [...rightSubStars, ...luuOtherStars].slice(0, 8).forEach((star, idx) => {
          const yPos = subTop + idx * 18;
          ctx.fillStyle = star.color || '#111111';
          ctx.fillText(fixStarName(star.text), rightStart, yPos);
        });
      }

      if (isTuHoaMode && thaiTueSequence) {
        drawFittedSingleLine(ctx, {
          text: thaiTueSequence,
          x: rect.x + rect.w / 2,
          y: rect.y + rect.h - 50,
          maxWidth: contentW,
          color: '#111111',
          fontSize: 17,
          minFontSize: 10,
          fontWeight: 700,
          fontFamily,
          align: 'center'
        });
      }


      // Place Tràng Sinh, Tiểu Hạn, Hạn Tháng cách đáy 20px
      const bottomInfoY = rect.y + rect.h - 20;

      // Nhóm Tiểu Hạn, Tràng Sinh, Hạn Tháng: cùng cỡ chữ nhỏ hơn, đều nhau
      const bottomInfoFontSize = 15;
      drawFittedSingleLine(ctx, {
        text: trangSinh || '',
        x: rect.x + rect.w / 2,
        y: bottomInfoY,
        maxWidth: contentW,
        color: '#111111',
        fontSize: bottomInfoFontSize,
        minFontSize: 10,
        fontWeight: 700,
        fontFamily,
        align: 'center'
      });


      // Khoanh tròn tiểu hạn nếu trùng năm hạn hiện tại
      const namHanCanChi = centerInfo?.namHanCanChi || '';
      const namHanChi = namHanCanChi.split(' ').pop() || '';
      const isCurrentTieuHan = tieuHan && tieuHan === namHanChi;

      // Vẽ tiểu hạn
      drawFittedSingleLine(ctx, {
        text: tieuHan || '',
        x: rect.x + 6,
        y: bottomInfoY,
        maxWidth: contentW * 0.5,
        color: '#111111',
        fontSize: bottomInfoFontSize,
        minFontSize: 10,
        fontWeight: 700,
        fontFamily,
        align: 'left'
      });

      // Nếu là tiểu hạn năm hạn thì khoanh hình chữ nhật bo góc
      if (isCurrentTieuHan) {
        ctx.save();
        ctx.beginPath();
        ctx.font = `700 ${bottomInfoFontSize}px ${fontFamily}`;
        const textWidth = ctx.measureText(tieuHan).width;
        const padX = 3;
        const padY = 2;
        const rectX = rect.x + 6 - padX;
        const rectY = bottomInfoY - bottomInfoFontSize / 2 - padY;
        const rectW = textWidth + padX * 2;
        const rectH = bottomInfoFontSize + padY * 2;
        const radius = Math.min(4, rectH / 2);
        // Vẽ rounded rect
        ctx.strokeStyle = '#d32f2f';
        ctx.lineWidth = 2;
        ctx.moveTo(rectX + radius, rectY);
        ctx.lineTo(rectX + rectW - radius, rectY);
        ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + radius);
        ctx.lineTo(rectX + rectW, rectY + rectH - radius);
        ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - radius, rectY + rectH);
        ctx.lineTo(rectX + radius, rectY + rectH);
        ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - radius);
        ctx.lineTo(rectX, rectY + radius);
        ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
        ctx.stroke();
        ctx.restore();
      }

      drawFittedSingleLine(ctx, {
        text: thangHan || '',
        x: rect.x + rect.w - 12,
        y: bottomInfoY,
        maxWidth: contentW * 0.34,
        color: '#111111',
        fontSize: bottomInfoFontSize,
        minFontSize: 10,
        fontWeight: 700,
        fontFamily,
        align: 'right'
      });
    };

    palaceRects.forEach(drawPalaceContent);

    // Draw "Tử Vi Tinh Diệu" and underline
    const ttdText = 'Tử Vi Tinh Diệu';
    const ttdFont = `800 31px 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
    ctx.font = ttdFont;
    ctx.fillStyle = '#1144cc';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    const ttdX = centerRect.x + centerRect.w / 2;
    const ttdY = centerRect.y + 70; // lui xuống 16px
    ctx.fillText(ttdText, ttdX, ttdY);
    // Draw underline
    const ttdWidth = ctx.measureText(ttdText).width;
    ctx.beginPath();
    ctx.strokeStyle = '#1144cc';
    ctx.lineWidth = 2;
    ctx.moveTo(ttdX - ttdWidth / 2, ttdY + 22); // 22px dưới baseline
    ctx.lineTo(ttdX + ttdWidth / 2, ttdY + 22);
    ctx.stroke();

    drawFittedSingleLine(ctx, {
      text: 'Lá Số Tử Vi',
      x: centerRect.x + centerRect.w / 2,
      y: centerRect.y + 120, // lui xuống 16px so với trước
      maxWidth: centerRect.w - 56,
      color: '#1e3a8a',
      fontSize: 24,
      minFontSize: 14,
      fontWeight: 700,
      fontFamily,
      align: 'center'
    });

    const infoRows = [
      { label: 'Họ tên', value: centerInfo.name },
      { label: 'Năm sinh', value: centerInfo.namSinh, sideText: centerInfo?.batTu?.nam || '-' },
      { label: 'Tháng sinh', value: centerInfo.thangSinh, sideText: centerInfo?.batTu?.thang || '-' },
      { label: 'Ngày sinh', value: centerInfo.ngaySinh, sideText: centerInfo?.batTu?.ngay || '-' },
      { label: 'Giờ sinh', value: centerInfo.gioSinh, sideText: centerInfo?.batTu?.gio || '-' },
      { label: 'Năm hạn', value: centerInfo.namHan, sideText: centerInfo.namHanCanChi || '-' },
      { label: 'Âm Dương', value: centerInfo.amDuong, sideText: centerInfo.tuoi ? `${centerInfo.tuoi} tuổi` : '-' },
      { label: 'Mệnh', value: centerInfo.menh },
      { label: 'Cục', value: centerInfo.cuc }
    ];

    // Dịch toàn bộ cụm infoRows sang phải 20px
    const infoOffsetX = 20;
    const labelX = centerRect.x + 28 + infoOffsetX;
    const valueX = centerRect.x + 136 + infoOffsetX;
    const batTuValueX = centerRect.x + 304 + infoOffsetX;
    const rowTop = centerRect.y + 170; // Dịch cụm infoRows xuống thấp hơn 40px
    const rowGap = 25;
    const labelMaxWidth = valueX - labelX - 12;
    const valueMaxWidth = batTuValueX - valueX - 18;
    const batTuMaxWidth = centerRect.x + centerRect.w - batTuValueX - 18;

    const drawFixedLine = ({ text, x, y, maxWidth, color, fontSize, fontWeight, align = 'left' }) => {
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      ctx.textAlign = align;

      const fitted = truncateTextToWidth(ctx, text, maxWidth);
      ctx.fillText(fitted, x, y);
    };

    infoRows.forEach(({ label, value, sideText }, idx) => {
      // Thêm 1 dòng trống giữa 'Giờ sinh' (4) và 'Năm hạn' (5)
      const y = rowTop + idx * rowGap + (idx > 4 ? rowGap : 0);
      const isPrimaryRow = idx <= 8;
      const isBatTuSide = label === 'Năm sinh' || label === 'Tháng sinh' || label === 'Ngày sinh' || label === 'Giờ sinh';
      const sideColor = isBatTuSide || label === 'Năm hạn'
        ? getCanChiElementColor(sideText, '#0b3a80')
        : '#0b3a80';

      drawFixedLine({
        text: `${label}:`,
        x: labelX,
        y,
        maxWidth: labelMaxWidth,
        color: '#0b2b57',
        fontSize: isPrimaryRow ? 18 : 14,
        fontWeight: 700,
        align: 'left'
      });

      // Nếu là dòng đại hạn (daiVan) thì để màu đen, còn lại giữ nguyên
      drawFixedLine({
        text: value || '-',
        x: valueX,
        y,
        maxWidth: valueMaxWidth,
        color: label === 'Đại hạn' ? '#111111' : '#1144cc',
        fontSize: isPrimaryRow ? 18 : 14,
        fontWeight: 600,
        align: 'left'
      });

      if (sideText) {
        // Nếu là bát tự (can chi), tách màu từng phần
        if (label === 'Năm sinh' || label === 'Tháng sinh' || label === 'Ngày sinh' || label === 'Giờ sinh' || label === 'Năm hạn') {
          const parts = String(sideText).split(' ');
          const can = parts[0] || '';
          const chi = parts[1] || '';
          const canColor = getCanColor(can, '#0b3a80');
          const chiColor = getChiColor(chi, '#0b3a80');
          // Vẽ can
          drawFixedLine({
            text: can,
            x: batTuValueX,
            y,
            maxWidth: batTuMaxWidth,
            color: canColor,
            fontSize: isPrimaryRow ? 18 : 14,
            fontWeight: 700,
            align: 'left'
          });
          // Đo width can để vẽ chi sát bên
          ctx.font = `700 ${isPrimaryRow ? 18 : 14}px ${fontFamily}`;
          const canWidth = ctx.measureText(can).width;
          drawFixedLine({
            text: chi,
            x: batTuValueX + canWidth + 4,
            y,
            maxWidth: batTuMaxWidth - canWidth - 4,
            color: chiColor,
            fontSize: isPrimaryRow ? 18 : 14,
            fontWeight: 700,
            align: 'left'
          });
        } else {
          drawFixedLine({
            text: sideText,
            x: batTuValueX,
            y,
            maxWidth: batTuMaxWidth,
            color: sideColor,
            fontSize: isPrimaryRow ? 18 : 14,
            fontWeight: 700,
            align: 'left'
          });
        }
      }
    });

    // Đẩy các dòng này lên cao hơn, cách dòng "Cục" 2 dòng (rowGap)
    const lastInfoY = rowTop + (infoRows.length - 1) * rowGap + (infoRows.length > 5 ? rowGap : 0); // y của dòng "Cục"
    const extraY = 2 * rowGap;

    // Vẽ một dòng kẻ mờ, nét đứt, kéo dài đến sát 2 mép biên trước phần "Cục sinh mệnh"
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = 'rgba(100,100,100,0.25)';
    ctx.lineWidth = 1.2;
    // Dời dòng kẻ lên cao hơn một chút (ví dụ: thêm -8px)
    const dashLineY = lastInfoY + extraY - rowGap/2 - 8;
    ctx.moveTo(centerRect.x + 2, dashLineY);
    ctx.lineTo(centerRect.x + centerRect.w - 2, dashLineY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    drawFittedSingleLine(ctx, {
      text: centerInfo.menhCucRelation,
      x: centerRect.x + centerRect.w / 2,
      y: lastInfoY + extraY,
      maxWidth: centerRect.w - 48,
      color: '#d32f2f',
      fontSize: 18,
      minFontSize: 12,
      fontWeight: 700,
      fontFamily,
      align: 'center'
    });

    drawFittedSingleLine(ctx, {
      text: centerInfo.amDuongTrangThai,
      x: centerRect.x + centerRect.w / 2,
      y: lastInfoY + extraY + rowGap,
      maxWidth: centerRect.w - 48,
      color: '#d32f2f',
      fontSize: 17,
      minFontSize: 12,
      fontWeight: 700,
      fontFamily,
      align: 'center'
    });

    drawFittedSingleLine(ctx, {
      text: centerInfo.hanHi,
      x: centerRect.x + centerRect.w / 2,
      y: lastInfoY + extraY + 2 * rowGap,
      maxWidth: centerRect.w - 40,
      color: '#1144cc',
      fontSize: 15,
      minFontSize: 11,
      fontWeight: 600,
      fontFamily,
      align: 'center'
    });

    const { tuan, triet } = tuanTrietInfo || {};
    const drawTT = (label, key) => {
      const pos = PAIR_POSITION[key];
      if (!pos) return;

      // Draw a filled black rectangle background around the label (smaller)
      const ttFontSize = 11; // reduced font size
      const ttFontWeight = 700;
      ctx.font = `${ttFontWeight} ${ttFontSize}px ${fontFamily}`;
      const textWidth = ctx.measureText(label).width;
      const padX = 4; // reduced horizontal padding
      const padY = 3; // reduced vertical padding
      const cx = BASE_WIDTH * pos.x;
      const cy = BASE_HEIGHT * pos.y;
      const rectX = cx - textWidth / 2 - padX;
      const rectY = cy - ttFontSize / 2 - padY;
      const rectW = textWidth + padX * 2;
      const rectH = ttFontSize + padY * 2;

      // Filled black rectangle as background
      ctx.beginPath();
      ctx.fillStyle = '#000000';
      ctx.fillRect(rectX, rectY, rectW, rectH);

      // Draw label in white on top (smaller)
      drawFittedSingleLine(ctx, {
        text: label,
        x: cx,
        y: cy,
        maxWidth: 180,
        color: '#ffffff',
        fontSize: ttFontSize,
        minFontSize: 7,
        fontWeight: ttFontWeight,
        fontFamily,
        align: 'center'
      });
    };

    if (tuan && triet && tuan === triet) {
      drawTT('Tuần - Triệt', tuan);
    } else {
      if (tuan) drawTT('Tuần', tuan);
      if (triet) drawTT('Triệt', triet);
    }

    // Đưa @Tuvitinhdieu xuống sát đáy thiên bàn
    drawFittedSingleLine(ctx, {
      text: '@Tuvitinhdieu',
      x: centerRect.x + centerRect.w / 2,
      y: centerRect.y + centerRect.h - 10,
      maxWidth: centerRect.w - 40,
      color: '#6b7280',
      fontSize: 13,
      minFontSize: 10,
      fontWeight: 600,
      fontFamily,
      align: 'center'
    });
  }, [palaces, centerInfo, tuanTrietInfo, isNamPhaiOff, isTuHoaMode, fontFamily]);

  const handlePointerDown = () => {
    holdTimerRef.current = setTimeout(() => {
      downloadImage();
    }, 700);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  return (
    <div className="horoscope-canvas-root">
      <button type="button" className="horoscope-download-btn" onClick={downloadImage}>
        Tải lá số
      </button>

      <div className="horoscope-canvas-stage" ref={wrapperRef}>
        <div
          className="horoscope-canvas-scale"s
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `scale(${scale})`
          }}
        >
          <canvas
            ref={canvasRef}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />

          {overlay ? <div className="horoscope-canvas-overlay">{overlay}</div> : null}
        </div>
      </div>
    </div>
  );
}

export default HoroscopeCanvas;
