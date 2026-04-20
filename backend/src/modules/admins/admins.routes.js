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
  "/register",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const { email, password, adminName, role = "admin" } = req.body;
    if (!email || !password || !adminName) {
      return res.status(400).json({
        success: false,
        message: "email, password, adminName is required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { data: existing, error: existingError } = await supabase
      .from("Admins")
      .select("AdminID")
      .eq("Email", normalizedEmail)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const payload = {
      Email: normalizedEmail,
      Password: password,
      AdminName: adminName,
      Role: role,
      IsActive: true,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("Admins")
      .insert(payload)
      .select("AdminID, Email, AdminName, Role, IsActive, CreatedAt, UpdatedAt")
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
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

    const normalizedEmail = String(email).trim().toLowerCase();
    const { data, error } = await supabase
      .from("Admins")
      .select("AdminID, Email, AdminName, Role, IsActive, Password")
      .eq("Email", normalizedEmail)
      .maybeSingle();

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

router.post(
  "/demo-reset",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const now = new Date().toISOString();

    const { data: adminRows, error: adminError } = await supabase
      .from("Admins")
      .select("AdminID")
      .order("AdminID", { ascending: true })
      .limit(1);
    if (adminError) throw adminError;
    if (!adminRows?.length) {
      return res.status(400).json({
        success: false,
        message: "관리자 계정이 없어 시연 데이터 초기화를 진행할 수 없습니다.",
      });
    }
    const adminId = adminRows[0].AdminID;

    const upsertSpace = async (payload) => {
      const { data, error } = await supabase
        .from("Spaces")
        .upsert(payload, { onConflict: "JoinCode" })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    };

    const airforceSpace = await upsertSpace({
      SpaceName: "공군창업경진대회",
      Description: "3월 3일 ~ 4월 22일",
      HostName: "서울특별시 중구",
      Status: "active",
      JoinCode: "ROKAF26",
      QrToken: "qr-rokaf26-demo",
      CreatedBy: adminId,
      UpdatedAt: now,
    });

    const copsSpace = await upsertSpace({
      SpaceName: "경찰과 도둑",
      Description: "5월 5일",
      HostName: "서울특별시 강남구",
      Status: "draft",
      JoinCode: "COPS0505",
      QrToken: "qr-cops0505-demo",
      CreatedBy: adminId,
      UpdatedAt: now,
    });

    const keepSpaceIds = [airforceSpace.SpaceID, copsSpace.SpaceID];

    const { error: deleteMessagesError } = await supabase
      .from("QuestionMessages")
      .delete()
      .neq("QuestionMessageID", 0);
    if (deleteMessagesError) throw deleteMessagesError;

    const { error: deleteQuestionsError } = await supabase
      .from("Questions")
      .delete()
      .neq("QuestionID", 0);
    if (deleteQuestionsError) throw deleteQuestionsError;

    const { error: deleteParticipantsError } = await supabase
      .from("Participants")
      .delete()
      .neq("ParticipantID", 0);
    if (deleteParticipantsError) throw deleteParticipantsError;

    const { error: deletePostsError } = await supabase
      .from("FeedPosts")
      .delete()
      .neq("FeedPostID", 0);
    if (deletePostsError) throw deletePostsError;

    const { data: allSpaces, error: spacesReadError } = await supabase
      .from("Spaces")
      .select("SpaceID");
    if (spacesReadError) throw spacesReadError;

    const deleteSpaceIds = (allSpaces || [])
      .map((row) => row.SpaceID)
      .filter((id) => !keepSpaceIds.includes(id));

    if (deleteSpaceIds.length > 0) {
      const { error: deleteSpacesError } = await supabase
        .from("Spaces")
        .delete()
        .in("SpaceID", deleteSpaceIds);
      if (deleteSpacesError) throw deleteSpacesError;
    }

    const noticePayloads = [
      {
        SpaceID: airforceSpace.SpaceID,
        AuthorAdminID: adminId,
        PostType: "notice",
        Title: "공군창업경진대회 4.22.(수) 낮 12시까지!!",
        BodyText:
          "안녕하세요, 공군창업경진대회 운영팀입니다.\n\n참가자 여러분은 4월 22일(수) 낮 12시까지 최종 제출을 완료해 주세요.\n접수 마감 직전 트래픽이 증가할 수 있으니 미리 제출하시길 권장드립니다.\n문의는 Ask 메뉴를 통해 남겨주시면 빠르게 안내드리겠습니다.\n\n끝까지 멋진 도전 응원합니다!",
        BodyJson: null,
        IsPinned: true,
        IsPublished: true,
        PublishedAt: now,
        CreatedAt: now,
        UpdatedAt: now,
      },
      {
        SpaceID: copsSpace.SpaceID,
        AuthorAdminID: adminId,
        PostType: "notice",
        Title: "어린이날 기념 경찰과 도둑 이벤트 진행 안내",
        BodyText:
          "어린이날 특별 프로그램으로 경찰과 도둑 콘셉트 이벤트를 진행합니다.\n\n- 일시: 5월 5일\n- 장소: 서울특별시 강남구\n- 구성: 팀 대항 미션, 힌트 추리, 최종 탈출 챌린지\n\n가족과 함께 즐길 수 있도록 안전하고 재미있게 준비했습니다. 많은 참여 바랍니다!",
        BodyJson: null,
        IsPinned: true,
        IsPublished: true,
        PublishedAt: now,
        CreatedAt: now,
        UpdatedAt: now,
      },
    ];

    const { error: insertNoticeError } = await supabase
      .from("FeedPosts")
      .insert(noticePayloads);
    if (insertNoticeError) throw insertNoticeError;

    res.json({
      success: true,
      data: {
        airforceSpaceId: airforceSpace.SpaceID,
        copsSpaceId: copsSpace.SpaceID,
      },
      message: "시연 데이터가 초기화되었습니다.",
    });
  }),
);

router.post(
  "/demo-restore-posts",
  asyncHandler(async (req, res) => {
    if (!ensureDb(res)) return;

    const now = new Date().toISOString();

    const { data: adminRows, error: adminError } = await supabase
      .from("Admins")
      .select("AdminID")
      .order("AdminID", { ascending: true })
      .limit(1);
    if (adminError) throw adminError;
    if (!adminRows?.length) {
      return res.status(400).json({
        success: false,
        message: "관리자 계정이 없어 시연 포스트 복구를 진행할 수 없습니다.",
      });
    }
    const adminId = adminRows[0].AdminID;

    const upsertSpace = async (payload) => {
      const { data, error } = await supabase
        .from("Spaces")
        .upsert(payload, { onConflict: "JoinCode" })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    };

    const airforceSpace = await upsertSpace({
      SpaceName: "공군창업경진대회",
      Description: "3월 3일 ~ 4월 22일",
      HostName: "서울특별시 중구",
      Status: "active",
      JoinCode: "ROKAF26",
      QrToken: "qr-rokaf26-demo",
      CreatedBy: adminId,
      UpdatedAt: now,
    });

    const copsSpace = await upsertSpace({
      SpaceName: "경찰과 도둑",
      Description: "5월 5일",
      HostName: "서울특별시 강남구",
      Status: "draft",
      JoinCode: "COPS0505",
      QrToken: "qr-cops0505-demo",
      CreatedBy: adminId,
      UpdatedAt: now,
    });

    const { error: deletePostsError } = await supabase
      .from("FeedPosts")
      .delete()
      .neq("FeedPostID", 0);
    if (deletePostsError) throw deletePostsError;

    const noticePayloads = [
      {
        SpaceID: airforceSpace.SpaceID,
        AuthorAdminID: adminId,
        PostType: "notice",
        Title: "공군창업경진대회 4.22.(수) 낮 12시까지!!",
        BodyText:
          "안녕하세요, 공군창업경진대회 운영팀입니다.\n\n참가자 여러분은 4월 22일(수) 낮 12시까지 최종 제출을 완료해 주세요.\n접수 마감 직전 트래픽이 증가할 수 있으니 미리 제출하시길 권장드립니다.\n문의는 Ask 메뉴를 통해 남겨주시면 빠르게 안내드리겠습니다.\n\n끝까지 멋진 도전 응원합니다!",
        BodyJson: null,
        IsPinned: true,
        IsPublished: true,
        PublishedAt: now,
        CreatedAt: now,
        UpdatedAt: now,
      },
      {
        SpaceID: copsSpace.SpaceID,
        AuthorAdminID: adminId,
        PostType: "notice",
        Title: "어린이날 기념 경찰과 도둑 이벤트 진행 안내",
        BodyText:
          "어린이날 특별 프로그램으로 경찰과 도둑 콘셉트 이벤트를 진행합니다.\n\n- 일시: 5월 5일\n- 장소: 서울특별시 강남구\n- 구성: 팀 대항 미션, 힌트 추리, 최종 탈출 챌린지\n\n가족과 함께 즐길 수 있도록 안전하고 재미있게 준비했습니다. 많은 참여 바랍니다!",
        BodyJson: null,
        IsPinned: true,
        IsPublished: true,
        PublishedAt: now,
        CreatedAt: now,
        UpdatedAt: now,
      },
    ];

    const { error: insertNoticeError } = await supabase
      .from("FeedPosts")
      .insert(noticePayloads);
    if (insertNoticeError) throw insertNoticeError;

    const demoQnaSeed = [
      {
        nickname: "데모참가자1",
        title: "제출 마감 시간",
        body:
          "최종 제출은 4월 22일 낮 12시 정각 기준인가요? 제출 버튼 기준으로 인정되는지 궁금합니다.",
        answer:
          "네, 4월 22일(수) 12:00까지 제출 완료된 건만 인정됩니다. 업로드 지연을 고려해 최소 10분 전 제출을 권장드립니다.",
      },
      {
        nickname: "데모참가자2",
        title: "팀원 변경 가능 여부",
        body:
          "접수 후 팀원 1명 교체가 필요한데, 마감 전까지 변경 신청이 가능한가요?",
        answer:
          "마감 전에는 팀원 변경 신청이 가능합니다. 운영진에게 변경 사유와 신규 팀원 정보를 함께 전달해 주세요.",
      },
      {
        nickname: "데모참가자3",
        title: "발표 심사 일정",
        body:
          "본선 발표 심사 시간과 입실 마감 시간이 어떻게 되는지 사전 안내 받을 수 있을까요?",
        answer:
          "발표 심사 상세 일정은 공지로 순차 안내됩니다. 당일 입실은 세션 시작 20분 전까지 완료해 주세요.",
      },
    ];

    for (const seed of demoQnaSeed) {
      const { data: participantRows, error: participantReadError } = await supabase
        .from("Participants")
        .select("*")
        .eq("SpaceID", airforceSpace.SpaceID)
        .eq("Nickname", seed.nickname)
        .limit(1);
      if (participantReadError) throw participantReadError;

      let participant = participantRows?.[0] || null;
      if (!participant) {
        const { data: createdParticipant, error: createParticipantError } = await supabase
          .from("Participants")
          .insert({
            SpaceID: airforceSpace.SpaceID,
            Nickname: seed.nickname,
            EntryCodeInput: "ROKAF26",
            JoinedVia: "code",
            Status: "active",
            CreatedAt: now,
            UpdatedAt: now,
          })
          .select("*")
          .single();
        if (createParticipantError) throw createParticipantError;
        participant = createdParticipant;
      }

      const { data: questionRows, error: questionReadError } = await supabase
        .from("Questions")
        .select("*")
        .eq("SpaceID", airforceSpace.SpaceID)
        .eq("ParticipantID", participant.ParticipantID)
        .eq("Title", seed.title)
        .limit(1);
      if (questionReadError) throw questionReadError;

      let question = questionRows?.[0] || null;
      if (!question) {
        const { data: createdQuestion, error: createQuestionError } = await supabase
          .from("Questions")
          .insert({
            SpaceID: airforceSpace.SpaceID,
            ParticipantID: participant.ParticipantID,
            Title: seed.title,
            BodyText: seed.body,
            Status: "answered",
            IsPrivate: true,
            AssignedAdminID: adminId,
            CreatedAt: now,
            UpdatedAt: now,
          })
          .select("*")
          .single();
        if (createQuestionError) throw createQuestionError;
        question = createdQuestion;
      }

      const { data: messageRows, error: messageReadError } = await supabase
        .from("QuestionMessages")
        .select("*")
        .eq("QuestionID", question.QuestionID)
        .eq("SenderType", "admin")
        .eq("MessageText", seed.answer)
        .limit(1);
      if (messageReadError) throw messageReadError;

      if (!messageRows?.length) {
        const { error: createMessageError } = await supabase
          .from("QuestionMessages")
          .insert({
            QuestionID: question.QuestionID,
            SenderType: "admin",
            AdminID: adminId,
            ParticipantID: participant.ParticipantID,
            MessageText: seed.answer,
            IsInternalNote: false,
            CreatedAt: now,
          });
        if (createMessageError) throw createMessageError;
      }
    }

    res.json({
      success: true,
      data: {
        airforceSpaceId: airforceSpace.SpaceID,
        copsSpaceId: copsSpace.SpaceID,
        seededQnaCount: demoQnaSeed.length,
      },
      message: "포스트/핀 상태 및 시연 Q&A가 기본 포맷으로 복구되었습니다.",
    });
  }),
);

module.exports = router;
