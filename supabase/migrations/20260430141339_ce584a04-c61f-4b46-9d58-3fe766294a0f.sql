CREATE TABLE public.milestone_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  interest TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, interest, sort_order)
);

ALTER TABLE public.milestone_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own milestone progress"
  ON public.milestone_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_milestone_progress_updated_at
  BEFORE UPDATE ON public.milestone_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_milestone_progress_user_interest
  ON public.milestone_progress (user_id, interest);