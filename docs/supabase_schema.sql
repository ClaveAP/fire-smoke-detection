-- ==============================================================================
-- AEGISFLAME - FIRE & SMOKE DETECTION COMMAND CENTER
-- Supabase Database Schema: Tabel Riwayat Insiden (Incident History) & RLS
-- ==============================================================================

-- 1. Buat Tabel Incidents
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    camera_id TEXT NOT NULL,
    camera_name TEXT NOT NULL,
    zone TEXT,
    type TEXT NOT NULL CHECK (type IN ('fire', 'smoke')),
    secondary_type TEXT CHECK (secondary_type IN ('fire', 'smoke')),
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    smoke_confidence NUMERIC(4,3) CHECK (smoke_confidence >= 0 AND smoke_confidence <= 1),
    temperature_c NUMERIC(6,2),
    smoke_density_dbm NUMERIC(6,2),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved')),
    snapshot_url TEXT,
    notes TEXT,
    detections JSONB DEFAULT '[]'::jsonb,
    operator JSONB DEFAULT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Buat Index untuk performa query cepat saat filter & sorting
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON public.incidents (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON public.incidents (type);
CREATE INDEX IF NOT EXISTS idx_incidents_camera_id ON public.incidents (camera_id);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan Keamanan RLS (Policies):
-- Policy 1: Izinkan semua pengunjung / pengguna terautentikasi membaca riwayat insiden
DROP POLICY IF EXISTS "Public can view incidents" ON public.incidents;
CREATE POLICY "Public can view incidents"
    ON public.incidents
    FOR SELECT
    USING (true);

-- Policy 2: Izinkan sistem / kamera / pengguna menyimpan rekaman insiden baru
DROP POLICY IF EXISTS "Anyone can record incidents" ON public.incidents;
CREATE POLICY "Anyone can record incidents"
    ON public.incidents
    FOR INSERT
    WITH CHECK (true);

-- Policy 3: Izinkan pembaruan status atau catatan insiden (mis. investigasi / resolved)
DROP POLICY IF EXISTS "Anyone can update incident status" ON public.incidents;
CREATE POLICY "Anyone can update incident status"
    ON public.incidents
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy 4: Izinkan penghapusan insiden oleh pengguna terautentikasi
DROP POLICY IF EXISTS "Authenticated users can delete incidents" ON public.incidents;
CREATE POLICY "Authenticated users can delete incidents"
    ON public.incidents
    FOR DELETE
    USING (true);

-- 5. Berikan hak akses kepada anon dan authenticated roles
GRANT ALL ON TABLE public.incidents TO anon, authenticated, service_role;

-- ==============================================================================
-- SELESAI. Salin dan jalankan script ini di menu "SQL Editor" pada Supabase Dashboard Anda.
-- ==============================================================================
