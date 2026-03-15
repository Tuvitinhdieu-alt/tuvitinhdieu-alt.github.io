import React, { useMemo } from 'react';

const TU_HOA_TABLE = {
  'Giáp': { A: 'Liêm Trinh', B: 'Phá Quân', C: 'Vũ Khúc', D: 'Thái Dương' },
  'Ất': { A: 'Thiên Cơ', B: 'Thiên Lương', C: 'Tử Vi', D: 'Thái Âm' },
  'Bính': { A: 'Thiên Đồng', B: 'Thiên Cơ', C: 'Văn Xương', D: 'Liêm Trinh' },
  'Đinh': { A: 'Thái Âm', B: 'Thiên Đồng', C: 'Thiên Cơ', D: 'Cự Môn' },
  'Mậu': { A: 'Tham Lang', B: 'Thái Âm', C: 'Hữu Bật', D: 'Thiên Cơ' },
  'Kỷ': { A: 'Vũ Khúc', B: 'Tham Lang', C: 'Thiên Lương', D: 'Văn Khúc' },
  'Canh': { A: 'Thái Dương', B: 'Vũ Khúc', C: 'Thái Âm', D: 'Thiên Đồng' },
  'Tân': { A: 'Cự Môn', B: 'Thái Dương', C: 'Văn Khúc', D: 'Văn Xương' },
  'Nhâm': { A: 'Thiên Lương', B: 'Tử Vi', C: 'Tả Phù', D: 'Vũ Khúc' },
  'Quý': { A: 'Phá Quân', B: 'Cự Môn', C: 'Thái Âm', D: 'Tham Lang' }
};

const OPPOSITE_HOUSES = {
  'Tý': 'Ngọ', 'Ngọ': 'Tý',
  'Sửu': 'Mùi', 'Mùi': 'Sửu',
  'Dần': 'Thân', 'Thân': 'Dần',
  'Mão': 'Dậu', 'Dậu': 'Mão',
  'Thìn': 'Tuất', 'Tuất': 'Thìn',
  'Tỵ': 'Hợi', 'Hợi': 'Tỵ'
};

const stripVietnamese = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const normalizeKey = (value) => stripVietnamese(value).replace(/[^a-z0-9]/g, '');

const CAN_ALIAS = {
  giap: 'Giáp',
  at: 'Ất',
  binh: 'Bính',
  dinh: 'Đinh',
  mau: 'Mậu',
  ky: 'Kỷ',
  canh: 'Canh',
  tan: 'Tân',
  nham: 'Nhâm',
  quy: 'Quý',
  g: 'Giáp',
  a: 'Ất',
  b: 'Bính',
  d: 'Đinh',
  m: 'Mậu',
  k: 'Kỷ',
  c: 'Canh',
  t: 'Tân',
  n: 'Nhâm',
  q: 'Quý'
};

const OUTWARD_DIRECTIONS = {
  'Tý': 'DOWN', 'Sửu': 'DOWN', 'Dần': 'DOWN',
  'Mão': 'LEFT', 'Thìn': 'LEFT', 'Tỵ': 'UP',
  'Ngọ': 'UP', 'Mùi': 'UP', 'Thân': 'UP',
  'Dậu': 'RIGHT', 'Tuất': 'RIGHT', 'Hợi': 'DOWN'
};

// Horoscope grid in current layout is not square (900x1250), so X/Y percentages map to different px.
const CHART_ASPECT_RATIO = 1250 / 900;

