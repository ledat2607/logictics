import * as z from "zod";

export const addressSchema = z.object({
  contact_name: z.string().min(2, "Họ tên người nhận phải có ít nhất 2 ký tự"),
  contact_phone: z
    .string()
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
  street_address: z.string().min(5, "Vui lòng nhập số nhà, tên đường chi tiết"),
  ward: z.string().optional(),
  district: z.string().min(2, "Vui lòng nhập quận/huyện"),
  province: z.string().min(2, "Vui lòng nhập tỉnh/thành phố"),
  is_default: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
