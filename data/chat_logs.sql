-- data/chat_logs.sql
CREATE TABLE IF NOT EXISTS chat_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
