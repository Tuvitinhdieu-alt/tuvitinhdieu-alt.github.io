import { useState } from 'react'
import BirthInfoForm from './BirthInfoForm'
import HoroscopeChart from './HoroscopeChart'
import Header from './Header'
import Footer from './Footer'
import { calculateHoroscope } from './horoscopeCalculator'
import HoroscopeInterpretation from './HoroscopeInterpretation';
import './App.css'

function App() {
  const [isTuHoaMode, setIsTuHoaMode] = useState(false)
  const [isAnSaoLuu, setIsAnSaoLuu] = useState(false)
  const [isNamPhaiOff, setIsNamPhaiOff] = useState(false)
  const [birthInfo, setBirthInfo] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [fullChartData, setFullChartData] = useState(null)

  const handleFormSubmit = (data) => {
    const mergedData = { ...data, anSaoLuu: isAnSaoLuu }
    setBirthInfo(mergedData)
    
    try {
      const horoscopeData = calculateHoroscope(mergedData);
      setChartData(horoscopeData)
      setFullChartData(null)
    } catch (error) {
      console.error("🚨 LỖI TẠI HÀM TÍNH TỬ VI:", error);
      alert("Hàm calculateHoroscope đang bị lỗi!");
    }
  }

  const handleChartCalculated = (data) => {
    setFullChartData(data)
  }

  return (
    // 1. NỀN XÁM TOÀN TRANG (Để làm nổi bật thẻ trắng)
    <div className="app-page" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '60px' }}>
      <Header />

      <main className="main-content" style={{ padding: '40px 16px' }}>
        
        {/* =========================================
            2. CARD TRẮNG SỐ 1 BỌC LẠI BẰNG CSS CỨNG
            ========================================= */}
        <div style={{
          maxWidth: '1152px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Đổ bóng
          padding: '32px',
          marginBottom: '40px',
          border: '1px solid #e5e7eb'
        }}>
          
          {/* 1.1 FORM NHẬP LIỆU */}
          <section style={{ marginBottom: '32px' }}>
            <BirthInfoForm
              onSubmit={handleFormSubmit}
              isTuHoaMode={isTuHoaMode}
              setIsTuHoaMode={setIsTuHoaMode}
              isAnSaoLuu={isAnSaoLuu}
              setIsAnSaoLuu={setIsAnSaoLuu}
              isNamPhaiOff={isNamPhaiOff}
              setIsNamPhaiOff={setIsNamPhaiOff}
            />
          </section>

          {/* Đường kẻ ngang */}
          {chartData && <hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />}

         {/* 1.2 BẢNG LÁ SỐ */}
          <section style={{ marginBottom: '32px', width: '100%' }}>
            {chartData ? (
              <div style={{ 
                width: '100%', 
                overflowX: 'auto', 
                WebkitOverflowScrolling: 'touch' // Giúp cuộn ngang mượt mà hơn trên iPhone/iPad
              }}>
                {/* TĂNG PADDING: 
                  - 60px cho trên/dưới (bảo vệ mũi tên đâm lên/xuống)
                  - 50px cho trái/phải (bảo vệ mũi tên đâm ngang)
                */}
                <div style={{ display: 'table', margin: '0 auto', padding: '60px 50px' }}>
                  <HoroscopeChart
                    chartData={chartData}
                    birthInfo={birthInfo}
                    isTuHoaMode={isTuHoaMode}
                    isAnSaoLuu={isAnSaoLuu}
                    isNamPhaiOff={isNamPhaiOff}
                    onCalculated={handleChartCalculated} 
                  />
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '2px dashed #d1d5db' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>Lá số sẽ hiển thị tại đây</h3>
                <p style={{ color: '#6b7280', marginTop: '8px' }}>Hãy điền thông tin ở trên và bấm Xem lá số.</p>
              </div>
            )}
          </section>

          {/* 1.3 THÔNG TIN THANH TOÁN */}
          {fullChartData && (
            <>
              <hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />
              <div style={{ color: '#f11414', fontSize: '25px', lineHeight: '1.8', fontWeight: '500' }}>
                <p style={{ marginBottom: '12px' }}>Quý Anh Chị đăng ký dịch vụ giải lá số online bằng hình thức ghi âm vui lòng điền thông tin lá số tử vi sau đó an sao</p>
                <p>Chuyển khoản trực tiếp tới STK: <strong>1053366875</strong></p>
                <p>Ngân hàng: <strong>VietComBank</strong></p>
                <p>Chủ Tài khoản: <strong>Lê Đức Hiếu</strong></p>
                <p>Phí xem: <strong>400.000 VNĐ</strong></p>
                <p style={{ marginTop: '12px' }}>Sau đó gửi thông tin gồm Họ Tên, Ngày, Tháng, Năm, Giờ Sinh, Giới Tính, Email và thông tin chuyển khoản thành công đến facebook: Nhật Quang hoặc Tiktok: @Tuvitinhdieu.com</p>
                <p>Hỗ trợ trả kết quả lá số online qua facebook: Nhật Quang hoặc Tiktok: @Tuvitinhdieu.com</p>
                <p>Kết quả luận giải online được trả trong vòng 48h tính từ lúc chuyển khoản thành công.</p>
                
                <div style={{ marginTop: '20px' }}>
          <span style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', color: '#c93838', fontSize: '20px' }}>
            QRCode:
          </span>
          
          {/* Khung bọc mã QR cho đẹp */}
          <div style={{ 
            padding: '12px', 
            border: '0px dashed #c92a2a', 
            borderRadius: '16px', 
            backgroundColor: '#fff', 
            display: 'inline-block' 
          }}>
            {/* THẺ IMG ĐỂ HIỂN THỊ ẢNH */}
            <img 
              src="/qrcode.jpg" /* Tên file ảnh bạn vừa bỏ vào thư mục public */
              alt="QR Code Thanh Toán" 
              style={{ 
                width: '300px',   /* Chỉnh độ rộng của mã QR ở đây */
                height: '350px',  /* Chỉnh chiều cao của mã QR ở đây */
                objectFit: 'contain',
                borderRadius: '18px'
              }}
            />
          </div>
        </div>
              </div>
            </>
          )}

        </div>

        {/* =========================================
            3. KHU VỰC LUẬN GIẢI (Nút bấm rớt xuống)
            ========================================= */}
        {fullChartData && (
          <div style={{ maxWidth: '1152px', margin: '0 auto', marginTop: '40px' }}>
            <HoroscopeInterpretation data={fullChartData} />
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}

export default App