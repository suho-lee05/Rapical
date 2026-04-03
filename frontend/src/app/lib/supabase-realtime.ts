import { createClient } from "@supabase/supabase-js";

type ChangeHandler = () => void;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isRealtimeEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase = isRealtimeEnabled ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!) : null;

function subscribeToTableChanges(params: {
  table: string;
  filter: string;
  onChange: ChangeHandler;
}) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`rt:${params.table}:${params.filter}:${Date.now()}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: params.table,
        filter: params.filter,
      },
      () => {
        params.onChange();
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToSpaceQuestions(spaceId: number, onChange: ChangeHandler) {
  return subscribeToTableChanges({
    table: "Questions",
    filter: `SpaceID=eq.${spaceId}`,
    onChange,
  });
}

export function subscribeToParticipantQuestions(
  participantId: number,
  onChange: ChangeHandler,
) {
  return subscribeToTableChanges({
    table: "Questions",
    filter: `ParticipantID=eq.${participantId}`,
    onChange,
  });
}

export function subscribeToQuestionMessages(questionId: number, onChange: ChangeHandler) {
  return subscribeToTableChanges({
    table: "QuestionMessages",
    filter: `QuestionID=eq.${questionId}`,
    onChange,
  });
}

export { isRealtimeEnabled };
