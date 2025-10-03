-- Demo Data Population Script for DiabloStudio
-- This script populates the database with color palette and demo client user

-- Insert COMPLETE color palette from the application (84 colors total)
-- RAL Yellow colors (8 colors)
INSERT INTO colors (code, name, hex, rgb_r, rgb_g, rgb_b, category) VALUES
('RAL 1000', 'Green beige', '#C2B078', 194, 176, 120, 'yellow'),
('RAL 1001', 'Beige', '#C2B078', 194, 176, 120, 'yellow'),
('RAL 1002', 'Sand yellow', '#C6A664', 198, 166, 100, 'yellow'),
('RAL 1003', 'Signal yellow', '#F8A800', 248, 168, 0, 'yellow'),
('RAL 1004', 'Golden yellow', '#E5B63F', 229, 182, 63, 'yellow'),
('RAL 1005', 'Honey yellow', '#C89F04', 200, 159, 4, 'yellow'),
('RAL 1006', 'Maize yellow', '#C9A304', 201, 163, 4, 'yellow'),
('RAL 1007', 'Daffodil yellow', '#DC9D00', 220, 157, 0, 'yellow')
ON CONFLICT (code) DO NOTHING;

-- RAL Orange colors (5 colors)
INSERT INTO colors (code, name, hex, rgb_r, rgb_g, rgb_b, category) VALUES
('RAL 2000', 'Yellow orange', '#DD7F2E', 221, 127, 46, 'orange'),
('RAL 2001', 'Red orange', '#C04F2F', 192, 79, 47, 'orange'),
('RAL 2002', 'Vermilion', '#C3592C', 195, 89, 44, 'orange'),
('RAL 2003', 'Pastel orange', '#F5A638', 245, 166, 56, 'orange'),
('RAL 2004', 'Pure orange', '#E75B2F', 231, 91, 47, 'orange')
ON CONFLICT (code) DO NOTHING;

-- RAL Red colors (6 colors)
INSERT INTO colors (code, name, hex, rgb_r, rgb_g, rgb_b, category) VALUES
('RAL 3000', 'Flame red', '#AF2B1E', 175, 43, 30, 'red'),
('RAL 3001', 'Signal red', '#A52019', 165, 32, 25, 'red'),
('RAL 3002', 'Carmine red', '#A2231D', 162, 35, 29, 'red'),
('RAL 3003', 'Ruby red', '#9B2321', 155, 35, 33, 'red'),
('RAL 3004', 'Purple red', '#75151E', 117, 21, 30, 'red'),
('RAL 3005', 'Wine red', '#5E2129', 94, 33, 41, 'red')
ON CONFLICT (code) DO NOTHING;

-- RAL Black colors (6 colors)
INSERT INTO colors (code, name, hex, rgb_r, rgb_g, rgb_b, category) VALUES
('RAL 9004', 'Signal black', '#2D2D30', 45, 45, 48, 'black'),
('RAL 9005', 'Jet black', '#0A0A0A', 10, 10, 10, 'black'),
('RAL 9011', 'Graphite black', '#1C1C1C', 28, 28, 28, 'black'),
('RAL 9017', 'Traffic black', '#2A2D2A', 42, 45, 42, 'black'),
('RAL 9021', 'Tar black', '#0A0A0A', 10, 10, 10, 'black'),
('RAL 9023', 'Pearl dark grey', '#7A7A7A', 122, 122, 122, 'black')
ON CONFLICT (code) DO NOTHING;

-- RAL White colors (4 colors)
INSERT INTO colors (code, name, hex, rgb_r, rgb_g, rgb_b, category) VALUES
('RAL 9001', 'Cream', '#F5F5F5', 245, 245, 245, 'white'),
('RAL 9002', 'Grey white', '#E7E7E7', 231, 231, 231, 'white'),
('RAL 9003', 'Signal white', '#F4F4F4', 244, 244, 244, 'white'),
('RAL 9010', 'Pure white', '#FFFFFF', 255, 255, 255, 'white')
ON CONFLICT (code) DO NOTHING;

