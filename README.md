# Giới thiệu
Đợt trc mình có test thử ít API của Facebook. Mình có viết phần mềm chat với khách hàng của Fanpage bằng tool chat của riêng mình để có thể quản lý KH của nhiều Fanpage về 1 mối.
Project cá nhân mà cũng ko có động lực phát triển tiếp nên share cho anh em, chủ yếu là mô hình và nguyên tắc hoạt động chứ chưa có chức năng chi tiết.

Project này gồm 3 phần là Backend (NodeJS), Socket server (NodeJS) và Frontend (NuxtJS - VueJS)

- Backend Nodejs gồm 2 phần là phần giao tiếp với Facebook rồi broadcast lên Redis. Server 2 lắng nghe tin nhắn mới trên Redist rồi emit tới client qua socketIO.

 - Frontend thì dùng bootstap và socketIO cũng mới dựng đc layout chưa có gì nhiều

# Source code:
https://github.com/thgiang/salehunter-node-backend

https://github.com/thgiang/salehunter-node-socket

https://github.com/thgiang/salehunter-frontend

# Mình mô tả qua nguyên tắc hoạt động như sau

Đăng ký một app với Facebook tại developer.facebook.com để có app_id và app_secret

Setup link webhook để khi có tin nhắn mới thì FB chủ động bắn JSON về server nodejs cho mình

Server NodeJS 1: Nhận webhook, broadcast tin nhắn lên Redis. Ở đây mình dựa vào ID của người nhắn tin để chia ra làm các channel nhỏ (ý đồ là sau này có thể treo nhiều server Socket chạy song song để phục vụ lượng lớn client connect vào)

Server NodeJS 2: Lắng nghe sự kiện channel trên Redis có tin nhắn mới để emit tới các client đang giữ kết nối qua SocketIO (tham khảo file redis-server.js)
