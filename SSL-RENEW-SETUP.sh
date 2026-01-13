#!/bin/bash
# SSL Sertifikası Otomatik Yenileme Kurulumu
# Let's Encrypt sertifikaları 90 gün geçerlidir
# Bu script her gün otomatik kontrol edip gerekirse yeniler

echo "🔐 SSL Otomatik Yenileme Yapılandırması"
echo "======================================="
echo ""

# 1. Manuel yenileme testi
echo "1️⃣ Manuel Yenileme Testi (Dry Run)"
echo "   Sertifikanızın yenilenebilir olup olmadığını kontrol eder..."
echo ""
echo "   Çalıştırılacak komut:"
echo "   docker compose run --rm certbot renew --dry-run"
echo ""
read -p "Bu testi şimdi çalıştırmak ister misiniz? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose run --rm certbot renew --dry-run
    echo ""
fi

# 2. Otomatik yenileme için cron job
echo ""
echo "2️⃣ Otomatik Yenileme Cron Job Kurulumu"
echo "   Her gün saat 02:00'de sertifika kontrol edilir ve yenilenir"
echo ""

# Cron job içeriği
CRON_JOB="0 2 * * * cd ~/nexavenv2 && docker compose run --rm certbot renew --quiet && docker compose exec nginx nginx -s reload"

echo "   Eklenecek cron job:"
echo "   $CRON_JOB"
echo ""
read -p "Cron job'u eklemek ister misiniz? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Mevcut crontab'ı al
    crontab -l > /tmp/current_cron 2>/dev/null || true
    
    # Aynı job zaten varsa ekleme
    if grep -q "certbot renew" /tmp/current_cron 2>/dev/null; then
        echo "   ⚠️  Certbot yenileme job'u zaten mevcut!"
    else
        echo "$CRON_JOB" >> /tmp/current_cron
        crontab /tmp/current_cron
        echo "   ✅ Cron job başarıyla eklendi!"
    fi
    
    rm /tmp/current_cron
    
    echo ""
    echo "   Mevcut cron job'lar:"
    crontab -l | grep certbot
fi

# 3. Sertifika bilgilerini göster
echo ""
echo "3️⃣ Mevcut Sertifika Bilgileri"
echo "   Sertifikanızın son kullanma tarihi:"
echo ""
docker compose exec nginx cat /etc/letsencrypt/live/nexaven.com.tr/cert.pem 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "   ⚠️  Sertifika bilgisi alınamadı"

echo ""
echo "======================================="
echo "🎉 Kurulum Tamamlandı!"
echo ""
echo "📋 Önemli Notlar:"
echo "   • Let's Encrypt sertifikaları 90 gün geçerlidir"
echo "   • Otomatik yenileme her gün saat 02:00'de çalışır"
echo "   • Sertifika süresi 30 günden azsa yenilenir"
echo "   • Yenileme sonrası Nginx otomatik reload olur"
echo ""
echo "🔍 Kontrol Komutları:"
echo "   Cron job'ları görüntüle:"
echo "   $ crontab -l"
echo ""
echo "   Sertifika son kullanma tarihini kontrol et:"
echo "   $ docker compose exec nginx openssl x509 -in /etc/letsencrypt/live/nexaven.com.tr/cert.pem -noout -dates"
echo ""
echo "   Manuel yenileme:"
echo "   $ docker compose run --rm certbot renew"
echo "   $ docker compose exec nginx nginx -s reload"
echo ""
