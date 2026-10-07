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
      weight_kg,
      length_cm = 0,
      width_cm = 0,
      height_cm = 0,
      from_province,
      to_province,
    } = req.body;

    if (!weight_kg || weight_kg <= 0) {
      return res.status(400).json({ error: "Khối lượng thực phải lớn hơn 0" });
    }

    const volumetric_weight = (length_cm * width_cm * height_cm) / 5000;
    const chargeable_weight_kg = Math.max(
      parseFloat(weight_kg),
      volumetric_weight,
    );

    const ruleQuery = `
      SELECT * FROM pricing_rules 
      WHERE is_active = true 
        AND $1 >= min_weight_kg AND $1 <= max_weight_kg
        AND (from_province IS NULL OR from_province = $2)
        AND (to_province IS NULL OR to_province = $3)
      ORDER BY base_price ASC LIMIT 1
    `;
    const ruleResult = await db.query(ruleQuery, [
      chargeable_weight_kg,
      from_province || null,
      to_province || null,
    ]);

    let shipping_fee = 0;

    if (ruleResult.rows.length > 0) {
      const rule = ruleResult.rows[0];
      const extraWeight = Math.max(
        0,
        Math.ceil(chargeable_weight_kg - rule.min_weight_kg),
      );
      shipping_fee =
        parseFloat(rule.base_price) +
        extraWeight * parseFloat(rule.extra_price_per_kg);
    } else {
      // Fallback mặc định
      const basePrice = 22000;
      const extraWeight = Math.max(0, Math.ceil(chargeable_weight_kg - 2));
      shipping_fee = basePrice + extraWeight * 5000;
    }

    res.json({
      actual_weight_kg: parseFloat(weight_kg),
      volumetric_weight_kg: parseFloat(volumetric_weight.toFixed(2)),
      chargeable_weight_kg: parseFloat(chargeable_weight_kg.toFixed(2)),
      shipping_fee,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
