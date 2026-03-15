import React, { useState } from 'react';
import interpretationData from './tuviInterpretation.json';
import './HoroscopeInterpretation.css';

const HoroscopeInterpretation = ({ data }) => {
  const [openSections, setOpenSections] = useState({});

  const layViTriCung = (tenCung) => {
    if (!tenCung) return 99;
    const ten = tenCung.toLowerCase();
    const mapping = { 'mệnh': 1, 'phụ mẫu': 2, 'phúc đức': 3, 'điền trạch': 4, 'quan lộc': 5, 'nô bộc': 6, 'giao hữu': 6, 'thiên di': 7, 'tật ách': 8, 'tài bạch': 9, 'tử tức': 10, 'phu thê': 11, 'huynh đệ': 12 };
    for (let key in mapping) { if (ten.includes(key)) return mapping[key]; }
    return 99; 
  };

  if (!data || !data.giaoDienCung) return null;
  const { thongTinLaSo, giaoDienCung } = data;
  const toggleSection = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  const sortedCung = [...giaoDienCung].sort((a, b) => layViTriCung(a.palaceTitle) - layViTriCung(b.palaceTitle));

  return (
    <div className="w-full mx-auto my-12 font-sans px-4">
      
      {/* ====================================================
          1. NÚT TIÊU ĐỀ ĐỨNG ĐỘC LẬP (Không bọc chung với nội dung)
          ==================================================== */}
      <div className="flex justify-center mb-10">
        <button
          onClick={() => toggleSection('main')}
          className="luxury-section-title-btn w-full max-w-[900px] rounded-2xl shadow-xl border border-purple-300 py-6"
        >
          {/* Đã giảm size xuống 36 để thân thiện với mobile, bạn có thể tăng lại 54 nếu thích */}
          <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
            Luận Giải Lá Số Chi Tiết
          </span>
        </button>
      </div>

      {/* ====================================================
          2. THẺ TRẮNG CHỨA NỘI DUNG (Nằm riêng biệt hoàn toàn)
          ==================================================== */}
      {openSections['main'] && (
        <div className="interpretation-card bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 md:p-10 animate-fadeIn">
          <div className="space-y-10">
            
            {/* 1. Tổng quan Bản Mệnh */}
            <div className="luxury-section border border-gray-200 rounded-2xl overflow-hidden">
              <button onClick={() => toggleSection('ban_menh')} className="luxury-section-title-btn w-full text-left p-6 bg-gray-50 hover:bg-gray-100 border-b border-gray-200">
                <span style={{ fontSize: 24, fontWeight: 'bold' }}>1. Tổng quan Bản Mệnh</span>
              </button>
              {openSections['ban_menh'] && (
                <div className="luxury-banm-enh-content p-8">
                  <p style={{ fontWeight: 900, fontSize: 32, marginBottom: 24 }}>{thongTinLaSo.menh}</p>
                  <p style={{ fontStyle: 'italic', borderLeft: '8px solid #a21caf', paddingLeft: 24, fontSize: 24, lineHeight: 1.6, background: 'rgba(236, 224, 255, 0.25)', borderRadius: 16, padding: '20px 20px 20px 32px' }}>
                    {interpretationData.banMenh[thongTinLaSo.menh] || "Dữ liệu đang cập nhật..."}
                  </p>
                </div>
              )}
            </div>

            {/* 2-13. Luận giải 12 Cung */}
            {sortedCung.map((cung, index) => {
              const mainStarsRaw = cung.mainStars?.map(s => s.text) || [];
              const subStarsRaw = [
                ...(cung.leftSubStars?.map(s => s.text) || []),
                ...(cung.rightSubStars?.map(s => s.text) || [])
              ];
              const cleanMainStars = mainStarsRaw.map(s => s.replace(/\(.*\)/, "").trim());
              const allStarsInPalaceClean = [...mainStarsRaw, ...subStarsRaw].map(s => s.replace(/\(.*\)/, "").trim().toLowerCase());
              const combinedKey = cleanMainStars.join(", ");
              const combinedInterpretation = interpretationData.cung[cung.palaceTitle]?.[combinedKey];
              const specialPatterns = interpretationData.toHopSao?.filter(pattern =>
                pattern.dieuKien.every(condStar => allStarsInPalaceClean.includes(condStar.toLowerCase()))
              ) || [];

              return (
                <div key={index} className="luxury-section border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <button onClick={() => toggleSection(`cung_${index}`)} className="luxury-section-title-btn w-full text-left p-6 bg-gray-50 hover:bg-gray-100 border-b border-gray-200">
                    <span style={{ fontSize: 24, fontWeight: 'bold' }}>{index + 2}. Luận giải Cung {cung.palaceTitle}</span>
                  </button>
                  
                  {openSections[`cung_${index}`] && (
                    <div className="p-8 md:p-12 space-y-12 animate-fadeIn bg-white">
                      
                      {/* LUẬN CHUNG CẶP CHÍNH TINH */}
                      {combinedInterpretation && (
                        <div className="luxury-interpretation-block">
                          <h3 style={{ fontWeight: 900, fontSize: 26, marginBottom: 20, textTransform: 'uppercase', borderBottom: '2px solid #ede9fe', paddingBottom: 8, color: '#4c1d95' }}>
                            Luận chung: {combinedKey}
                          </h3>
                          <p style={{ fontSize: 22, lineHeight: 1.6, fontWeight: 500, color: '#333' }}>{combinedInterpretation}</p>
                        </div>
                      )}

                      {/* CHI TIẾT SAO LẺ */}
                      <div className="space-y-8">
                        <h3 style={{ fontWeight: 700, fontSize: 26, borderBottom: '4px solid #ede9fe', paddingBottom: 16, color: '#1f2937' }}>Chi tiết các sao tọa thủ</h3>
                        {[...mainStarsRaw, ...subStarsRaw].map((starRaw, idx) => {
                          const starClean = starRaw.replace(/\(.*\)/, "").trim();
                          const interpret = interpretationData.cung[cung.palaceTitle]?.[starClean] || interpretationData.sao[starClean];
                          return interpret ? (
                            <div key={idx} className="luxury-interpretation-block p-6 rounded-xl" style={{ background: '#f8fafc', border: '1.5px solid #e0e7ff' }}>
                              <strong style={{ color: '#a21caf', fontSize: 26, display: 'block', marginBottom: 12, borderBottom: '2px solid #ede9fe', paddingBottom: 8 }}>Sao {starRaw}</strong>
                              <p style={{ color: '#312e81', fontSize: 22, lineHeight: 1.6, textAlign: 'justify' }}>{interpret}</p>
                            </div>
                          ) : null;
                        })}
                      </div>

                      {/* CÁCH CỤC ĐẶC BIỆT */}
                      {specialPatterns.length > 0 && (
                        <div className="luxury-special-pattern mt-12 p-8 rounded-2xl bg-[#fffbe8] border-2 border-[#fde68a] shadow-md">
                          <h3 style={{ color: '#a16207', fontWeight: 900, fontSize: 28, marginBottom: 24, textTransform: 'uppercase', textAlign: 'center', borderBottom: '3px solid #fde68a', paddingBottom: 16 }}>
                            ★ CÁCH CỤC ĐẶC BIỆT ★
                          </h3>
                          <div className="space-y-6">
                            {specialPatterns.map((pattern, pIdx) => (
                              <div key={pIdx} className="luxury-interpretation-block p-6 rounded-xl bg-white border border-[#fde68a]">
                                <strong style={{ color: '#a16207', fontSize: 24, display: 'block', marginBottom: 12, textTransform: 'uppercase' }}>{pattern.tenCachCuc}</strong>
                                <p style={{ color: '#a16207', fontStyle: 'italic', fontSize: 22, lineHeight: 1.6 }}>{pattern.luanGiai}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <style>{`.animate-fadeIn { animation: fadeIn 0.4s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default HoroscopeInterpretation;