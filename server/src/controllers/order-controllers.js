// src/controllers/orderController.js
const db = require("../config/db");

// Hàm sinh mã Tracking chuẩn Logistics: LOG-YYYYMMDD-XXXXXX
const generateTrackingCode = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LOG-${dateStr}-${randomStr}`;
};

/**
 * 1. Tính cước phí vận chuyển
 */
exports.calculateFee = async (req, res) => {
  try {
    const {
      weight_kg = 1,
      length_cm = 10,
      width_cm = 10,
      height_cm = 10,
      from_province,
      to_province,
      distance_km = 0,
      service_type = "STANDARD",
    } = req.body;

    const w = Number(weight_kg) || 1;
    const l = Number(length_cm) || 10;
    const wd = Number(width_cm) || 10;
    const h = Number(height_cm) || 10;
    const dist = Number(distance_km) || 0;

    // 1. Quy đổi trọng lượng thể tích: (Dài x Rộng x Cao) / 5000
    const volumetricWeight = (l * wd * h) / 5000;

    // 2. Trọng lượng tính cước (Lấy giá trị lớn nhất)
    const chargeableWeight = Math.max(w, volumetricWeight);

    // 3. Truy vấn Rule từ Neon DB
    let basePrice = 22000;
    let extraPricePerKg = 5000;

    try {
      const ruleQuery = `
        SELECT base_price, extra_price_per_kg 
        FROM pricing_rules 
        WHERE is_active = true 
          AND $1 >= min_weight_kg AND $1 <= max_weight_kg
        ORDER BY base_price DESC
        LIMIT 1;
      `;
      const { rows } = await db.query(ruleQuery, [chargeableWeight]);
      if (rows && rows.length > 0) {
        basePrice = parseFloat(rows[0].base_price) || 22000;
        extraPricePerKg = parseFloat(rows[0].extra_price_per_kg) || 5000;
      }
    } catch (dbErr) {
      console.warn("Dùng rule tính cước mặc định:", dbErr.message);
    }

    // 4. Tính Cước Khối Lượng (2kg đầu = basePrice, từ kg thứ 3 tính extraPricePerKg)
    const extraWeight = Math.max(0, chargeableWeight - 2);
    const weightFee = basePrice + Math.ceil(extraWeight) * extraPricePerKg;

    // 5. Tính Phụ Thu Khoảng Cách (Đã sửa liên tục không bị lót sàn 0km)
    let distanceFee = 0;
    if (dist > 0 && dist <= 10) {
      distanceFee = dist * 1000; // Miễn phí/tính nhẹ 1k/km cho 10km đầu
    } else if (dist > 10 && dist <= 30) {
      distanceFee = 10 * 1000 + (dist - 10) * 3000;
    } else if (dist > 30 && dist <= 100) {
      distanceFee = 10 * 1000 + 20 * 3000 + (dist - 30) * 5000;
    } else if (dist > 100) {
      distanceFee = 10 * 1000 + 20 * 3000 + 70 * 5000 + (dist - 100) * 7000;
    }

    let bulkySurcharge = 0;
    if (volumetricWeight > 50) {
      bulkySurcharge = weightFee * 0.15;
    }
    let totalFee = weightFee + distanceFee + bulkySurcharge;

    if (service_type === "FAST") totalFee *= 1.3;
    if (service_type === "AI_EXPRESS") totalFee *= 1.8;

    const finalAmount = Math.round(totalFee);

    // 6. Trả về Response chứa CẢ 2 ĐỊNH DẠNG KEY để Frontend đọc kiểu gì cũng trúng!
    return res.json({
      success: true,
      shipping_fee: finalAmount,
      total_fee: finalAmount,
      totalFee: finalAmount,
      actual_weight_kg: w,
      volumetric_weight_kg: parseFloat(volumetricWeight.toFixed(2)),
      chargeable_weight_kg: parseFloat(chargeableWeight.toFixed(2)),

      // Định dạng camelCase
      weightFee: weightFee,
      distanceFee: distanceFee,
      bulkySurcharge: bulkySurcharge,

      // Định dạng snake_case
      weight_fee: weightFee,
      distance_fee: distanceFee,
      bulky_surcharge: bulkySurcharge,
    });
  } catch (error) {
    console.error("Lỗi calculateFee:", error);
    return res.status(500).json({ error: "Không thể tính cước phí" });
  }
};
/**
 * 2. Tạo đơn hàng mới
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      customer_id,
      sender_name,
      sender_phone,
      sender_address_full,
      sender_province,
      sender_district,
      receiver_name,
      receiver_phone,
      receiver_address_full,
      receiver_province,
      receiver_district,
      package_name,
      weight_kg,
      length_cm = 0,
      width_cm = 0,
      height_cm = 0,
      cod_amount = 0,
      insurance_fee = 0,
      payer = "sender",
      note,
      metadata = {},
    } = req.body;

    const tracking_code = generateTrackingCode();

    const volumetric_weight = (length_cm * width_cm * height_cm) / 5000;
    const chargeable_weight_kg = Math.max(
      parseFloat(weight_kg),
      volumetric_weight,
    );

    const basePrice = 22000;
    const extraWeight = Math.max(0, Math.ceil(chargeable_weight_kg - 2));
    const shipping_fee = basePrice + extraWeight * 5000;
    const total_amount = shipping_fee + parseFloat(insurance_fee);

    const insertOrderQuery = `
      INSERT INTO orders (
        tracking_code, customer_id,
        sender_name, sender_phone, sender_address_full, sender_province, sender_district,
        receiver_name, receiver_phone, receiver_address_full, receiver_province, receiver_district,
        package_name, weight_kg, length_cm, width_cm, height_cm, chargeable_weight_kg,
        shipping_fee, cod_amount, insurance_fee, total_amount, payer, status, note, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, 'created', $24, $25
      ) RETURNING *;
    `;

    const values = [
      tracking_code,
      customer_id || null,
      sender_name,
      sender_phone,
      sender_address_full,
      sender_province,
      sender_district,
      receiver_name,
      receiver_phone,
      receiver_address_full,
      receiver_province,
      receiver_district,
      package_name || "Bưu kiện",
      weight_kg,
      length_cm,
      width_cm,
      height_cm,
      chargeable_weight_kg,
      shipping_fee,
      cod_amount,
      insurance_fee,
      total_amount,
      payer,
      note || null,
      JSON.stringify(metadata),
    ];

    const orderResult = await db.query(insertOrderQuery, values);
    const newOrder = orderResult.rows[0];

    // Ghi vết khởi tạo vào order_logs
    await db.query(
      `INSERT INTO order_logs (order_id, status, location_name, description) 
       VALUES ($1, 'created', $2, 'Đơn hàng đã được tạo thành công trên hệ thống')`,
      [newOrder.id, `${sender_district}, ${sender_province}`],
    );

    res.status(201).json({
      message: "Tạo đơn hàng thành công",
      order: newOrder,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3. Tra cứu Tracking công khai
 */
exports.getTracking = async (req, res) => {
  try {
    const { code } = req.params;

    const orderQuery = `
      SELECT 
        tracking_code, status, package_name, weight_kg, chargeable_weight_kg,
        sender_province, sender_district, receiver_province, receiver_district,
        cod_amount, created_at
      FROM orders 
      WHERE tracking_code = $1
    `;
    const orderRes = await db.query(orderQuery, [code]);

    if (orderRes.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Mã đơn hàng không tồn tại trên hệ thống" });
    }

    const order = orderRes.rows[0];

    const logsQuery = `
      SELECT status, location_name, description, latitude, longitude, created_at 
      FROM order_logs 
      WHERE order_id = (SELECT id FROM orders WHERE tracking_code = $1)
      ORDER BY created_at DESC
    `;
    const logsRes = await db.query(logsQuery, [code]);

    res.json({
      order,
      timeline: logsRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4. Cập nhật trạng thái đơn hàng
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      location_name,
      description,
      latitude,
      longitude,
      created_by,
    } = req.body;

    const validStatuses = [
      "draft",
      "created",
      "picking_up",
      "picked_up",
      "in_transit",
      "delivered",
      "failed_delivery",
      "cancelled",
      "returned",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Trạng thái không hợp lệ" });
    }

    const updateQuery = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const updateRes = await db.query(updateQuery, [status, id]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    await db.query(
      `INSERT INTO order_logs (order_id, status, location_name, description, latitude, longitude, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        status,
        location_name || "Trung tâm khai thác",
        description || `Chuyển trạng thái sang: ${status}`,
        latitude || null,
        longitude || null,
        created_by || null,
      ],
    );

    res.json({
      message: "Cập nhật trạng thái thành công",
      order: updateRes.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
