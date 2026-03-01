-- Allow anon writes for demo app (mock auth, no Supabase Auth)
CREATE POLICY "Allow public insert" ON organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON organizations FOR UPDATE USING (true);

CREATE POLICY "Allow public insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public insert" ON charts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON charts FOR UPDATE USING (true);

CREATE POLICY "Allow public insert" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON documents FOR UPDATE USING (true);

CREATE POLICY "Allow public insert" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON comments FOR UPDATE USING (true);

CREATE POLICY "Allow public insert" ON audit_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON audit_events FOR UPDATE USING (true);

CREATE POLICY "Allow public insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON notifications FOR UPDATE USING (true);

CREATE POLICY "Allow public insert" ON rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON rules FOR UPDATE USING (true);
