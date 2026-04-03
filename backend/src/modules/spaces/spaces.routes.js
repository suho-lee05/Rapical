const { Router } = require("express");
const asyncHandler = require("../../common/utils/async-handler");
const ensureDb = require("../../common/utils/ensure-db");
const { supabase } = require("../../config/supabase");

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { status } = req.query;

    let query = supabase
      .from("Spaces")
      .select("*")
      .order("CreatedAt", { ascending: false });

    if (status) query = query.eq("Status", status);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  }),
);

router.get(
  "/join-code/:joinCode",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { joinCode } = req.params;
    const { data, error } = await supabase
      .from("Spaces")
      .select("*")
      .eq("JoinCode", joinCode)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  }),
);

router.get(
  "/:spaceId",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { spaceId } = req.params;
    const { data, error } = await supabase
      .from("Spaces")
      .select("*")
      .eq("SpaceID", spaceId)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { SpaceName, Description, HostName, JoinCode, QrToken, CreatedBy } =
      req.body;

    if (!SpaceName || !JoinCode || !QrToken || !CreatedBy) {
      return res.status(400).json({
        success: false,
        message: "SpaceName, JoinCode, QrToken, CreatedBy is required",
      });
    }

    const payload = {
      SpaceName,
      Description: Description || null,
      HostName: HostName || null,
      JoinCode,
      QrToken,
      CreatedBy,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("Spaces")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  }),
);

router.patch(
  "/:spaceId",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { spaceId } = req.params;
    const updates = { ...req.body, UpdatedAt: new Date().toISOString() };

    const { data, error } = await supabase
      .from("Spaces")
      .update(updates)
      .eq("SpaceID", spaceId)
      .select("*")
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  }),
);

module.exports = router;