-- RAL Gray colors (8 colors)
INSERT INTO colors (code, name, hex, rgb_r, rgb_g, rgb_b, category) VALUES
('RAL 7000', 'Squirrel grey', '#7E8B92', 126, 139, 146, 'gray'),
('RAL 7001', 'Silver grey', '#8F9999', 143, 153, 153, 'gray'),
('RAL 7004', 'Signal grey', '#9BA0A0', 155, 160, 160, 'gray'),
('RAL 7016', 'Anthracite grey', '#373F43', 55, 63, 67, 'gray'),
('RAL 7024', 'Graphite grey', '#474A50', 71, 74, 80, 'gray'),
('RAL 7030', 'Stone grey', '#939388', 147, 147, 136, 'gray'),
('RAL 7035', 'Light grey', '#C8C8C8', 200, 200, 200, 'gray'),
('RAL 7040', 'Window grey', '#9DA3A3', 157, 163, 163, 'gray')
ON CONFLICT (code) DO NOTHING;

-- RAL Blue colors (8 colors)
INSERT INTO colors (code, name, hex, rgb_r, rgb_g, rgb_b, category) VALUES
('RAL 5000', 'Violet blue', '#354D73', 53, 77, 115, 'blue'),
('RAL 5001', 'Green blue', '#1F4765', 31, 71, 101, 'blue'),
('RAL 5002', 'Ultramarine blue', '#2B2F5A', 43, 47, 90, 'blue'),
('RAL 5003', 'Sapphire blue', '#2A3756', 42, 55, 86, 'blue'),
('RAL 5004', 'Black blue', '#1D1E33', 29, 30, 51, 'blue'),
('RAL 5005', 'Signal blue', '#005387', 0, 83, 135, 'blue'),
('RAL 5007', 'Brilliant blue', '#4169E1', 65, 105, 225, 'blue'),
('RAL 5014', 'Pigeon blue', '#6C7B84', 108, 123, 132, 'blue')
ON CONFLICT (code) DO NOTHING;

-- Quartz Sands (Weber) - M series (16 colors)
INSERT INTO colors (code, name, hex, rgb_r, rgb_g, rgb_b, category, image_path) VALUES
('Piasek kwarcowy M01', 'Piasek kwarcowy MIX', '#F8F6F0', 248, 246, 240, 'sand', '/assets/Piaski/webersys mix PU M_01.jpg'),
('Piasek kwarcowy M02', 'Piasek kwarcowy MIX', '#E8E4D8', 232, 228, 216, 'sand', '/assets/Piaski/webersys mix PU M_02.jpg'),
('Piasek kwarcowy M03', 'Piasek kwarcowy MIX', '#D0C8B8', 208, 200, 184, 'sand', '/assets/Piaski/webersys mix PU M_03.jpg'),
('Piasek kwarcowy M04', 'Piasek kwarcowy MIX', '#E6D7C3', 230, 215, 195, 'sand', '/assets/Piaski/webersys mix PU M_04.jpg'),
('Piasek kwarcowy M05', 'Piasek kwarcowy MIX', '#C4A882', 196, 168, 130, 'sand', '/assets/Piaski/webersys mix PU M_05.jpg'),
('Piasek kwarcowy M06', 'Piasek kwarcowy MIX', '#A68B5B', 166, 139, 91, 'sand', '/assets/Piaski/webersys mix PU M_06.jpg'),
('Piasek kwarcowy M07', 'Piasek kwarcowy MIX', '#D2A4A4', 210, 164, 164, 'sand', '/assets/Piaski/webersys mix PU M_07.jpg'),
('Piasek kwarcowy M08', 'Piasek kwarcowy MIX', '#A8C8A8', 168, 200, 168, 'sand', '/assets/Piaski/webersys mix PU M_08.jpg'),
('Piasek kwarcowy M09', 'Piasek kwarcowy MIX', '#A8B8C8', 168, 184, 200, 'sand', '/assets/Piaski/webersys mix PU M_09.jpg'),
('Piasek kwarcowy M10', 'Piasek kwarcowy MIX', '#F4E4A6', 244, 228, 166, 'sand', '/assets/Piaski/webersys mix PU M_10.jpg'),
('Piasek kwarcowy M11', 'Piasek kwarcowy MIX', '#C0C0C0', 192, 192, 192, 'sand', '/assets/Piaski/webersys mix PU M_11.jpg'),
('Piasek kwarcowy M12', 'Piasek kwarcowy MIX', '#B87333', 184, 115, 51, 'sand', '/assets/Piaski/webersys mix PU M_12.jpg'),
('Piasek kwarcowy M13', 'Piasek kwarcowy MIX', '#708090', 112, 128, 144, 'sand', '/assets/Piaski/webersys mix PU M_13.jpg'),
('Piasek kwarcowy M14', 'Piasek kwarcowy MIX', '#2F4F4F', 47, 79, 79, 'sand', '/assets/Piaski/webersys mix PU M_14.jpg'),
('Piasek kwarcowy M15', 'Piasek kwarcowy MIX', '#F5F5DC', 245, 245, 220, 'sand', '/assets/Piaski/webersys mix PU M_15.jpg'),
('Piasek kwarcowy M16', 'Piasek kwarcowy MIX', '#808000', 128, 128, 0, 'sand', '/assets/Piaski/webersys mix PU M_16.jpg')
ON CONFLICT (code) DO NOTHING;

