import React from 'react';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-col footer-brand-col">
          <div className="site-brand">
            <div className="site-brand-logo">
              <img src="/tuvitinhdieu.jpg?v=20260314-2" alt="Logo Tử VI Tinh Diệu" className="site-brand-logo-img" />
            </div>
            <div className="site-brand-copy">
              <div className="site-brand-toprow">
                <div className="site-brand-topline">Diễn đàn</div>
                <div className="site-brand-owner">Mr.Hiếu</div>
              </div>
              <div className="site-brand-title">Tử VI Tinh Diệu</div>
            </div>
          </div>
          <p className="footer-tagline">
            Cộng đồng giao lưu tử vi, phong thủy và luận giải lá số theo hướng dễ hiểu, chuẩn mực, hiện đại theo trường phái Tử VI Ứng Dụng
          </p>
        </div>

        <div className="footer-col footer-links-col">
          <h4 className="footer-heading">Liên kết nhanh</h4>
          <a href="#" className="footer-link">An Sao Lá Số</a>
          <a href="#" className="footer-link">Luận Giải Cơ Bản</a>
          <a href="#" className="footer-link">Kiến Thức Nhập Môn</a>
          <a href="#" className="footer-link">Hỏi Đáp Thành Viên</a>

          <div className="footer-topic-wrap">
            <h5 className="footer-subheading">Chủ đề nổi bật</h5>
            <div className="footer-topic-list">
              <span className="footer-topic-chip">Tử Vi Hàng Tháng</span>
              <span className="footer-topic-chip">Vận Hạn 12 Cung</span>
              <span className="footer-topic-chip">Phong Thủy Ứng Dụng</span>
              <span className="footer-topic-chip">Giải Mệnh Tài Lộc</span>
            </div>
          </div>
        </div>

        <div className="footer-col footer-contact-col">
          <h4 className="footer-heading">Liên hệ</h4>
          <div className="footer-contact-line">TikTok @Tuvitinhdieu</div>
          <div className="footer-contact-line">Facebook: @luan.tu.vi.2024</div>
          <div className="footer-contact-line">Email: Huyennammon369@gmail.com</div>
          <div className="footer-contact-line">Địa chỉ: Việt Nam</div>
          <div className="footer-contact-line">Chịu trách nhiệm nội dung: Mr.Hiếu</div>
        </div>

        <div className="footer-col footer-social-col">
          <h4 className="footer-heading">Kết nối</h4>
          <div className="footer-social-list">
            <a href="#" className="footer-social-btn" aria-label="Facebook">FB</a>
            <a href="#" className="footer-social-btn" aria-label="TikTok">TT</a>
            <a href="#" className="footer-social-btn" aria-label="Email">EM</a>
          </div>
          <p className="footer-note">Cập nhật bài viết mới mỗi tuần.</p>
        </div>
      </div>

      <div className="site-footer-bottom">
        <div className="site-footer-inner site-footer-bottom-inner">
          <span className="footer-copyright">©Tuvitinhdieu. All rights reserved.</span>
          <div className="footer-policy-links">
            <a href="#" className="footer-policy-link">Điều khoản</a>
            <a href="#" className="footer-policy-link">Bảo mật</a>
            <a href="#" className="footer-policy-link">Liên hệ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
