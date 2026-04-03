const { Router } = require("express");

const adminsRouter = require("../modules/admins/admins.routes");
const spacesRouter = require("../modules/spaces/spaces.routes");
const participantsRouter = require("../modules/participants/participants.routes");
const questionsRouter = require("../modules/questions/questions.routes");
const questionMessagesRouter = require("../modules/question-messages/question-messages.routes");
const feedPostsRouter = require("../modules/feed-posts/feed-posts.routes");

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Rapical backend is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/admins", adminsRouter);
router.use("/spaces", spacesRouter);
router.use("/participants", participantsRouter);
router.use("/questions", questionsRouter);
router.use("/question-messages", questionMessagesRouter);
router.use("/feed-posts", feedPostsRouter);

module.exports = router;
