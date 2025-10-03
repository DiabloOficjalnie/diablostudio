const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'https://epujffkujstgprcamgpi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWpmZmt1anN0Z3ByY2FtZ3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA3MjgxMCwiZXhwIjoyMDc0NjQ4ODEwfQ.mStVJkfPaboEZ2n6P00A8nQKO9RlonwasZJTBxRUmf0'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Comprehensive colors data
const getAllColors = () => {
  return [
    // RAL Colors - Yellows (1000-1039)
    { code: 'RAL 1000', name: 'Beżowo-zielony', hex: '#C2B078', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1001', name: 'Beżowy', hex: '#C2B078', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1002', name: 'Żółty piaskowy', hex: '#C6A664', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1003', name: 'Żółty sygnałowy', hex: '#F8A800', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1004', name: 'Żółty złoty', hex: '#E5B63F', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1005', name: 'Żółty miodowy', hex: '#C89F04', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1006', name: 'Żółty kukurydziany', hex: '#C9A304', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1007', name: 'Żółty narcyzowy', hex: '#DC9D00', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1011', name: 'Brązowo-beżowy', hex: '#AF9B7C', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1012', name: 'Żółty cytrynowy', hex: '#D2C51A', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1013', name: 'Biały perłowy', hex: '#E3DCC7', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1014', name: 'Kremowy kości słoniowej', hex: '#D5C5A8', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1015', name: 'Jasny kremowy', hex: '#E6DAC1', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1016', name: 'Żółty siarkowy', hex: '#F0E658', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1017', name: 'Żółty szafranowy', hex: '#F3A505', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1018', name: 'Żółty cynkowy', hex: '#F5E30B', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1019', name: 'Szaro-beżowy', hex: '#A29C88', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1020', name: 'Żółto-oliwkowy', hex: '#999950', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1021', name: 'Żółty rzepakowy', hex: '#F0D028', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1023', name: 'Żółty komunikacyjny', hex: '#F0C929', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1024', name: 'Żółty ochra', hex: '#B09A4F', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1026', name: 'Żółty błyszczący', hex: '#F0F01A', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1027', name: 'Żółty curry', hex: '#9F8F15', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1028', name: 'Żółty melonowy', hex: '#F39E0C', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1032', name: 'Żółty rzepakowy', hex: '#DDBA18', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1033', name: 'Żółty dalii', hex: '#F2A900', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1034', name: 'Żółty pastelowy', hex: '#EFA905', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1035', name: 'Żółto-perłowy', hex: '#9A9B9A', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1036', name: 'Różowo-perłowy', hex: '#8F5B4A', category: 'ral-yellow', manufacturer: 'RAL' },
    { code: 'RAL 1037', name: 'Żółto-pomarańczowy', hex: '#F09A30', category: 'ral-yellow', manufacturer: 'RAL' },

    // RAL Colors - Oranges (2000-2019)
    { code: 'RAL 2000', name: 'Żółto-pomarańczowy', hex: '#DD7F2E', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2001', name: 'Czerwono-pomarańczowy', hex: '#C04F2F', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2002', name: 'Cynober', hex: '#C3592C', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2003', name: 'Pomarańczowy pastelowy', hex: '#F5A638', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2004', name: 'Czysty pomarańczowy', hex: '#E75B2F', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2005', name: 'Pomarańczowy błyszczący', hex: '#FF4A0A', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2007', name: 'Pomarańczowy jasny błyszczący', hex: '#F4A427', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2008', name: 'Pomarańczowo-czerwony jasny', hex: '#F07F47', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2009', name: 'Pomarańczowy komunikacyjny', hex: '#E86A17', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2010', name: 'Pomarańczowy sygnałowy', hex: '#D46F2F', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2011', name: 'Pomarańczowy głęboki', hex: '#EC7C26', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2012', name: 'Pomarańczowy łososiowy', hex: '#E38252', category: 'ral-orange', manufacturer: 'RAL' },
    { code: 'RAL 2013', name: 'Pomarańczowy perłowy', hex: '#8F5B3A', category: 'ral-orange', manufacturer: 'RAL' },

    // RAL Colors - Reds (3000-3039)
    { code: 'RAL 3000', name: 'Czerwony ognisty', hex: '#AF2B1E', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3001', name: 'Czerwony sygnałowy', hex: '#A52019', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3002', name: 'Czerwony karminowy', hex: '#A2231D', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3003', name: 'Czerwony rubinowy', hex: '#9B2321', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3004', name: 'Czerwono-purpurowy', hex: '#75151E', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3005', name: 'Czerwony winny', hex: '#5E2129', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3007', name: 'Czarno-czerwony', hex: '#402225', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3009', name: 'Czerwony tlenkowy', hex: '#703731', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3011', name: 'Czerwono-brązowy', hex: '#7E2F2A', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3012', name: 'Czerwono-beżowy', hex: '#C4877F', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3013', name: 'Czerwony pomidorowy', hex: '#A3262A', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3014', name: 'Różowy antyczny', hex: '#D0798C', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3015', name: 'Różowy jasny', hex: '#E8B8C1', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3016', name: 'Czerwony koralowy', hex: '#B53B54', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3017', name: 'Różowy', hex: '#D3586F', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3018', name: 'Czerwony truskawkowy', hex: '#D23F57', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3020', name: 'Czerwony komunikacyjny', hex: '#C1121C', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3022', name: 'Czerwony łososiowy', hex: '#D6857A', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3024', name: 'Czerwony błyszczący', hex: '#F00000', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3026', name: 'Czerwony błyszczący', hex: '#FF0000', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3027', name: 'Czerwony malinowy', hex: '#B11226', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3028', name: 'Czerwony czysto', hex: '#E7252A', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3031', name: 'Czerwono-orientalny', hex: '#A6343F', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3032', name: 'Czerwono-perłowy', hex: '#721F39', category: 'ral-red', manufacturer: 'RAL' },
    { code: 'RAL 3033', name: 'Różowy perłowy', hex: '#B0506B', category: 'ral-red', manufacturer: 'RAL' },

    // RAL Colors - Violets (4000-4019)
    { code: 'RAL 4001', name: 'Czerwono-liliowy', hex: '#8A5A83', category: 'ral-violet', manufacturer: 'RAL' },
    { code: 'RAL 4002', name: 'Czerwono-fioletowy', hex: '#933D50', category: 'ral-violet', manufacturer: 'RAL' },
    { code: 'RAL 4003', name: 'Fioletowy wrzosowy', hex: '#D5487F', category: 'ral-violet', manufacturer: 'RAL' },
    { code: 'RAL 4004', name: 'Fioletowy bordowy', hex: '#641C34', category: 'ral-violet', manufacturer: 'RAL' },
    { code: 'RAL 4005', name: 'Niebiesko-liliowy', hex: '#83639D', category: 'ral-violet', manufacturer: 'RAL' },
    { code: 'RAL 4006', name: 'Fioletowy komunikacyjny', hex: '#982B61', category: 'ral-violet', manufacturer: 'RAL' },
    { code: 'RAL 4007', name: 'Fioletowy purpurowy', hex: '#4A2C3D', category: 'ral-violet', manufacturer: 'RAL' },
    { code: 'RAL 4008', name: 'Fioletowy sygnałowy', hex: '#8E4B8B', category: 'ral-violet', manufacturer: 'RAL' },
    { code: 'RAL 4009', name: 'Fioletowy pastelowy', hex: '#A38995', category: 'ral-violet', manufacturer: 'RAL' },
    { code: 'RAL 4010', name: 'Fioletowy telemagenta', hex: '#C25A7A', category: 'ral-violet', manufacturer: 'RAL' },
    { code: 'RAL 4011', name: 'Fioletowy perłowy', hex: '#8775A6', category: 'ral-violet', manufacturer: 'RAL' },
    { code: 'RAL 4012', name: 'Fioletowo-perłowy', hex: '#6C6EAA', category: 'ral-violet', manufacturer: 'RAL' },

    // RAL Colors - Greens (6000-6029)
    { code: 'RAL 6000', name: 'Zielony patyna', hex: '#32743F', category: 'ral-green' },
    { code: 'RAL 6001', name: 'Zielony szmaragdowy', hex: '#28713E', category: 'ral-green' },
    { code: 'RAL 6002', name: 'Zielony liściowy', hex: '#276235', category: 'ral-green' },
    { code: 'RAL 6003', name: 'Zielony oliwkowy', hex: '#4F5F2F', category: 'ral-green' },
    { code: 'RAL 6004', name: 'Niebiesko-zielony', hex: '#0E2F3A', category: 'ral-green' },
    { code: 'RAL 6005', name: 'Zielony mechowy', hex: '#0F4336', category: 'ral-green' },
    { code: 'RAL 6006', name: 'Zielony szaro-oliwkowy', hex: '#3E4F3E', category: 'ral-green' },
    { code: 'RAL 6007', name: 'Zielony butelkowy', hex: '#2E3A23', category: 'ral-green' },
    { code: 'RAL 6008', name: 'Zielony brązowy', hex: '#3A4232', category: 'ral-green' },
    { code: 'RAL 6009', name: 'Zielony jodłowy', hex: '#26392F', category: 'ral-green' },
    { code: 'RAL 6010', name: 'Zielony trawiasty', hex: '#3E7B4F', category: 'ral-green' },
    { code: 'RAL 6011', name: 'Zielony rezedowy', hex: '#68825B', category: 'ral-green' },
    { code: 'RAL 6012', name: 'Zielony czarny', hex: '#2F3D2F', category: 'ral-green' },
    { code: 'RAL 6013', name: 'Zielony trzcinowy', hex: '#7B8F4F', category: 'ral-green' },
    { code: 'RAL 6014', name: 'Zielony żółto-oliwkowy', hex: '#4A5D3A', category: 'ral-green' },
    { code: 'RAL 6015', name: 'Zielony czarno-oliwkowy', hex: '#3B3C3A', category: 'ral-green' },
    { code: 'RAL 6016', name: 'Zielony turkusowy', hex: '#006B54', category: 'ral-green' },
    { code: 'RAL 6017', name: 'Zielony majowy', hex: '#4F8C5B', category: 'ral-green' },
    { code: 'RAL 6018', name: 'Zielony żółto-zielony', hex: '#4F9461', category: 'ral-green' },
    { code: 'RAL 6019', name: 'Zielono-biały', hex: '#B5D5C5', category: 'ral-green' },
    { code: 'RAL 6020', name: 'Zielony chromowy', hex: '#3E4B4B', category: 'ral-green' },
    { code: 'RAL 6021', name: 'Zielony blady', hex: '#86B255', category: 'ral-green' },
    { code: 'RAL 6022', name: 'Zielony brązowo-oliwkowy', hex: '#4A5D3A', category: 'ral-green' },
    { code: 'RAL 6024', name: 'Zielony komunikacyjny', hex: '#008351', category: 'ral-green' },
    { code: 'RAL 6025', name: 'Zielony paprociowy', hex: '#5F7A4F', category: 'ral-green' },
    { code: 'RAL 6026', name: 'Zielony opalowy', hex: '#006B54', category: 'ral-green' },
    { code: 'RAL 6027', name: 'Zielony jasny', hex: '#7EBAB5', category: 'ral-green' },
    { code: 'RAL 6028', name: 'Zielony sosnowy', hex: '#2F5F4F', category: 'ral-green' },
    { code: 'RAL 6029', name: 'Zielony miętowy', hex: '#006F4F', category: 'ral-green' },

    // RAL Colors - Blues (5000-5029)
    { code: 'RAL 5000', name: 'Fioletowo-niebieski', hex: '#354D73', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5001', name: 'Zielono-niebieski', hex: '#1F4764', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5002', name: 'Niebieski ultramaryna', hex: '#2B2C7C', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5003', name: 'Niebieski szafirowy', hex: '#2A3756', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5004', name: 'Czarno-niebieski', hex: '#1D1E33', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5005', name: 'Niebieski sygnałowy', hex: '#005387', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5007', name: 'Niebieski brylantowy', hex: '#4169E1', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5008', name: 'Niebieski szary', hex: '#3A4756', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5009', name: 'Niebieski lazurowy', hex: '#2E5978', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5010', name: 'Niebieski goryczkowy', hex: '#0E5181', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5011', name: 'Niebieski stalowy', hex: '#232C3B', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5012', name: 'Niebieski jasny', hex: '#3B83BD', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5013', name: 'Niebieski kobaltowy', hex: '#2D3F7A', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5014', name: 'Niebieski gołębi', hex: '#6C7B95', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5015', name: 'Niebieski nieba', hex: '#2875B3', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5017', name: 'Niebieski komunikacyjny', hex: '#005A9C', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5018', name: 'Niebieski turkusowy', hex: '#0F4A5C', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5019', name: 'Niebieski kapry', hex: '#1B4C6B', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5020', name: 'Niebieski oceaniczny', hex: '#0B4153', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5021', name: 'Niebieski wodny', hex: '#2F6B7A', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5022', name: 'Niebieski nocny', hex: '#2A2D79', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5023', name: 'Niebieski odległy', hex: '#4D6B8C', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5024', name: 'Niebieski pastelowy', hex: '#6B8DB3', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5025', name: 'Niebieski perłowy goryczka', hex: '#2A6A8C', category: 'ral-blue', manufacturer: 'RAL' },
    { code: 'RAL 5026', name: 'Niebieski perłowy', hex: '#0F2F5A', category: 'ral-blue', manufacturer: 'RAL' },

    // RAL Colors - Greens (6000-6029)
    { code: 'RAL 6000', name: 'Zielony patyna', hex: '#32743F', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6001', name: 'Zielony szmaragdowy', hex: '#28713E', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6002', name: 'Zielony liściowy', hex: '#276235', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6003', name: 'Zielony oliwkowy', hex: '#4F5F2F', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6004', name: 'Niebiesko-zielony', hex: '#0E2F3A', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6005', name: 'Zielony mechowy', hex: '#0F4336', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6006', name: 'Zielony szaro-oliwkowy', hex: '#3E4F3E', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6007', name: 'Zielony butelkowy', hex: '#2E3A23', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6008', name: 'Zielony brązowy', hex: '#3A4232', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6009', name: 'Zielony jodłowy', hex: '#26392F', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6010', name: 'Zielony trawiasty', hex: '#3E7B4F', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6011', name: 'Zielony rezedowy', hex: '#68825B', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6012', name: 'Zielony czarny', hex: '#2F3D2F', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6013', name: 'Zielony trzcinowy', hex: '#7B8F4F', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6014', name: 'Zielony żółto-oliwkowy', hex: '#4A5D3A', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6015', name: 'Zielony czarno-oliwkowy', hex: '#3B3C3A', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6016', name: 'Zielony turkusowy', hex: '#006B54', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6017', name: 'Zielony majowy', hex: '#4F8C5B', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6018', name: 'Zielony żółto-zielony', hex: '#4F9461', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6019', name: 'Zielono-biały', hex: '#B5D5C5', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6020', name: 'Zielony chromowy', hex: '#3E4B4B', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6021', name: 'Zielony blady', hex: '#86B255', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6022', name: 'Zielony brązowo-oliwkowy', hex: '#4A5D3A', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6024', name: 'Zielony komunikacyjny', hex: '#008351', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6025', name: 'Zielony paprociowy', hex: '#5F7A4F', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6026', name: 'Zielony opalowy', hex: '#006B54', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6027', name: 'Zielony jasny', hex: '#7EBAB5', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6028', name: 'Zielony sosnowy', hex: '#2F5F4F', category: 'ral-green', manufacturer: 'RAL' },
    { code: 'RAL 6029', name: 'Zielony miętowy', hex: '#006F4F', category: 'ral-green', manufacturer: 'RAL' },

    // RAL Colors - Greys (7000-7049)
    { code: 'RAL 7000', name: 'Szary wiewiórkowy', hex: '#7E8B92', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7001', name: 'Szary srebrny', hex: '#8F999F', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7002', name: 'Szary oliwkowy', hex: '#817F68', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7003', name: 'Szary mszysty', hex: '#7A7B6D', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7004', name: 'Szary sygnałowy', hex: '#9EA0A6', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7005', name: 'Szary mysi', hex: '#6B6F73', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7006', name: 'Szary beżowy', hex: '#756F61', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7008', name: 'Szary khaki', hex: '#746643', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7009', name: 'Szary zielony', hex: '#5B6356', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7010', name: 'Szary namiotowy', hex: '#575C5F', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7011', name: 'Szary stalowy', hex: '#555D61', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7012', name: 'Szary bazaltowy', hex: '#5A5D5E', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7013', name: 'Szary brązowy', hex: '#555548', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7015', name: 'Szary łupkowy', hex: '#51565C', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7016', name: 'Szary antracytowy', hex: '#3A4756', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7021', name: 'Szary czarno-szary', hex: '#2F3234', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7022', name: 'Szary ziemisty', hex: '#4B4D4B', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7023', name: 'Szary betonowy', hex: '#7F8274', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7024', name: 'Szary grafitowy', hex: '#474A50', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7026', name: 'Szary granitowy', hex: '#374447', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7030', name: 'Szary kamienny', hex: '#939388', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7031', name: 'Szary niebieski', hex: '#5A6B7D', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7032', name: 'Szary żwirowy', hex: '#B5B2A1', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7033', name: 'Szary cementowy', hex: '#7F8274', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7034', name: 'Szary żółty', hex: '#939388', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7035', name: 'Szary jasny', hex: '#C8CCD0', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7036', name: 'Szary platynowy', hex: '#9A9DA1', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7037', name: 'Szary pyłowy', hex: '#7A7D7F', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7038', name: 'Szary agatowy', hex: '#B0B5B0', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7039', name: 'Szary kwarcowy', hex: '#6B6F73', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7040', name: 'Szary okienny', hex: '#9DA3A6', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7042', name: 'Szary komunikacyjny A', hex: '#8E9294', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7043', name: 'Szary komunikacyjny B', hex: '#51565C', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7044', name: 'Szary jedwabisty', hex: '#B8BDB8', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7045', name: 'Szary tele 1', hex: '#909498', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7046', name: 'Szary tele 2', hex: '#7F8A8E', category: 'ral-grey', manufacturer: 'RAL' },
    { code: 'RAL 7047', name: 'Szary tele 4', hex: '#C8C8C8', category: 'ral-grey', manufacturer: 'RAL' },

    // RAL Colors - Whites (9000-9029)
    { code: 'RAL 9000', name: 'Biały czysto', hex: '#FFFFFF', category: 'ral-white', manufacturer: 'RAL' },
    { code: 'RAL 9001', name: 'Kremowy', hex: '#F5F4F0', category: 'ral-white', manufacturer: 'RAL' },
    { code: 'RAL 9002', name: 'Szaro-biały', hex: '#E7E7E3', category: 'ral-white', manufacturer: 'RAL' },
    { code: 'RAL 9003', name: 'Biały sygnałowy', hex: '#F4F4F4', category: 'ral-white', manufacturer: 'RAL' },
    { code: 'RAL 9004', name: 'Czarny sygnałowy', hex: '#2C2C2C', category: 'ral-black', manufacturer: 'RAL' },
    { code: 'RAL 9005', name: 'Czarny odrzutowy', hex: '#0A0A0A', category: 'ral-black', manufacturer: 'RAL' },
    { code: 'RAL 9006', name: 'Srebrny metaliczny', hex: '#A5A7AB', category: 'ral-white', manufacturer: 'RAL' },
    { code: 'RAL 9007', name: 'Szary aluminiowy', hex: '#8F8F8F', category: 'ral-white', manufacturer: 'RAL' },
    { code: 'RAL 9010', name: 'Biały czysto', hex: '#FFFFFF', category: 'ral-white', manufacturer: 'RAL' },
    { code: 'RAL 9011', name: 'Czarny grafitowy', hex: '#1C1C1C', category: 'ral-black', manufacturer: 'RAL' },
    { code: 'RAL 9012', name: 'Biały czysto', hex: '#FFFFFF', category: 'ral-white', manufacturer: 'RAL' },
    { code: 'RAL 9016', name: 'Biały komunikacyjny', hex: '#F5F5F5', category: 'ral-white', manufacturer: 'RAL' },
    { code: 'RAL 9017', name: 'Czarny komunikacyjny', hex: '#2A2A2A', category: 'ral-black', manufacturer: 'RAL' },
    { code: 'RAL 9018', name: 'Biały papirusowy', hex: '#D0D0D0', category: 'ral-white', manufacturer: 'RAL' },
    { code: 'RAL 9022', name: 'Szary perłowy', hex: '#9A9A9A', category: 'ral-white', manufacturer: 'RAL' },
    { code: 'RAL 9023', name: 'Szary ciemny perłowy', hex: '#7A7A7A', category: 'ral-white', manufacturer: 'RAL' },

    // RAL Colors - Blacks (9004-9039)
    { code: 'RAL 9004', name: 'Czarny sygnałowy', hex: '#2C2C2C', category: 'ral-black', manufacturer: 'RAL' },
    { code: 'RAL 9005', name: 'Czarny odrzutowy', hex: '#0A0A0A', category: 'ral-black', manufacturer: 'RAL' },
    { code: 'RAL 9011', name: 'Czarny grafitowy', hex: '#1C1C1C', category: 'ral-black', manufacturer: 'RAL' },
    { code: 'RAL 9017', name: 'Czarny komunikacyjny', hex: '#2A2A2A', category: 'ral-black', manufacturer: 'RAL' },
    { code: 'RAL 9031', name: 'Czarny czysto', hex: '#000000', category: 'ral-black', manufacturer: 'RAL' },

    // Weber Quartz Sands - M series
    { code: 'M01', name: 'Piasek kwarcowy M01', hex: '#F8F6F0', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_01.jpg' },
    { code: 'M02', name: 'Piasek kwarcowy M02', hex: '#E8E4D8', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_02.jpg' },
    { code: 'M03', name: 'Piasek kwarcowy M03', hex: '#D0C8B8', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_03.jpg' },
    { code: 'M04', name: 'Piasek kwarcowy M04', hex: '#E6D7C3', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_04.jpg' },
    { code: 'M05', name: 'Piasek kwarcowy M05', hex: '#C4A882', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_05.jpg' },
    { code: 'M06', name: 'Piasek kwarcowy M06', hex: '#A68B5B', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_06.jpg' },
    { code: 'M07', name: 'Piasek kwarcowy M07', hex: '#D2A4A4', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_07.jpg' },
    { code: 'M08', name: 'Piasek kwarcowy M08', hex: '#A8C8A8', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_08.jpg' },
    { code: 'M09', name: 'Piasek kwarcowy M09', hex: '#A8B8C8', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_09.jpg' },
    { code: 'M10', name: 'Piasek kwarcowy M10', hex: '#F4E4A6', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_10.jpg' },
    { code: 'M11', name: 'Piasek kwarcowy M11', hex: '#C0C0C0', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_11.jpg' },
    { code: 'M12', name: 'Piasek kwarcowy M12', hex: '#B87333', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_12.jpg' },
    { code: 'M13', name: 'Piasek kwarcowy M13', hex: '#708090', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_13.jpg' },
    { code: 'M14', name: 'Piasek kwarcowy M14', hex: '#2F4F4F', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_14.jpg' },
    { code: 'M15', name: 'Piasek kwarcowy M15', hex: '#F5F5DC', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_15.jpg' },
    { code: 'M16', name: 'Piasek kwarcowy M16', hex: '#808000', category: 'sand', manufacturer: 'Weber', imagePath: '/assets/Piaski/webersys mix PU M_16.jpg' },

    // Weber Decorative Chips
    { code: 'Chips 01', name: 'Chips dekoracyjny 01', hex: '#8B4513', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 02', name: 'Chips dekoracyjny 02', hex: '#A0522D', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 03', name: 'Chips dekoracyjny 03', hex: '#CD853F', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 05', name: 'Chips dekoracyjny 05', hex: '#D2691E', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 07', name: 'Chips dekoracyjny 07', hex: '#8B0000', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 08', name: 'Chips dekoracyjny 08', hex: '#FF6347', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 09', name: 'Chips dekoracyjny 09', hex: '#4169E1', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 10', name: 'Chips dekoracyjny 10', hex: '#32CD32', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 11', name: 'Chips dekoracyjny 11', hex: '#FFD700', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 12', name: 'Chips dekoracyjny 12', hex: '#C0C0C0', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 13', name: 'Chips dekoracyjny 13', hex: '#800080', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 16', name: 'Chips dekoracyjny 16', hex: '#008080', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 17', name: 'Chips dekoracyjny 17', hex: '#FF1493', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 18', name: 'Chips dekoracyjny 18', hex: '#00CED1', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 19', name: 'Chips dekoracyjny 19', hex: '#FF8C00', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 20', name: 'Chips dekoracyjny 20', hex: '#9932CC', category: 'chips', manufacturer: 'Weber' },
    { code: 'Chips 21', name: 'Chips dekoracyjny 21', hex: '#8FBC8F', category: 'chips', manufacturer: 'Weber' },
  ]
}

async function populateColors() {
  console.log('🎨 Starting color database population...')

  try {
    // First, check if colors already exist
    const { data: existingColors, error: checkError } = await supabase
      .from('colors')
      .select('code')
      .limit(1)

    if (checkError) {
      console.error('Error checking existing colors:', checkError)
      return
    }

    if (existingColors && existingColors.length > 0) {
      console.log('✅ Colors already exist in database. Skipping population.')
      return
    }

    console.log('📥 No colors found. Populating database with comprehensive color palette...')

    const colors = getAllColors()

    // Convert hex to RGB values
    const colorsWithRgb = colors.map(color => {
      const hex = color.hex.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)

      return {
        code: color.code,
        name: color.name,
        hex: color.hex,
        rgb_r: r,
        rgb_g: g,
        rgb_b: b,
        category: color.category,
        image_path: null
      }
    })

    // Insert colors in batches of 50 to avoid timeout
    const batchSize = 50
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < colorsWithRgb.length; i += batchSize) {
      const batch = colorsWithRgb.slice(i, i + batchSize)
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(colorsWithRgb.length / batchSize)} (${batch.length} colors)`)

      const { data, error } = await supabase
        .from('colors')
        .insert(batch)
        .select()

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
        errorCount += batch.length
      } else {
        console.log(`✅ Successfully inserted ${data?.length || 0} colors in batch ${Math.floor(i / batchSize) + 1}`)
        successCount += data?.length || 0
      }
    }

    console.log(`🎉 Color population completed!`)
    console.log(`✅ Successfully inserted: ${successCount} colors`)
    console.log(`❌ Errors: ${errorCount} colors`)
    console.log(`📊 Total colors processed: ${colorsWithRgb.length}`)

    // Verify the insertion
    const { data: verifyData, error: verifyError } = await supabase
      .from('colors')
      .select('category')
      .limit(1000)

    if (!verifyError && verifyData) {
      const categoryCount = verifyData.reduce((acc, color) => {
        acc[color.category] = (acc[color.category] || 0) + 1
        return acc
      }, {})

      console.log('\n📈 Colors by category:')
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} colors`)
      })
    }

  } catch (error) {
    console.error('💥 Fatal error during color population:', error)
  }
}

// Run the population script
populateColors()
  .then(() => {
    console.log('🏁 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
