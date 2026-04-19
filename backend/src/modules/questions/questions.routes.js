const { Router } = require("express");
const asyncHandler = require("../../common/utils/async-handler");
const ensureDb = require("../../common/utils/ensure-db");
const { supabase } = require("../../config/supabase");

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { spaceId, participantId, status } = req.query;
    let query = supabase
      .from("Questions")
      .select("*")
      .order("CreatedAt", { ascending: false });

    if (spaceId) query = query.eq("SpaceID", spaceId);
    if (participantId) query = query.eq("ParticipantID", participantId);
    if (status) query = query.eq("Status", status);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  }),
);

router.get(
  "/:questionId",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { questionId } = req.params;
    const { data, error } = await supabase
      .from("Questions")
      .select("*")
      .eq("QuestionID", questionId)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { SpaceID, ParticipantID, Title, BodyText, IsPrivate = true } = req.body;
    if (!SpaceID || !ParticipantID || !BodyText) {
      return res.status(400).json({
        success: false,
        message: "SpaceID, ParticipantID, BodyText is required",
      });
    }

    const { data: existingQuestion, error: existingQuestionError } = await supabase
      .from("Questions")
      .select("QuestionID")
      .eq("SpaceID", SpaceID)
      .eq("ParticipantID", ParticipantID)
      .limit(1)
      .maybeSingle();

    if (existingQuestionError) throw existingQuestionError;
    if (existingQuestion) {
      return res.status(409).json({
        success: false,
        message: "이 이벤트에서는 질문을 1회만 보낼 수 있습니다.",
      });
    }

    const payload = {
      SpaceID,
      ParticipantID,
      Title: Title?.trim() ? Title.trim() : null,
      BodyText,
      IsPrivate,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("Questions")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  }),
);

router.patch(
  "/:questionId",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { questionId } = req.params;
    const updates = { ...req.body, UpdatedAt: new Date().toISOString() };

    const { data, error } = await supabase
      .from("Questions")
      .update(updates)
      .eq("QuestionID", questionId)
      .select("*")
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  }),
);

module.exports = router;
