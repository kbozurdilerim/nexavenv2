#!/bin/bash

# Admin Kullanıcı Oluşturma Script
# Zorlu ECU Admin Paneli için

set -e

CONTAINER_ID=$(docker ps --filter "name=nexaven-backend" -q)

if [ -z "$CONTAINER_ID" ]; then
  echo "❌ Backend konteyner çalışmıyor!"
  exit 1
fi

echo "📝 Admin kullanıcı oluşturuluyor..."

# Node script ile admin oluştur
docker exec -i "$CONTAINER_ID" node << 'EOFNODE'
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const path = require("path");

const db = new sqlite3.Database("./data/nexaven.db");

const username = "admin";
const password = "Admin@2026Zorlu";
const email = "admin@nexaven.com.tr";

// SHA256 hash
const hashedPwd = crypto.createHash("sha256").update(password).digest("hex");

db.run(
  `INSERT OR REPLACE INTO users (username, password, email, role, user_type, created_at)
   VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
  [username, hashedPwd, email, "admin", "company"],
  (err) => {
    if (err) {
      console.error("❌ Admin oluşturma hatası:", err.message);
      process.exit(1);
    } else {
      console.log("✅ Admin kullanıcı başarıyla oluşturuldu!");
      console.log("📌 Kullanıcı: admin");
      console.log("📌 Şifre: Admin@2026Zorlu");
      console.log("📌 Email: admin@nexaven.com.tr");
    }
    db.close();
  }
);
EOFNODE

echo ""
echo "🎉 Admin paneli giriş bilgileri:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "URL:      https://nexaven.com.tr/zorlu.ecu/admin"
echo "Kullanıcı: admin"
echo "Şifre:    Admin@2026Zorlu"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