const KhamThienTuHoa = ({ chartData, palaceCoordinates, cungChinhMap, isVisible }) => {
  const toPercent = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0%';
    return `${n}%`;
  };

  const getInnerBorderMidPoint = (coords) => {
    const xMin = coords.x;
    const xMax = coords.x + coords.width;
    const yMin = coords.y;
    const yMax = coords.y + coords.height;
    const px = coords.x + coords.width / 2;
    const py = coords.y + coords.height / 2;

    const dx = 50 - px;
    const dy = 50 - py;

    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx >= 0) return { x: xMax, y: py };
      return { x: xMin, y: py };
    }

    if (dy >= 0) return { x: px, y: yMax };
    return { x: px, y: yMin };
  };

  const getInnerCornerPoint = (coords) => {
    const xMin = coords.x;
    const xMax = coords.x + coords.width;
    const yMin = coords.y;
    const yMax = coords.y + coords.height;
    const px = coords.x + coords.width / 2;
    const py = coords.y + coords.height / 2;

    const towardRight = 50 >= px;
    const towardBottom = 50 >= py;

    return {
      x: towardRight ? xMax : xMin,
      y: towardBottom ? yMax : yMin
    };
  };

  const triangleLines = useMemo(() => {
    if (!palaceCoordinates || !cungChinhMap) return [];

    const normalizeTitle = (value) => stripVietnamese(value).replace(/[^a-z0-9]/g, '');
    const targetToChi = {};
    const targets = {
      menh: normalizeTitle('Mệnh'),
      tai: normalizeTitle('Tài Bạch'),
      quan: normalizeTitle('Quan Lộc')
    };

    Object.entries(cungChinhMap).forEach(([chi, title]) => {
      const n = normalizeTitle(title);
      if (n === targets.menh) targetToChi.menh = chi;
      if (n === targets.tai) targetToChi.tai = chi;
      if (n === targets.quan) targetToChi.quan = chi;
    });

    if (!targetToChi.menh || !targetToChi.tai || !targetToChi.quan) return [];

    const menhCoords = palaceCoordinates[targetToChi.menh];
    const taiCoords = palaceCoordinates[targetToChi.tai];
    const quanCoords = palaceCoordinates[targetToChi.quan];
    if (!menhCoords || !taiCoords || !quanCoords) return [];

    const CORNER_CHI = new Set(['Dần', 'Thân', 'Tỵ', 'Hợi']);
    const pickPoint = (chi, coords) => (CORNER_CHI.has(chi) ? getInnerCornerPoint(coords) : getInnerBorderMidPoint(coords));

    const menhPoint = pickPoint(targetToChi.menh, menhCoords);
    const taiPoint = pickPoint(targetToChi.tai, taiCoords);
    const quanPoint = pickPoint(targetToChi.quan, quanCoords);

    return [
      { id: 'menh-tai', from: menhPoint, to: taiPoint },
      { id: 'tai-quan', from: taiPoint, to: quanPoint },
      { id: 'quan-menh', from: quanPoint, to: menhPoint }
    ];
  }, [isVisible, palaceCoordinates, cungChinhMap]);

  const arrows = useMemo(() => {
    if (!chartData || !palaceCoordinates || !isVisible || !Array.isArray(chartData)) return [];

    let lyTamGroups = {};   
    let huongTamGroups = {}; 

    const hasStar = (cungData, starName) => {
      if (!cungData) return false;
      const target = normalizeKey(starName);
      if (!target) return false;

      const allStars = [
        ...(cungData.chinhTinh || []), 
        ...(cungData.phuTinh || [])
      ].map(s => typeof s === 'string' ? s : (s.name || s.label || s));

      return allStars.some((s) => normalizeKey(s).includes(target));
    };

    chartData.forEach(cung => {
      const chi = cung.chi; 
      const canKey = CAN_ALIAS[normalizeKey(cung.can)] || cung.can;
      if (!canKey || !TU_HOA_TABLE[canKey]) return;

      const tuHoaObj = TU_HOA_TABLE[canKey];
      const oppositeChi = OPPOSITE_HOUSES[chi];
      const oppositeCung = chartData.find(c => c.chi === oppositeChi);

      ['A', 'B', 'C', 'D'].forEach(type => {
        const star = tuHoaObj[type];
        if (hasStar(cung, star)) {
          if (!lyTamGroups[chi]) lyTamGroups[chi] = [];
          lyTamGroups[chi].push(type);
        }
        if (oppositeCung && hasStar(oppositeCung, star)) {
          const key = `${chi}->${oppositeChi}`;
          if (!huongTamGroups[key]) huongTamGroups[key] = { from: chi, to: oppositeChi, types: [] };
          huongTamGroups[key].types.push(type);
        }
      });
    });

    const linesToDraw = [];

    // --- LY TÂM (Tự Hóa Xuất) ---
    Object.keys(lyTamGroups).forEach(chi => {
      const types = lyTamGroups[chi].sort().join('');
      const coords = palaceCoordinates[chi];
      if (!coords) return;

      const { x, y, width: w, height: h } = coords;
      if (!w || !h) return;

      const cx = x + w / 2;
      const cy = y + h / 2;
      const dir = OUTWARD_DIRECTIONS[chi];

      // Ly tam: bat dau sat mep ngoai cua cung va huong ra ngoai la so.
      const startNearOuter = 0.03;
      const outsideExtend = 3.0;
      const outsideExtendX = outsideExtend * CHART_ASPECT_RATIO;

      let startX = cx, startY = cy, endX = cx, endY = cy;
      let textX = cx, textY = cy;

      if (dir === 'UP') {
        startX = cx;
        startY = y + h * startNearOuter;
        endX = startX;
        endY = -outsideExtend;
        textX = startX + 1.3;
        textY = (startY + endY) / 2;
      } else if (dir === 'DOWN') {
        startX = cx;
        startY = y + h * (1 - startNearOuter);
        endX = startX;
        endY = 100 + outsideExtend;
        textX = startX + 1.3;
        textY = (startY + endY) / 2;
      } else if (dir === 'LEFT') {
        startX = x + w * startNearOuter;
        startY = cy;
        endX = -outsideExtendX;
        endY = startY;
        textX = (startX + endX) / 2;
        textY = startY - 1.2;
      } else if (dir === 'RIGHT') {
        startX = x + w * (1 - startNearOuter);
        startY = cy;
        endX = 100 + outsideExtendX;
        endY = startY;
        textX = (startX + endX) / 2;
        textY = startY - 1.2;
      }

      linesToDraw.push({ id: `lytam-${chi}`, startX, startY, endX, endY, textX, textY, label: types, type: 'lytam' });
    });

    // --- HƯỚNG TÂM (Tự Hóa Nhập) ---
    Object.values(huongTamGroups).forEach(group => {
      const { from, to, types } = group;
      const label = types.sort().join('');
      const fromCoords = palaceCoordinates[from];
      const toCoords = palaceCoordinates[to];
      if (!fromCoords || !toCoords || !fromCoords.width || !toCoords.width) return;

      const pairKey = [from, to].sort().join('-');
      const useCorner = pairKey === 'Dần-Thân' || pairKey === 'Hợi-Tỵ';

      const fromInner = useCorner ? getInnerCornerPoint(fromCoords) : getInnerBorderMidPoint(fromCoords);
      const toInner = useCorner ? getInnerCornerPoint(toCoords) : getInnerBorderMidPoint(toCoords);

      const startX = fromInner.x;
      const startY = fromInner.y;
      const endX = toInner.x;
      const endY = toInner.y;

      const dx = endX - startX;
      const dy = endY - startY;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) return;
      const ux = dx / len;
      const uy = dy / len;

      // Put huong tam labels next to arrow head (x2,y2) for easier reading.
      const labelBackOffset = 1.8;
      const labelSideOffset = 1.0;
      const textX = endX - ux * labelBackOffset + (-uy) * labelSideOffset;
      const textY = endY - uy * labelBackOffset + ux * labelSideOffset;

      linesToDraw.push({ id: `huongtam-${from}-${to}`, startX, startY, endX, endY, textX, textY, label, type: 'huongtam' });
    });

    return linesToDraw; 
  }, [chartData, palaceCoordinates, isVisible]);

  if (triangleLines.length === 0 && arrows.length === 0) return null;

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10, overflow: 'visible' }}>
      <defs>
        <marker id="arrowhead" markerWidth="5.2" markerHeight="5.2" refX="4.2" refY="2.6" orient="auto">
          <polygon points="0 0, 4.8 2.6, 0 5.2" fill="#ef4444" />
        </marker>
      </defs>

      {arrows.map(arrow => (
        <g key={arrow.id}>
          <line x1={toPercent(arrow.startX)} y1={toPercent(arrow.startY)} x2={toPercent(arrow.endX)} y2={toPercent(arrow.endY)}
            stroke="#ef4444"
            strokeWidth="2.5" strokeDasharray="none"
            markerEnd="url(#arrowhead)"
          />
          <text x={toPercent(arrow.textX)} y={toPercent(arrow.textY)} fill="#ef4444"
            fontSize="20.5" fontWeight="bold" fontFamily="'Be Vietnam Pro', 'Noto Sans', Arial, sans-serif" alignmentBaseline="middle" textAnchor="middle"
          >
            {arrow.label}
          </text>
        </g>
      ))}

      {triangleLines.map((line) => (
        <line
          key={line.id}
          x1={toPercent(line.from.x)}
          y1={toPercent(line.from.y)}
          x2={toPercent(line.to.x)}
          y2={toPercent(line.to.y)}
          stroke="rgba(107, 114, 128, 0.45)"
          strokeWidth="1.2"
          strokeDasharray="none"
        />
      ))}
    </svg>
  );
};

export default KhamThienTuHoa;