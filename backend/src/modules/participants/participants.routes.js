const { Router } = require("express");
const asyncHandler = require("../../common/utils/async-handler");
const ensureDb = require("../../common/utils/ensure-db");
const { supabase } = require("../../config/supabase");

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { spaceId, status } = req.query;
    let query = supabase
      .from("Participants")
      .select("*")
      .order("ParticipantID", { ascending: false });

    if (spaceId) query = query.eq("SpaceID", spaceId);
    if (status) query = query.eq("Status", status);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  }),
);

router.get(
  "/:participantId",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { participantId } = req.params;
    const { data, error } = await supabase
      .from("Participants")
      .select("*")
      .eq("ParticipantID", participantId)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  }),
);

router.post(
  "/join",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { joinCode, nickname, joinedVia = "code", entryCodeInput } = req.body;
    if (!joinCode || !nickname) {
      return res.status(400).json({
        success: false,
        message: "joinCode and nickname is required",
      });
    }

    const { data: space, error: spaceError } = await supabase
      .from("Spaces")
      .select("SpaceID, JoinCode, Status")
      .eq("JoinCode", joinCode)
      .single();

    if (spaceError) throw spaceError;
    if (space.Status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Space is not active",
      });
    }

    const payload = {
      SpaceID: space.SpaceID,
      Nickname: nickname,
      EntryCodeInput: entryCodeInput || null,
      JoinedVia: joinedVia,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("Participants")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  }),
);

router.patch(
  "/:participantId",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { participantId } = req.params;
    const updates = { ...req.body, UpdatedAt: new Date().toISOString() };

    const { data, error } = await supabase
      .from("Participants")
      .update(updates)
      .eq("ParticipantID", participantId)
      .select("*")
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  }),
);

module.exports = router;
