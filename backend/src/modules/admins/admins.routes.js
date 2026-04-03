const { Router } = require("express");
const asyncHandler = require("../../common/utils/async-handler");
const ensureDb = require("../../common/utils/ensure-db");
const { supabase } = require("../../config/supabase");

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { data, error } = await supabase
      .from("Admins")
      .select("AdminID, Email, AdminName, Role, IsActive, CreatedAt, UpdatedAt")
      .order("AdminID", { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  }),
);

router.get(
  "/:adminId",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { adminId } = req.params;
    const { data, error } = await supabase
      .from("Admins")
      .select("AdminID, Email, AdminName, Role, IsActive, CreatedAt, UpdatedAt")
      .eq("AdminID", adminId)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email, password is required",
      });
    }

    const { data, error } = await supabase
      .from("Admins")
      .select("AdminID, Email, AdminName, Role, IsActive, Password")
      .eq("Email", email)
      .single();

    if (error) throw error;

    if (!data || !data.IsActive || data.Password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.json({
      success: true,
      data: {
        AdminID: data.AdminID,
        Email: data.Email,
        AdminName: data.AdminName,
        Role: data.Role,
        IsActive: data.IsActive,
      },
    });
  }),
);

module.exports = router;
