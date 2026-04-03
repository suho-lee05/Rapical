const { Router } = require("express");
const asyncHandler = require("../../common/utils/async-handler");
const ensureDb = require("../../common/utils/ensure-db");
const { supabase } = require("../../config/supabase");

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { spaceId, postType, isPublished } = req.query;
    let query = supabase
      .from("FeedPosts")
      .select("*")
      .order("PublishedAt", { ascending: false, nullsFirst: false })
      .order("CreatedAt", { ascending: false });

    if (spaceId) query = query.eq("SpaceID", spaceId);
    if (postType) query = query.eq("PostType", postType);
    if (isPublished !== undefined) query = query.eq("IsPublished", isPublished === "true");

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  }),
);

router.get(
  "/:feedPostId",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { feedPostId } = req.params;
    const { data, error } = await supabase
      .from("FeedPosts")
      .select("*")
      .eq("FeedPostID", feedPostId)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { SpaceID, AuthorAdminID, PostType, Title, BodyText, BodyJson } = req.body;
    if (!SpaceID || !AuthorAdminID || !PostType || !Title || !BodyText) {
      return res.status(400).json({
        success: false,
        message: "SpaceID, AuthorAdminID, PostType, Title, BodyText is required",
      });
    }

    const payload = {
      SpaceID,
      AuthorAdminID,
      PostType,
      Title,
      BodyText,
      BodyJson: BodyJson || null,
      PublishedAt: new Date().toISOString(),
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("FeedPosts")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  }),
);

router.patch(
  "/:feedPostId",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { feedPostId } = req.params;
    const updates = { ...req.body, UpdatedAt: new Date().toISOString() };

    const { data, error } = await supabase
      .from("FeedPosts")
      .update(updates)
      .eq("FeedPostID", feedPostId)
      .select("*")
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  }),
);

module.exports = router;
