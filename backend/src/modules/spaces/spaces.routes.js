const { Router } = require("express");
const asyncHandler = require("../../common/utils/async-handler");
const ensureDb = require("../../common/utils/ensure-db");
const { supabase } = require("../../config/supabase");

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { status, createdBy } = req.query;

    let query = supabase
      .from("Spaces")
      .select("*")
      .order("CreatedAt", { ascending: false });

    if (status) query = query.eq("Status", status);
    if (createdBy) query = query.eq("CreatedBy", createdBy);

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

    const {
      SpaceName,
      Description,
      HostName,
      JoinCode,
      QrToken,
      CreatedBy,
      Latitude,
      Longitude,
    } =
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
      Latitude:
        typeof Latitude === "number" && Number.isFinite(Latitude) ? Latitude : null,
      Longitude:
        typeof Longitude === "number" && Number.isFinite(Longitude) ? Longitude : null,
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

router.delete(
  "/:spaceId",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { spaceId } = req.params;

    const { data: questions, error: questionReadError } = await supabase
      .from("Questions")
      .select("QuestionID")
      .eq("SpaceID", spaceId);
    if (questionReadError) throw questionReadError;

    const questionIds = (questions || [])
      .map((item) => Number(item.QuestionID))
      .filter((value) => Number.isFinite(value));

    if (questionIds.length > 0) {
      const { error: deleteMessagesError } = await supabase
        .from("QuestionMessages")
        .delete()
        .in("QuestionID", questionIds);
      if (deleteMessagesError) throw deleteMessagesError;
    }

    const { error: deleteQuestionsError } = await supabase
      .from("Questions")
      .delete()
      .eq("SpaceID", spaceId);
    if (deleteQuestionsError) throw deleteQuestionsError;

    const { error: deletePostsError } = await supabase
      .from("FeedPosts")
      .delete()
      .eq("SpaceID", spaceId);
    if (deletePostsError) throw deletePostsError;

    const { error: deleteParticipantsError } = await supabase
      .from("Participants")
      .delete()
      .eq("SpaceID", spaceId);
    if (deleteParticipantsError) throw deleteParticipantsError;

    const { data: deletedSpace, error: deleteSpaceError } = await supabase
      .from("Spaces")
      .delete()
      .eq("SpaceID", spaceId)
      .select("*")
      .maybeSingle();
    if (deleteSpaceError) throw deleteSpaceError;
    if (!deletedSpace) {
      return res.status(404).json({
        success: false,
        message: "삭제할 이벤트를 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      data: deletedSpace,
      message: "이벤트가 삭제되었습니다.",
    });
  }),
);

module.exports = router;
