const { Router } = require("express");
const asyncHandler = require("../../common/utils/async-handler");
const ensureDb = require("../../common/utils/ensure-db");
const { supabase } = require("../../config/supabase");

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { questionId } = req.query;
    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "questionId query is required",
      });
    }

    const { data, error } = await supabase
      .from("QuestionMessages")
      .select("*")
      .eq("QuestionID", questionId)
      .order("CreatedAt", { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const {
      QuestionID,
      SenderType,
      AdminID = null,
      ParticipantID = null,
      MessageText,
      IsInternalNote = false,
    } = req.body;

    if (!QuestionID || !SenderType || !MessageText) {
      return res.status(400).json({
        success: false,
        message: "QuestionID, SenderType, MessageText is required",
      });
    }

    const payload = {
      QuestionID,
      SenderType,
      AdminID,
      ParticipantID,
      MessageText,
      IsInternalNote,
      CreatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("QuestionMessages")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  }),
);

module.exports = router;
