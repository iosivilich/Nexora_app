-- Mirrored from supabase_migrations.schema_migrations on the remote project
-- so the local CLI history matches the database history.

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name text,
  avatar_url text,
  city text,
  user_type text CHECK (user_type IN ('EMPRESA', 'CONSULTOR')),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone' AND tablename = 'profiles') THEN
        CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
    END IF;
END
$$;

-- Create trigger function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create consultants table
CREATE TABLE IF NOT EXISTS public.consultants (
  id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  role text,
  rating numeric DEFAULT 5,
  projects integer DEFAULT 0,
  experience_years integer,
  age integer,
  bio text,
  expertise text[],
  verified boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for consultants
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Consultants are viewable by everyone' AND tablename = 'consultants') THEN
        CREATE POLICY "Consultants are viewable by everyone" ON public.consultants
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Consultants can update their own data' AND tablename = 'consultants') THEN
        CREATE POLICY "Consultants can update their own data" ON public.consultants
          FOR UPDATE USING (auth.uid() = id);
    END IF;
END
$$;
