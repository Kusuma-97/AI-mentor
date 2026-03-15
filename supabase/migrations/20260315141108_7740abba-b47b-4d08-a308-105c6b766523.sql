
DROP FUNCTION IF EXISTS public.get_leaderboard();

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  interest text,
  level text,
  total_quizzes bigint,
  total_score bigint,
  total_possible bigint,
  avg_score numeric,
  best_score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    COALESCE(p.display_name, 'Anonymous') as display_name,
    p.avatar_url,
    COALESCE(up.interest, 'General') as interest,
    COALESCE(up.level, 'Unknown') as level,
    COUNT(q.id) as total_quizzes,
    COALESCE(SUM(q.score), 0) as total_score,
    COALESCE(SUM(q.total), 0) as total_possible,
    ROUND(COALESCE(AVG(q.score::numeric / NULLIF(q.total, 0) * 100), 0), 1) as avg_score,
    ROUND(COALESCE(MAX(q.score::numeric / NULLIF(q.total, 0) * 100), 0), 1) as best_score
  FROM public.profiles p
  LEFT JOIN public.user_preferences up ON p.user_id = up.user_id
  LEFT JOIN public.quiz_results q ON p.user_id = q.user_id
  GROUP BY p.user_id, p.display_name, p.avatar_url, up.interest, up.level
  HAVING COUNT(q.id) > 0
  ORDER BY avg_score DESC, total_quizzes DESC
  LIMIT 100;
$$;
