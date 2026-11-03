-- SOS India Admin - Authentication Schema

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL, -- 'admin', 'manager', 'employee'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  secret_code VARCHAR(255) NULL,
  role_id INT,
  status VARCHAR(50) DEFAULT 'active',
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Admin Log Table (for tracking activity like logins and password resets)
CREATE TABLE IF NOT EXISTS admin_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  actor_id INT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Password History Table (optional: for tracking resets over time)
CREATE TABLE IF NOT EXISTS password_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  old_password_hash VARCHAR(255),
  new_password_hash VARCHAR(255),
  reset_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- INSERT DEFAULT DATA

-- Insert basic roles if they do not exist
INSERT IGNORE INTO roles (id, name) VALUES 
(1, 'admin'),
(2, 'manager'),
(3, 'employee');

-- Insert the demo user matching the database export
INSERT IGNORE INTO users (id, email, password_hash, secret_code, role_id, status) VALUES
(1, 'rsmarineacademy@gmail.com', '$2y$10$9XjCvIJM5nJmZZpBwQSmr.D8vUxKqfGx0KfnHmJmJZ8RJ0Z2K2Hcq', '8356929017', 1, 'active');
