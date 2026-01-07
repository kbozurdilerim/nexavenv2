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
const bcrypt = require("bcrypt");
const path = require("path");

const db = new sqlite3.Database("./data/nexaven.db");

const username = "admin";
const password = "Admin@2026Zorlu";
const email = "admin@nexaven.com.tr";

bcrypt.hash(password, 10).then((hashedPwd) => {
  db.run(
    `INSERT OR REPLACE INTO users (id, username, password, email, role, user_type, created_at)
     VALUES ((SELECT id FROM users WHERE username = ?), ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM users WHERE username = ?), CURRENT_TIMESTAMP))`,
    [username, username, hashedPwd, email, "admin", "company", username],
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
}).catch((e) => { console.error(e); process.exit(1); });
EOFNODE

echo ""
echo "🎉 Admin paneli giriş bilgileri:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "URL:      https://nexaven.com.tr/zorlu.ecu/admin"
echo "Kullanıcı: admin"
echo "Şifre:    Admin@2026Zorlu"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
