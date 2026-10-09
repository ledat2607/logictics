import { useState, useEffect } from "react";

interface FormPricingData {
  senderAddress: string;
  receiverAddress: string;
  weight: string | number;
  length: string | number;
  width: string | number;
  height: string | number;
  serviceType?: string;
}

// 1. Hàm Geocode tra cứu tọa độ từ địa chỉ (Nominatim OSM)
async function geocodeAddress(address: string) {
  if (!address || address.trim().length < 5) return null;

  // 1. Thử gọi Esri ArcGIS Geocoding (Rất ổn định, không rate-limit IP)
  try {
    const esriUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(
      address,
    )}&outFields=Addr_type,Match_addr,Territory,City,Subregion,Region&maxLocations=1`;

    const res = await fetch(esriUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.candidates && data.candidates.length > 0) {
        const item = data.candidates[0];
        const attr = item.attributes || {};
        const province = attr.Region || attr.Subregion || attr.City || "";
        return {
          lat: item.location.y,
          lon: item.location.x,
          province: province.replace(/(Tỉnh|Thành phố)\s+/g, "").trim(),
        };
      }
    }
  } catch (err) {
    console.warn("Esri Geocode fallback error:", err);
  }

  // 2. Dự phòng: Thử gọi Nominatim với User-Agent đầy đủ
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1`,
      {
        headers: {
          "User-Agent": "LogistixAI_App/1.0 (contact: admin@logistix.ai)",
          "Accept-Language": "vi-VN,vi;q=0.9",
        },
      },
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const addr = item.address || {};
        const province =
          addr.state || addr.city || addr.province || addr.region || "";
        return {
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          province: province.replace(/(Tỉnh|Thành phố)\s+/g, "").trim(),
        };
      }
    }
  } catch (err) {
    console.warn("Nominatim error:", err);
  }

  return null;
}

// 2. Hàm tính khoảng cách (km) theo Haversine Formula
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Thêm interface chi tiết phí
export interface FeeBreakdown {
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  weightFee: number;
  distanceFee: number;
  bulkySurcharge: number;
}

export function useOrderPricing(formData: FormPricingData) {
  const [distance, setDistance] = useState<number | null>(null);
  const [addressValid, setAddressValid] = useState({
    sender: false,
    receiver: false,
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedFee, setCalculatedFee] = useState<number>(22000);

  // State lưu chi tiết bảng phí
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsCalculating(true);

      const senderGeo = await geocodeAddress(formData.senderAddress);
      const receiverGeo = await geocodeAddress(formData.receiverAddress);

      setAddressValid({
        sender: !!senderGeo,
        receiver: !!receiverGeo,
      });

      let currentDist: number | null = null;
      if (senderGeo && receiverGeo) {
        currentDist = calculateDistanceKm(
          senderGeo.lat,
          senderGeo.lon,
          receiverGeo.lat,
          receiverGeo.lon,
        );
        setDistance(currentDist);
      } else {
        setDistance(null);
      }

      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/orders/calculate-fee`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weight_kg: Number(formData.weight) || 1,
            length_cm: Number(formData.length) || 10,
            width_cm: Number(formData.width) || 10,
            height_cm: Number(formData.height) || 10,
            from_province: senderGeo?.province || null,
            to_province: receiverGeo?.province || null,
            distance_km: currentDist || 0,
            service_type: formData.serviceType || "STANDARD",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log("📥 Raw Data từ API:", data);

          const totalShippingFee = Number(
            data.shipping_fee ?? data.total_fee ?? data.totalFee ?? 0,
          );

          if (totalShippingFee > 0) {
            setCalculatedFee(totalShippingFee);

            const actual = Number(
              data.actual_weight_kg ?? data.actualWeight ?? 1,
            );
            const volumetric = Number(
              data.volumetric_weight_kg ?? data.volumetricWeight ?? 0,
            );
            const chargeable = Number(
              data.chargeable_weight_kg ?? data.chargeableWeight ?? 1,
            );

            let weightFee = Number(data.weightFee ?? data.weight_fee ?? 0);
            let distanceFee = Number(
              data.distanceFee ?? data.distance_fee ?? 0,
            );
            let bulkySurcharge = Number(
              data.bulkySurcharge ?? data.bulky_surcharge ?? 0,
            );

            if (weightFee === 0 && distanceFee === 0) {
              const extraKg = Math.max(0, chargeable - 2);
              weightFee = 22000 + Math.ceil(extraKg) * 5000;

              if (volumetric > 50) {
                bulkySurcharge = weightFee * 0.15;
              }

              distanceFee = Math.max(
                0,
                totalShippingFee - weightFee - bulkySurcharge,
              );
            }

            // 4. Cập nhật state hiển thị UI
            setFeeBreakdown({
              actualWeight: actual,
              volumetricWeight: volumetric,
              chargeableWeight: chargeable,
              weightFee: weightFee,
              distanceFee: distanceFee,
              bulkySurcharge: bulkySurcharge,
            });
          }
        }
      } catch (err) {
        console.error("Lỗi API calculateFee:", err);
      } finally {
        setIsCalculating(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    formData.senderAddress,
    formData.receiverAddress,
    formData.weight,
    formData.length,
    formData.width,
    formData.height,
    formData.serviceType,
  ]);

  return {
    distance,
    addressValid,
    isCalculating,
    calculatedFee,
    feeBreakdown, // 👈 Trả về thêm feeBreakdown
  };
}