-- Decorative Chips (21 colors - COMPLETE SET)
INSERT INTO colors (code, name, hex, rgb_r, rgb_g, rgb_b, category, image_path) VALUES
('Chips 01', 'Dekoracyjne chips 01', '#8B4513', 139, 69, 19, 'chips', '/assets/Chips/webersys chips_01.jpg'),
('Chips 02', 'Dekoracyjne chips 02', '#A0522D', 160, 82, 45, 'chips', '/assets/Chips/webersys chips_02.jpg'),
('Chips 03', 'Dekoracyjne chips 03', '#CD853F', 205, 133, 63, 'chips', '/assets/Chips/webersys chips_03.jpg'),
('Chips 04', 'Dekoracyjne chips 04', '#DAA520', 218, 165, 32, 'chips', '/assets/Chips/webersys chips_04.jpg'),
('Chips 05', 'Dekoracyjne chips 05', '#D2691E', 210, 105, 30, 'chips', '/assets/Chips/webersys chips_05.jpg'),
('Chips 06', 'Dekoracyjne chips 06', '#B8860B', 184, 134, 11, 'chips', '/assets/Chips/webersys chips_06.jpg'),
('Chips 07', 'Dekoracyjne chips 07', '#8B0000', 139, 0, 0, 'chips', '/assets/Chips/webersys chips_07.jpg'),
('Chips 08', 'Dekoracyjne chips 08', '#FF6347', 255, 99, 71, 'chips', '/assets/Chips/webersys chips_08.jpg'),
('Chips 09', 'Dekoracyjne chips 09', '#4169E1', 65, 105, 225, 'chips', '/assets/Chips/webersys chips_09.jpg'),
('Chips 10', 'Dekoracyjne chips 10', '#32CD32', 50, 205, 50, 'chips', '/assets/Chips/webersys chips_10.jpg'),
('Chips 11', 'Dekoracyjne chips 11', '#FFD700', 255, 215, 0, 'chips', '/assets/Chips/webersys chips_11.jpg'),
('Chips 12', 'Dekoracyjne chips 12', '#C0C0C0', 192, 192, 192, 'chips', '/assets/Chips/webersys chips_12.jpg'),
('Chips 13', 'Dekoracyjne chips 13', '#800080', 128, 0, 128, 'chips', '/assets/Chips/webersys chips_13.jpg'),
('Chips 14', 'Dekoracyjne chips 14', '#FF4500', 255, 69, 0, 'chips', '/assets/Chips/webersys chips_14.jpg'),
('Chips 15', 'Dekoracyjne chips 15', '#00FF7F', 0, 255, 127, 'chips', '/assets/Chips/webersys chips_15.jpg'),
('Chips 16', 'Dekoracyjne chips 16', '#008080', 0, 128, 128, 'chips', '/assets/Chips/webersys chips_16.jpg'),
('Chips 17', 'Dekoracyjne chips 17', '#FF1493', 255, 20, 147, 'chips', '/assets/Chips/webersys chips_17.jpg'),
('Chips 18', 'Dekoracyjne chips 18', '#00CED1', 0, 206, 209, 'chips', '/assets/Chips/webersys chips_18.jpg'),
('Chips 19', 'Dekoracyjne chips 19', '#FF8C00', 255, 140, 0, 'chips', '/assets/Chips/webersys chips_19.jpg'),
('Chips 20', 'Dekoracyjne chips 20', '#9932CC', 153, 50, 204, 'chips', '/assets/Chips/webersys chips_20.jpg'),
('Chips 21', 'Dekoracyjne chips 21', '#8FBC8F', 143, 188, 143, 'chips', '/assets/Chips/webersys chips_21.jpg')
ON CONFLICT (code) DO NOTHING;

-- Insert demo client user (this would typically be done through Supabase Auth)
-- Note: This is a placeholder - in practice, you'd create the user through Supabase Auth first
-- and then insert the profile data with the corresponding auth.users ID

-- Example of how to create a demo client profile (you'll need to replace 'demo-user-id' with actual auth user ID):
-- INSERT INTO client_profiles (id, first_name, last_name, email, phone, company) VALUES
-- ('demo-user-id', 'Jan', 'Kowalski', 'demo@klient.com', '+48 123 456 789', 'Demo Company')
-- ON CONFLICT (id) DO NOTHING;

-- Insert sample FAQ entries
INSERT INTO faq (question, answer, category, is_active, sort_order) VALUES
('Jak długo trwa realizacja projektu?', 'Czas realizacji zależy od wielkości projektu i wynosi zazwyczaj od 3 do 14 dni roboczych.', 'general', true, 1),
('Czy oferujecie gwarancję na wykonane prace?', 'Tak, udzielamy 24-miesięcznej gwarancji na wszystkie wykonane przez nas prace.', 'general', true, 2),
('Jakie materiały używacie?', 'Używamy najwyższej jakości materiałów od sprawdzonych producentów, takich jak Weber, Ceresit i innych renomowanych marek.', 'materials', true, 3),
('Czy wykonujecie wyceny bezpłatnie?', 'Tak, wycena wstępna jest całkowicie bezpłatna i niezobowiązująca.', 'pricing', true, 4),
('W jakich godzinach pracujecie?', 'Pracujemy od poniedziałku do piątku w godzinach 8:00-16:00.', 'general', true, 5)
ON CONFLICT (id) DO NOTHING;

-- Insert sample reviews (approved status)
INSERT INTO reviews (first_name, last_name, email, project_date, project_type, square_meters, rating, review_text, status, project_location) VALUES
('Anna', 'Nowak', 'anna@example.com', '2024-01-15', 'Posadzka dekoracyjna', 45.5, 5, 'Świetna jakość wykonania, bardzo polecam tę firmę!', 'approved', 'Warszawa'),
('Piotr', 'Wiśniewski', 'piotr@example.com', '2024-02-20', 'Mikrocement', 32.0, 5, 'Profesjonalne podejście i terminowość. Efekt przekroczył oczekiwania.', 'approved', 'Kraków'),
('Maria', 'Kowalczyk', 'maria@example.com', '2024-03-10', 'Żywica epoksydowa', 28.5, 4, 'Dobra jakość w rozsądnej cenie. Polecam!', 'approved', 'Gdańsk')
ON CONFLICT (id) DO NOTHING;

-- Insert sample realization
INSERT INTO realizations (title, category, description, materials, square_meters, location, completion_date, is_published) VALUES
('Nowoczesna posadzka w apartamencie', 'residential', 'Elegancka posadzka dekoracyjna w stylu minimalistycznym z użyciem mikrocementu w kolorze szarym.', ARRAY['mikrocement', 'żywica'], 65.0, 'Warszawa, Mokotów', '2024-01-30', true),
('Posadzka w salonie fryzjerskim', 'commercial', 'Funkcjonalna i estetyczna posadzka w salonie fryzjerskim odporna na intensywne użytkowanie.', ARRAY['żywica epoksydowa', 'piasek kwarcowy'], 45.0, 'Kraków, Stare Miasto', '2024-02-25', true),
('Industrialna posadzka w garażu', 'industrial', 'Trwała posadzka epoksydowa w prywatnym garażu z dekoracyjnymi chipsami.', ARRAY['żywica epoksydowa', 'chips dekoracyjne'], 80.0, 'Poznań, Jeżyce', '2024-03-15', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample consultation
INSERT INTO consultations (customer_name, customer_email, customer_phone, subject, message, status) VALUES
('Tomasz Jankowski', 'tomasz@example.com', '+48 987 654 321', 'Wycena posadzki w mieszkaniu', 'Interesuje mnie wycena posadzki dekoracyjnej w salonie o powierzchni około 25m2. Proszę o kontakt.', 'new')
ON CONFLICT (id) DO NOTHING;

-- Insert sample valuation request
INSERT INTO valuation_requests (customer_name, customer_email, customer_phone, project_type, project_details, budget_range, preferred_contact_method, status) VALUES
('Katarzyna Lewandowska', 'katarzyna@example.com', '+48 555 123 456', 'Posadzka w łazience', 'Chcę wykonać posadzkę w łazience o powierzchni 8m2 z użyciem mikrocementu.', '5,000 - 10,000 PLN', 'email', 'new')
ON CONFLICT (id) DO NOTHING;

-- Output completion message
SELECT 'Demo data populated successfully!' as status;
